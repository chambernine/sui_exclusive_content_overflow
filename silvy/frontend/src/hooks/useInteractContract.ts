import { TESTNET_PACKAGE_ID } from "@/constant/constant";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { ADMIN_VAULT } from "@/constant/constant"
import { PublishStatus } from "@/types/interact";


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
  ): Promise<PublishStatus> {

    console.log(TESTNET_PACKAGE_ID)
    console.log(albumId, capId, blobId);
    const tx = new Transaction();
    tx.moveCall({
      target: `${TESTNET_PACKAGE_ID}::exclusive::publish`,
      arguments: [tx.object(albumId), tx.object(capId), tx.pure.string(blobId)],
    });

    tx.setGasBudget(10000000);

    
    return new Promise((resolve) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            // Check status
            if (result.effects?.status?.status === 'success') {
              resolve({ status: 'approved', result });
            } else {
              resolve({ status: 'failed', error: result.effects?.status?.error, result });
            }
          },
          onError: () => {
            resolve({ status: 'rejected' });
          }
        }
      );
    });
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
      target: `${TESTNET_PACKAGE_ID}::exclusive::support_album`,
      arguments: [
        tx.object(albumId), // &mut Album (shared)
        coin, // Coin<SUI>
        tx.pure.u64(fee), // u64
        tx.object(
          ADMIN_VAULT
        ), // &mut Vault (shared)
      ],
    });

    // 3. Optional: set budget
    tx.setGasBudget(10_000_000);
    console.log("execute tx ")
    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          console.log("Transaction successful:", await result);
        },
        onError: (error) => {
          console.error("Transaction failed:", error);
        }
      }
    );

  }

  async function findCapIdForAlbum(walletAddress: string, albumId: string) {
    const { data: ownedObjects } = await suiClient.getOwnedObjects({
      owner: walletAddress,
      options: {
        showType: true,
        showContent: true,
      },
    });
    
    for (const item of ownedObjects) {
      const type = item.data?.type;
      const content = item.data?.content;
      if (
        type?.includes(`${TESTNET_PACKAGE_ID}::execlusive::AlbumCap`) &&
        content?.dataType === "moveObject"
      ) {
        console.log("found album cap")
        console.log("items data: ",item.data)
        const fields = content.fields
        console.log(albumId)
        console.log("fields: ", fields)
        console.log(type)
        // if (fields. === albumId) {
        //   return item.data?.objectId;
        // }
      }
    
    }
  
    throw new Error(`❌ capId not found for albumId ${albumId}`);
  }

  return { publishBlobsToAlbum, CreateSupportAlbumTx, findCapIdForAlbum };
}
