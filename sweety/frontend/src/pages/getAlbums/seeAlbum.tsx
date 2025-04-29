import { useEffect, useState } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { useParams } from 'react-router-dom'; // If you are using react-router


export default function SeeAlbum() {
  const suiClient = useSuiClient();
  const { objectId } = useParams<{ objectId: string }>(); // capture objectId from the URL
  const [objectData, setObjectData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchObjectDetails() {
      try {
        const object = await suiClient.getObject({
          id: "0x3aa43958df02f975e9ce3983d08fa90b3d5d7366cedf82fd83729465023c3574",
          options: {
            showType: true,
            showOwner: true,
            showPreviousTransaction: true,
            showContent: true,
            showStorageRebate: true,
          },
        });

        console.log(object);
        setObjectData(object as any);
      } catch (error) {
        console.error("Failed to fetch object:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchObjectDetails();
  }, [objectId]);

  if (loading) {
    return <div className="p-6">Loading album details...</div>;
  }

  if (!objectData) {
    return <div className="p-6">No album found.</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🎶 Album Details</h2>
      <pre className="bg-gray-800 text-white p-4 rounded">{JSON.stringify(objectData, null, 2)}</pre>
    </div>
  );
}