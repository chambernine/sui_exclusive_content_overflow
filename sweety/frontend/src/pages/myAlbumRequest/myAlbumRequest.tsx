import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DraftAlbumStatus, AlbumTier } from "@/types/album";
import { useSuiAccount } from "@/hooks/useSuiAccount"; // your custom wallet hook
import { WaitForSignPublishResponse } from "@/types/interact";
import useInteractContract from "@/hooks/useInteractContract";

interface Album {
  id: string;
  albumId: string;
  name: string;
  tier: number;
  owner: string;
  price: number;
  description: string;
  tags: string[];
  status: DraftAlbumStatus;
  contentInfos: string[];
  contents: string[];
  created_at: { seconds: number; nanoseconds: number }; // Firestore Timestamp
}

export default function MyAlbumRequest() {
  const { address } = useSuiAccount(); // 👈 Get current user address
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const { publishBlobsToAlbum }  = useInteractContract()

  const fetchMyAlbums = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/my-album/${address}`
      );
      const allAlbums = response.data.data;
      setAlbums(allAlbums);
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (album: Album) => {
    try {
      const response = await axios.patch(`http://localhost:3000/my-album/request-publish`,
        JSON.stringify(album),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.status === 200) {
        const waitforSign: WaitForSignPublishResponse = response.data.data
        console.log(response.data)
        waitforSign.walrusObjectIds.map(async (walrusObjectId)=>{
          await publishBlobsToAlbum(waitforSign.albumId, waitforSign.capId, walrusObjectId)
        })    
      }
      setAlbums((prev) => prev.filter((a) => a.albumId !== album.albumId));
      alert("✅ Published Successfully!");
    } catch (err) {
      console.error("❌ Failed to publish album:", err);
      alert("Failed to publish album. See console.");
    }
  };

  const formatTimestamp = (ts: Album["created_at"]) => {
    return new Date(ts.seconds * 1000).toLocaleString();
  };

  useEffect(() => {
    if (address) {
      fetchMyAlbums();
    }
  }, [address]);

  return (
    <div className="p-6 text-gray-800">
      <h2 className="text-2xl font-semibold mb-4">
        📀 My Albums Ready to Publish
      </h2>

      {!address && loading ? (
        <p>connect to wallet first</p>
      ) : albums.length === 0 && loading ? (
        <p>loading...</p>
      ) : albums.length === 0 && !loading ? (
        <>
            user no album in db
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {albums.map((album) => (
            <Card
              key={album.albumId}
              className="bg-gray-900 border border-gray-700 text-white"
            >
              <CardHeader>
                <CardTitle className="text-lg">{album.name}</CardTitle>
                <p className="text-sm text-gray-400">
                  Tier: {AlbumTier[album.tier]}
                </p>
                <p className="text-sm text-gray-400">Price: {album.price} 💰</p>
                <p className="text-sm text-gray-400">
                  Created: {formatTimestamp(album.created_at)}
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm">{album.description}</p>

                {album.contentInfos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {album.contentInfos.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`preview-${i}`}
                        className="h-28 w-full object-cover rounded border border-gray-700"
                      />
                    ))}
                  </div>
                )}

                {/* 🛫 Publish Button */}
                <Button
                  disabled={album.status !== 2}

                  onClick={() => {
                    handlePublish(album)
                  }}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  🚀 {album.status === 2 ? "Publish Album" : "wait for approve"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
