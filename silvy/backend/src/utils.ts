import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "./constant.js";
import { keypair, sealServer, suiServer, walrusServer } from "./suiConfig.js";
import { fromHex, toHex } from "@mysten/sui/utils";
import type { WalrusObjectResponse } from "./type.js";

async function createAlbum(
  name: string,
  price: number,
  owner: string
): Promise<{ albumId: string; capId: string }> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::exclusive::create_album_entry`,
    arguments: [
      tx.pure.string(name),
      tx.pure.u64(price * 1_000_000_000),
      tx.pure.address(owner),
    ],
  });
  tx.setGasBudget(10000000);

  const response = await suiServer.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
      showInput: true,
      showRawInput: true,
      showBalanceChanges: true,
      showEvents: true,
      showRawEffects: true,
    },
  });
  const createdObjects = response.effects?.created ?? [];

  let albumId = "";
  let capId = "";

  for (const item of createdObjects) {
    if (item.owner && typeof item.owner === "object") {
      if ("Shared" in item.owner) {
        albumId = item.reference.objectId;
      }
      if ("AddressOwner" in item.owner) {
        capId = item.reference.objectId;
      }
    }
  }
  return { albumId, capId };
}

async function sealEncryptions(albumId: string, contents: string[]) {
  const encryptedBytes = await Promise.all(
    contents.map(async (content: string) => {
      const fileBytes = base64ToBytes(content);
      const nonce = crypto.getRandomValues(new Uint8Array(5));
      const albumIdBytes = fromHex(albumId);
      const id = toHex(new Uint8Array([...albumIdBytes, ...nonce]));

      const { encryptedObject } = await sealServer.encrypt({
        threshold: 2,
        packageId: PACKAGE_ID,
        id,
        data: fileBytes,
      });

      return encryptedObject;
    })
  );
  return encryptedBytes;
}

async function publishWalrus(
  encryptedBlobs: Uint8Array<ArrayBufferLike>[],
) {
  let responses: WalrusObjectResponse[] = [];
  for (const encryptedBlob of encryptedBlobs) {
    try {
      console.log("stroing blob")
      const { info } = await storeBlob(encryptedBlob)
      const blobData = info.newlyCreated.blobObject

      const response: WalrusObjectResponse = {
        ...blobData,
        id: blobData.id,
        storage: {
          ...blobData.storage,
        },
        blob_id: blobData.blobId,
        resourceOperation: info.resourceOperation,
        cost: info.cost,
      };
      responses.push(response);
    } catch (error) {
      console.error("❌ Failed to publish walrus blob:", error);
    }
  }
  return responses;
}

function base64ToBytes(base64String: string): Uint8Array {
  const arr = base64String.split(",");
  const b64 = arr[arr.length - 1];
  return new Uint8Array(Buffer.from(b64, "base64"));
}

function base64ToUint8Array(base64String: string): Uint8Array {
  const arr = base64String.split(",");
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return u8arr
}

const storeBlob = async (encryptedData: Uint8Array) => {
  return fetch(`https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=7`, {
    method: 'PUT',
    body: encryptedData,
  }).then((response) => {
    if (response.status === 200) {
      return response.json().then((info) => {
        return { info };
      });
    } else {
      throw new Error('Something went wrong when storing the blob!');
    }
  });
};


export { createAlbum, sealEncryptions, publishWalrus, base64ToBytes as base64ToFile };
