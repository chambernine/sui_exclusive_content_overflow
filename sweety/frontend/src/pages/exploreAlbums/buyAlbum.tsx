import { DOMAIN_DEV } from "@/constant/constant";
import useInteractContract from "@/hooks/useInteractContract";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Album {
  albumId: string;
  name: string;
  owner: string;
  tier: number;
  price: number;
  description: string;
  tags: string[];
  contentInfos: string[];
  interaction: {
    likes: number;
    shares: number;
    saves: number;
  };
}

const onPurchaseAlbum = async (albumId: string, address: string) => {
  await fetch(`${DOMAIN_DEV}/explore-album/purchase/${albumId}/${address}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

export default function BuyAlbum() {
  const { albumId } = useParams();
  const { address } = useSuiAccount(); 
  const [album, setAlbum] = useState<Album | null>(null);
  const { CreateSupportAlbumTx } = useInteractContract()
  
  useEffect(() => {
    const fetchAlbum = async () => {
      const res = await fetch(`${DOMAIN_DEV}/explore-album/${albumId}`);
      const json = await res.json();
      setAlbum(json.data);
    };
    fetchAlbum();
  }, [albumId]);

  if (!album) return <p>Loading...</p>;

  return (
    <section className="p-6 flex flex-col md:flex-row gap-8">
      {/* Left: Image */}
      <div className="flex-1">
        {album.contentInfos[0] ? (
          <img
            src={album.contentInfos[0]}
            alt="Album Preview"
            className="w-full rounded-lg shadow"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 rounded" />
        )}
      </div>

      {/* Right: Details */}
      <div className="flex-1 space-y-4">
        <h1 className="text-3xl font-bold">{album.name}</h1>
        <p className="text-gray-600">{album.description}</p>
        <p className="text-blue-600 text-lg">Price: {album.price } SUI</p>
        <p className="text-sm text-gray-500">Tier: {album.tier}</p>

        <div className="flex gap-4 text-gray-600 text-sm">
          <span>❤️ {album.interaction.likes}</span>
          <span>🔁 {album.interaction.shares}</span>
          <span>💾 {album.interaction.saves}</span>
        </div>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={async () =>{
            if (!address) {
              alert("Please connect your wallet first.");
              return;
            }
            console.log("albumId", album.albumId)
            await CreateSupportAlbumTx(album.albumId, album.price * 1_000_000_000, 20)
            await onPurchaseAlbum(album.albumId, address);
          }}
        >
          🛒 Buy Album
        </button>
      </div>
    </section>
  );
}