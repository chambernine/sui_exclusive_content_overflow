import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useSuiAccount } from "../../hooks/useSuiAccount";
import { PublishedAlbum } from "../../types/album";
import { useNavigate } from "react-router-dom";
import {
  ConnectButton,
  useSignPersonalMessage,
  useSuiClient,
} from "@mysten/dapp-kit";
import { getAllowlistedKeyServers, SealClient, SessionKey } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex } from "@mysten/sui/utils";

import { DOMAIN_DEV, TESTNET_PACKAGE_ID } from "@/constant/constant";
import { downloadAndDecrypt, MoveCallConstructor } from "@/utils/utils";

const TTL_MIN = 10;

export default function MyPurchasedAlbums() {
  const [purchasedAlbums, setPurchasedAlbums] = useState<PublishedAlbum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useSuiAccount();
  const navigate = useNavigate();
  const suiClient = useSuiClient();
  //   const packageId = useNetworkVariable("packageId");
  const { mutate: signPersonalMessage } = useSignPersonalMessage();

  // States for decryption functionality
  const [decryptedFileUrls, setDecryptedFileUrls] = useState<string[]>([]);
  const [currentSessionKey, setCurrentSessionKey] = useState<SessionKey | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<PublishedAlbum | null>(
    null
  );
  const [reloadKey, setReloadKey] = useState(0);

  // Initialize SealClient
  const client = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers("testnet"),
    verifyKeyServers: false,
  });

  useEffect(() => {
    const fetchPurchasedAlbums = async () => {
      if (!address) {
        setError("Please connect your wallet to view your purchased albums");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${DOMAIN_DEV}/my-album/purchase/${address}`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setPurchasedAlbums(data.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch purchased albums:", err);
        setError(
          "Failed to load your purchased albums. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedAlbums();
  }, [address]);

  // Function to construct the move call for album content
  function constructMoveCall(albumId: string): MoveCallConstructor {
    return (tx: Transaction, id: string) => {
      tx.moveCall({
        target: `${TESTNET_PACKAGE_ID}::exclusive::seal_approve`,
        arguments: [tx.pure.vector("u8", fromHex(id)), tx.object(albumId)],
      });
    };
  }

  // Function to view album content
  const onViewAlbumContent = async (album: PublishedAlbum) => {
    console.log("Album content:", album);

    // if (!album.contentInfo || album.contentInfo.length === 0) {
    //   setError("This album doesn't have any content available for viewing");
    //   return;
    // }
    setSelectedAlbum(album);
    const blobIds = album.contentsObjectId;

    if (
      currentSessionKey &&
      !currentSessionKey.isExpired() &&
      currentSessionKey.getAddress() === address
    ) {
      const moveCallConstructor = constructMoveCall(album.albumId);
      downloadAndDecrypt(
        blobIds,
        currentSessionKey,
        suiClient,
        client,
        moveCallConstructor,
        setError,
        setDecryptedFileUrls,
        setIsDialogOpen,
        setReloadKey
      );
      return;
    }
    setCurrentSessionKey(null);
    const sessionKey = new SessionKey({
      address: address!,
      packageId: TESTNET_PACKAGE_ID,
      ttlMin: TTL_MIN,
    });

    try {
      signPersonalMessage(
        {
          message: sessionKey.getPersonalMessage(),
        },
        {
          onSuccess: async (result) => {
            await sessionKey.setPersonalMessageSignature(result.signature);
            const moveCallConstructor = constructMoveCall(album.albumId);
            await downloadAndDecrypt(
              blobIds,
              sessionKey,
              suiClient,
              client,
              moveCallConstructor,
              setError,
              setDecryptedFileUrls,
              setIsDialogOpen,
              setReloadKey
            );
            setCurrentSessionKey(sessionKey);
          },
        }
      );
    } catch (error: any) {
      console.error("Error while trying to decrypt content:", error);
      setError(error.message || "Failed to decrypt album content");
    }
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-6">
          <ConnectButton />
          Please connect your wallet to view your purchased albums
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (purchasedAlbums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">No Purchased Albums</h2>
        <p className="text-gray-600 mb-6">
          You haven't purchased any albums yet
        </p>
        <Button onClick={() => navigate("/explore")}>Explore Albums</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Purchased Albums</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purchasedAlbums.map((album) => (
          <Card key={album.albumId} className="overflow-hidden">
            <div className="aspect-square relative overflow-hidden bg-gray-100 flex items-center justify-center">
              {/* Album cover image placeholder - you may add an actual cover image field to your API response */}
              <div className="text-6xl text-gray-400">🎵</div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold">{album.name}</h3>
              <p className="text-gray-600">
                Tier: {getAlbumTierName(album.tier)}
              </p>
              <p className="mt-2 line-clamp-2">{album.description}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/myPurchase/${album.albumId}`)}
                >
                  View Details
                </Button>
                <Button
                  className="flex-1"
                  variant="secondary"
                  onClick={() => onViewAlbumContent(album)}
                >
                  View Content
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal for displaying decrypted content */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">
              {selectedAlbum?.name} - Content
            </h3>

            {decryptedFileUrls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {decryptedFileUrls.map((url, index) => (
                  <div
                    key={`${index}-${reloadKey}`}
                    className="border rounded overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`Content ${index + 1}`}
                      className="w-full h-auto"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8">Loading content...</p>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => {
                  setIsDialogOpen(false);
                  setDecryptedFileUrls([]);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to convert album tier number to readable name
function getAlbumTierName(tier: number): string {
  switch (tier) {
    case 0:
      return "Standard";
    case 1:
      return "Premium";
    case 2:
      return "Exclusive";
    case 3:
      return "Principle";
    default:
      return "Unknown";
  }
}
