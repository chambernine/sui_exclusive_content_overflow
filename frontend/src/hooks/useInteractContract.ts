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
    console.log(albumId, capId, blobId);
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
          console.log("Transaction successful:", await result);
        },
      }
    );
  }

  async function CreateSupportAlbumTx(
    albumId: string,
    paymentAmount: number,
    fee: number
  ) {
    const tx = new Transaction();

    // 1. Add coin for payment
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(paymentAmount)]);

    // 2. Call the entry function
    tx.moveCall({
      target: `${TESTNET_PACKAGE_ID}::albums::support_album`,
      arguments: [
        tx.object(albumId), // &mut Album (shared)
        coin, // Coin<SUI>
        tx.pure.u64(fee), // u64
        tx.object(
          "0x6ab6896e7d80a0f8e0bf679583bfa95c11785586ad195ed65cd3b8dc107f0c18"
        ), // &mut Vault (shared)
      ],
    });

    // 3. Optional: set budget
    tx.setGasBudget(10_000_000);

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          console.log("Transaction successful:", await result);
        },
      }
    );

  }

  return { publishBlobsToAlbum, CreateSupportAlbumTx };
}
