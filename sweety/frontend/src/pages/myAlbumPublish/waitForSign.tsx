import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import useInteractContract from "@/hooks/useInteractContract";
import type { DraftAlbum } from "@/types/album";

export default function PublishDraftAlbum() {
  const { albumId } = useParams();
  const { address } = useSuiAccount();
  const { publishBlobsToAlbum, findCapIdForAlbum } = useInteractContract();
  const [album, setAlbum] = useState<DraftAlbum | null>(null);

  // Fetch draft album
  const fetchAlbum = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/draft-album/${albumId}`
      );
      setAlbum(res.data.data);
    } catch (err) {
      console.error("Error loading album:", err);
    } finally {
      setLoading(false);
    }
  };

  // Called after signing
  const markBlobAsPublished = async (blobId: string) => {
    try {
      await axios.patch(
        `http://localhost:3000/my-album/publish/${albumId}/${blobId}`
      );
      await fetchAlbum(); // Refresh data
    } catch (err) {
      console.error("❌ Failed to update backend publish state:", err);
    }
  };

  useEffect(() => {
    (async () => {
      if (albumId && address) {
        console.log("Address:", address);
        console.log("getting cap")
        await findCapIdForAlbum(address, albumId);
      }
    })();
  },[address,albumId]);

  useEffect(() => {
    if (albumId && address) {
      fetchAlbum();
    }
  }, [albumId, address]);

  if (!album) return <p className="p-6">❌ Album not found.</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{album.name}</h1>
      <p className="text-gray-600">{album.description}</p>
      <p>Tier: {album.tier}</p>
      <p>Price: {album.price} SUI</p>
      <p>
        Created At: {new Date(album.created_at.seconds * 1000).toLocaleString()}
      </p>

      <h2 className="text-xl mt-6 font-semibold">🔐 Pending Blob Signatures</h2>
      <div className="space-y-3">
        {album.publishedBlobs?.map((blob) => (
          <div
            key={blob.blobId}
            className="flex items-center justify-between p-4 border rounded bg-white"
          >
            <div>
              <p className="text-sm font-mono">{blob.blobId}</p>
              <p className="text-xs text-gray-500">
                Status: {blob.ispublished ? "✅ Published" : "⏳ Waiting"}
              </p>
            </div>
            {!blob.ispublished && (
              <Button
                onClick={async () => {
                  try {
                    await publishBlobsToAlbum(
                      album.albumId,
                      album.capId!,
                      blob.blobId
                    );
                    await markBlobAsPublished(blob.blobId); // sync with backend
                  } catch (err) {
                    console.error("Error during sign + publish:", err);
                  }
                }}
              >
                ✍️ Sign & Publish
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
