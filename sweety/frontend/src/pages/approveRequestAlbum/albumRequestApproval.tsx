import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlbumTier, DraftAlbum } from "@/types/album";

import { useSuiAccount } from "@/hooks/useSuiAccount";

// interface Album {
//   id: string;
//   albumId: string;
//   name: string;
//   tier: number;
//   owner: string;
//   price: number;
//   description: string;
//   tags: string[];
//   status: DraftAlbumStatus;
//   contentInfos: string[];
//   contents: string[];
//   created_at: { seconds: number; nanoseconds: number }; // Timestamp from Firestore
// }

export default function AlbumRequestApproval() {
  const [albums, setAlbums] = useState<DraftAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const { address } = useSuiAccount();

  const fetchAlbums = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/draft-album-approval/${address}`
      );
      console.log(res.data.data)
      setAlbums(res.data.data);
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (albumID: string) => {
    try {
      const response = await axios.patch(`http://localhost:3000/draft-album-approval/${albumID}/${address}`);
      console.log(albumID)
      alert (response.data.message)
      setAlbums((prev) => prev.filter((a) => a.id !== albumID));
    } catch (err) {
      console.error("❌ Failed to approve album:", err);
    }
  };

  const formatTimestamp = (ts: DraftAlbum["created_at"]) => {
    return new Date(ts.seconds * 1000).toLocaleString();
  };

  useEffect(() => {
    if (address !== undefined) fetchAlbums();
  }, [address]);

  return (
    <div className="p-6 text-gray-800">
      <h2 className="text-2xl font-semibold mb-4">
        🛂 Album Approval Requests
      </h2>

      {loading && !address ? (
        <p>Connect to wallet first</p>
      ) : albums.length === 0 ? (
        <p>No pending albums found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {albums.map((album) => (
            <Card
              key={album.id}
              className="bg-gray-900 border border-gray-700"
            >
              <CardHeader>
                <CardTitle className="text-lg">{album.name}</CardTitle>
                <p className="text-sm text-gray-400">Owner: {album.owner}</p>
                <p className="text-sm text-gray-400">
                  Tier: {AlbumTier[album.tier]}
                </p>
                <p className="text-sm text-gray-400">Price: {album.price} 💰</p>
                <p className="text-sm text-gray-400">
                  Created: {formatTimestamp(album.created_at)}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  Tags: {album.tags?.join(", ") || "None"}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm">{album.description}</p>
                <div>content infomation</div>
                {album.contentInfos?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {album.contentInfos.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`content-${i}`}
                        className="h-28 w-full object-cover rounded border border-gray-700"
                      />
                    ))}
                  </div>
                )}

                <div>contents</div>
                {
                  <div className="grid grid-cols-2 gap-2">
                    {album.contents.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`content-${i}`}
                        className="h-28 w-full object-cover rounded border border-gray-700"
                      />
                    ))}
                  </div>
                }
                <div>click to approve</div>
                <Button
                  className="mt-2 w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(album.id)}
                >
                  Approve
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
