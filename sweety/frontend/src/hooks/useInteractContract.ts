import { TESTNET_PACKAGE_ID } from "@/constant/constant";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

export default function useInteractContract() {
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showEffects: true,
        },
      }),
  });

  async function publishBlobsToAlbum(
    albumId: string,
    capId: string,
    blobId: string
  ) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${TESTNET_PACKAGE_ID}::albums::publish`,
      arguments: [tx.object(albumId), tx.object(capId), tx.pure.string(blobId)],
    });
    tx.setGasBudget(10000000);

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          console.log("Transaction successful:", result);
        },
      }
    );
  }

  return { publishBlobsToAlbum };
}
