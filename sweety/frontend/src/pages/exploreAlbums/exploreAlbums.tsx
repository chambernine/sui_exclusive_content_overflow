import { DOMAIN_DEV } from "@/constant/constant";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

export default function ExploreAlbums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ For redirects

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await fetch(`${DOMAIN_DEV}/explore-albums`);
        const json = await res.json();
        setAlbums(json.data);
      } catch (err) {
        console.error("❌ Failed to fetch albums:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-4">🌐 Explore Albums</h2>

      {loading ? (
        <p>Loading albums...</p>
      ) : albums.length === 0 ? (
        <p>No albums found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map((album) => (
            <div
              key={album.albumId}
              className="bg-white border rounded-lg shadow p-4 flex flex-col"
            >
              <h3 className="text-xl font-semibold mb-1">{album.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{album.description}</p>
              <p className="text-sm text-blue-600">
                Price: {album.price / 1e9} SUI
              </p>
              <p className="text-sm text-gray-500 mb-2">Tier: {album.tier}</p>

              {album.contentInfos?.[0] && (
                <img
                  src={album.contentInfos[0]}
                  alt="Preview"
                  className="mt-2 rounded w-full h-36 object-cover border"
                />
              )}

              <div className="flex justify-around mt-4 text-gray-600 text-sm">
                <div className="flex items-center gap-1">
                  ❤️ <span>{album.interaction.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  🔁 <span>{album.interaction.shares}</span>
                </div>
                <div className="flex items-center gap-1">
                  💾 <span>{album.interaction.saves}</span>
                </div>
              </div>
              <button
                className="mt-4 bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
                onClick={() => navigate(`/explore-albums/${album.albumId}`)}
              >
                🛒 Buy
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
