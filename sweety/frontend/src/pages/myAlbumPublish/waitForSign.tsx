import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import useInteractContract from "@/hooks/useInteractContract";
import type { DraftAlbum } from "@/types/album";
import { PublishStatus } from "@/types/interact";
import { DOMAIN_DEV } from "@/constant/constant";

export default function PublishDraftAlbum() {
  const { albumId: dbId } = useParams();
  const { address } = useSuiAccount();
  const { publishBlobsToAlbum } = useInteractContract();
  const [isLoading, setLoading] = useState(false);
  const [album, setAlbum] = useState<DraftAlbum | null>(null);
  console.log("getting album id: ", dbId);
  // Fetch draft album
  const fetchAlbum = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${DOMAIN_DEV}/draft-album/${dbId}`
      );
      console.log(res.data.data)
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
        `${DOMAIN_DEV}/my-album/publish/${dbId}/${blobId}`
      );
      await fetchAlbum(); // Refresh data
    } catch (err) {
      console.error("❌ Failed to update backend publish state:", err);
    }
  };

  const onPublishAlbumOnChain = async () => {
    if (!album) return;
    await axios.patch(
      `${DOMAIN_DEV}/my-album/publish`,
      {id: dbId},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  };

  // useEffect(() => {
  //   (async () => {
  //     if (dbId && address && album && album.albumId) {
  //       console.log("Address:", address);
  //       console.log("getting cap");
  //       await findCapIdForAlbum(address, album.albumId);
  //     }
  //   })();
  // }, [address, dbId, findCapIdForAlbum]);

  useEffect(() => {
    if (dbId && address) {
      fetchAlbum();
    }
  }, [dbId, address]);

  if (isLoading) return <p className="p-6">Loading...</p>;
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
      <div>
        <Button
          className="bg-blue-400"
          onClick={async () => {
            console.log("Publishing album on chain...");
            setLoading(true);
            await onPublishAlbumOnChain();
            await fetchAlbum();
            setLoading(false);
          }}
          disabled={
            album.albumId !== undefined &&
            album.publishedBlobs &&
            album.publishedBlobs.length > 0
          }
        >
          Click to publih album & content
        </Button>
      </div>
      <div>
        {album.albumId && (
          <p className="text-sm text-gray-500">Album ID: {album.albumId}</p>
        )}
      </div>
      <div className="space-y-3">
        {album.publishedBlobs?.map((blob) => (
          <div
            key={blob.blobId}
            className="flex items-center justify-between p-4 border rounded bg-blue-400"
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
                    if (!album.albumId) return;

                    const txResult: PublishStatus = await publishBlobsToAlbum(
                      album.albumId,
                      album.capId!,
                      blob.blobId
                    );

                    if (txResult.status === "approved") {
                      // Success logic
                      await markBlobAsPublished(blob.blobId);
                    } else if (txResult.status === "failed") {
                      // Failed logic
                      alert("Transaction failed. Check console.");
                    } else if (txResult.status === "rejected") {
                      // Rejected logic
                      alert("Transaction rejected. Check console.");
                    }
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
