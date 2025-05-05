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
    target: `${PACKAGE_ID}::execlusive::create_album_entry`,
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
    contents.map(async (content: string, index: number) => {
      const file = await base64ToFile(
        content,
        `image_${index}.png`,
        "image/png"
      );
      const arrayBuffer = await file.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer);

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
  const epoch = 2;
  let responses: WalrusObjectResponse[] = [];
  for (const encryptedBlob of encryptedBlobs) {
    try {
      const { storageCost, writeCost } = await walrusServer.storageCost(
        encryptedBlob.length,
        epoch
      );
      console.log("published walrus")
      const { blobObject, blobId } = await walrusServer.writeBlob({
        blob: encryptedBlob,
        deletable: true,
        epochs: epoch,
        signer: keypair,
        owner: keypair.toSuiAddress(),
      });
      
      const response: WalrusObjectResponse = {
        ...blobObject,
        id: blobObject.id.id,
        storage: {
          ...blobObject.storage,
          id: blobObject.storage.id.id,
        },
        blob_id: blobId,
        resourceOperation: {
          registerFromScratch: {
            encodedLength: blobObject.storage.storage_size,
            epochsAhead: epoch,
          },
        },
        cost: Number(storageCost + writeCost),
      };
      responses.push(response);
    } catch (error) {
      console.log("something wrong in here ")
    }
  }
  return responses;
}

function base64ToFile(
  base64String: string,
  filename: string,
  mimeType: string
): File {
  const arr = base64String.split(",");
  const mime = mimeType || arr[0].match(/:(.*?);/)?.[1] || "";
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

export { createAlbum, sealEncryptions, publishWalrus, base64ToFile };