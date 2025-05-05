import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlbumTier, DraftAlbum } from "@/types/album";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { useNavigate } from "react-router-dom";

export default function MyAlbumRequest() {
  const { address } = useSuiAccount();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<DraftAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyAlbums = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/my-album/${address}`
      );
      const allAlbums = response.data.data;
      console.log(allAlbums)
      setAlbums(allAlbums);
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (ts: DraftAlbum["created_at"]) => {
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
        <>user no album in db</>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {albums.map((album) => (
            <Card
              key={album.id}
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
                {/* 🛫 Publish Button */}
                <Button
                  disabled={album.status !== 2}
                  onClick={() => {
                    navigate(`/my-request/${album.id}`);
                  }}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  🚀 Sign to publish
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
