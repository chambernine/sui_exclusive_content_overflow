import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { firestoreDb } from "./firebaseAdmin.js";
import type { DraftAlbum, IFormData, WalrusObjectResponse } from "./type.js";
import { suiServer, keypair, sealServer, walrusServer } from "./suiConfig.js";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "./constant.js";
import { fromHex, toHex } from "@mysten/sui/utils";
import { base64ToFile } from "./utils.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// checking if user already in profile db return IProfile or null never existed
app.post("/edit-profile", async (c) => {
  const body = await c.req.formData();
  const socialLinks = {
    x: body.get("social_links[x]")?.toString() || "",
    twitch: body.get("social_links[twitch]")?.toString() || "",
    ig: body.get("social_links[instragram]")?.toString() || "",
    youtube: body.get("social_links[youtube]")?.toString() || "",
  };

  const form: IFormData = {
    walletAddress: body.get("walletAddress")?.toString() || "",
    username: body.get("username")?.toString() || "",
    description: body.get("description")?.toString() || "",
    profile_image_file: body.get("profile_image_file")?.toString() ?? "",
    banner_image_files:
      body.getAll("banner_image_files[]").map((file) => file.toString()) ?? [],
    socialLinks: socialLinks,
  };
  console.log("form :", form);
  // Here you’d normally update Firestore, Supabase, etc.

  await firestoreDb.collection("user-profile").doc(form.walletAddress).set({
    userAddress: form.walletAddress,
    username: form.username,
    description: form.description,
    profileImageBase64: form.profile_image_file,
    bannerImagesBase64: form.banner_image_files,
    socialLinks: form.socialLinks,
    createdAt: Date.now(),
  });

  return c.json({
    status: 200,
  });
});

app.post("/draft-album/request-approval", async (c) => {
  const body: DraftAlbum = await c.req.json();

  // const draftAlbum: DraftAlbum= {
  //   albumId: body.albumId,
  //   owner: body.owner,
  //   name: body.name,
  //   tier: body.tier,
  //   price: body.price,
  //   description: body.description,
  //   tags: body.tags,
  //   status: body.status,
  //   contentInfos: body.contentInfos,
  //   contents: body.contents,
  //   created_at: body.created_at,
  // }
  await firestoreDb.collection("draft-album").doc(body.albumId).set({
    albumId: body.albumId,
    owner: body.owner,
    name: body.name,
    tier: body.tier,
    price: body.price,
    description: body.description,
    tags: body.tags,
    status: body.status,
    contentInfos: body.contentInfos,
    contents: body.contents,
    created_at: body.created_at,
  });

  return c.json({
    status: 200,
  });
});

app.get("/my-album/:owner", async (c) => {
  try {
    const { owner } = c.req.param();
    const snapshot = await firestoreDb
      .collection("draft-album")
      .where("owner", "==", owner)
      .get();

    const albums = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return c.json({
      status: 200,
      data: albums,
    });
  } catch (err) {
    console.error("🔥 Error fetching approvals:", err);
    return c.json({ status: 500, error: "Internal Server Error" });
  }
});

// async function publishToWalrus(contents: string[]): Promise<string> {
//   const body = await c.req.arrayBuffer();
//   const blob = new Uint8Array(body);
//   const epochs = Number.parseInt(c.req.query('epochs') ?? '3', 10);
//   const sendObjectTo = c.req.query('send_object_to');
//   const deletable = c.req.query('deletable') === 'true';

//   const { storageCost, writeCost } = await walrusClient.storageCost(blob.length, epochs);

//   const { blobObject } = await walrusClient.writeBlob({
//     blob,
//     deletable,
//     epochs,
//     signer: keypair,
//     owner: sendObjectTo ?? keypair.toSuiAddress(),
//   });

//   // Match the format of the rust based aggregator
//   return c.json({
//     newlyCreated: {
//       ...blobObject,
//       id: blobObject.id.id,
//       storage: {
//         ...blobObject.storage,
//         id: blobObject.storage.id.id,
//       },
//     },
//     resourceOperation: {
//       registerFromScratch: {
//         encodedLength: blobObject.storage.storage_size,
//         epochsAhead: epochs,
//       },
//     },
//     cost: Number(storageCost + writeCost),
//   });
// }

async function createAlbum(name: string, price: number, owner: string): Promise<{albumId: string, capId: string}> {
  console.log("creating album")
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::albums::create_album_entry`,
    arguments: [
      tx.pure.string(name),
      tx.pure.u64(price),
      tx.pure.address(owner)
    ],
  })
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
  })
  const createdObjects = response.effects?.created ?? [];

  let albumId = "";
  let capId = "";

  for (const item of createdObjects) {
    console.log(item)
    if (item.owner && typeof item.owner === 'object') {
      if ('Shared' in item.owner) {
        albumId = item.reference.objectId;
      }
      if ('AddressOwner' in item.owner) {
        capId = item.reference.objectId;
      }
    }
  }
  console.log(albumId, capId)
  return { albumId, capId };
}

async function sealEncryptions(albumId: string, contents: string[]){ 
  console.log("perform encryption phase")
  
  const encryptedBytes = await Promise.all(
    contents.map(async (content: string, index: number) => {
      const file = await base64ToFile(content, `image_${index}.png`, "image/png");
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

  return encryptedBytes
}

async function publishWalrus(encryptedBlobs: Uint8Array<ArrayBufferLike>[], creator: string) {
  console.log("storingencrypted album to walrus");
  const epoch = 3;
  let responses: WalrusObjectResponse[] = [];
  let index = 1
  console.log("start storing ",index, encryptedBlobs);
  
  for (const encryptedBlob of encryptedBlobs) {
    // let attempts = 0;
    // let success = false;
    // while (attempts < 3 && !success) {
      try {
        const { storageCost, writeCost } = await walrusServer.storageCost(encryptedBlob.length, epoch);
        console.log(encryptedBlob)
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
        console.log(blobObject)
        responses.push(response);
        // success = true;
      } catch (error) {
        // console.error("❌ Retry attempt", attempts + 1, ":", error);
        // attempts++;
        // await new Promise(res => setTimeout(res, 1000)); // wait 1 sec between retries
      }
    }
  console.log(responses);  
  return responses;
}

async function publishBlobsToAlbum(albumId: string, capId: string, blobId: string) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::albums::publish`,
    arguments: [tx.object(albumId), tx.object(capId), tx.pure.string(blobId)],
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
  })
  console.log(response)
}

app.patch("/my-album/request-publish", async (c) => {
  try {
    const body = await c.req.json();
    const album: DraftAlbum = {
      ...body
    }
    const draftDocRef = firestoreDb.collection("draft-album").doc(album.albumId);
    if (!draftDocRef) {
      return c.json({ status: 404, error: "Draft album not found" });
    }
    const { albumId: albumAccessId, capId } = await createAlbum(album.name, album.price, album.owner)
    const encryptedBlobs = await sealEncryptions(albumAccessId, album.contents)    
    console.log("encryptedBlobs done", encryptedBlobs)
    const walrusObjectIds: WalrusObjectResponse[] = await publishWalrus(encryptedBlobs, album.owner) 
    // console.log("walrus object published done wait for push to album list")
    // walrusObjectIds.forEach(async (walrusObjectId) => {
    //   // console.log("sent to walrus ObjectId to ", albumAccessId, capId, walrusObjectId.blob_id)
    //   await publishBlobsToAlbum(albumAccessId, capId, walrusObjectId.blob_id)  
    // })
    if (walrusObjectIds.length < 0) {
      throw new Error("❌ Failed to publish album");
    }

    // const newAlbumData = {
    //   albumId: albumAccessId,
    //   owner: album.owner,
    //   name: album.name,
    //   tier: album.tier,
    //   price: album.price,
    //   description: album.description,
    //   tags: album.tags,
    //   contentInfos: album.contentInfos,
    //   contentsObjectId: walrusObjectIds,
    //   created_at: album.created_at,
    // };
    // draftDocRef.delete()

    // await firestoreDb.collection("albums").doc(albumAccessId).set(newAlbumData);

    //return to sign message to publish walrus object to albumId
    //cannot done it on server side due to invalid sign owner address of cap and server keypair
    return c.json({
      status: 200,
      message: `✅ Album ${album.albumId} published by ${album.owner}`,
      data: {
        albumId: albumAccessId,
        capId: capId,
        walrusObjectIds
      }
    })
  } catch (error) {
    console.error("🔥 Error publishing album:", error);
    return c.json({
      status: 500,
      error: "Internal Server Error",
    });
  }
});

app.get("/album-approval/:approver", async (c) => {
  try {
    const { approver } = c.req.param();
    const snapshot = await firestoreDb
      .collection("draft-album")
      .where("status", "in", [0, 1])
      .where("owner", "!=", approver)
      .get();

    const albums = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return c.json({
      status: 200,
      data: albums,
    });
  } catch (err) {
    console.error("🔥 Error fetching approvals:", err);
    return c.json({ status: 500, error: "Internal Server Error" });
  }
});

app.patch("/album-approval/:albumId/:approver", async (c) => {
  try {
    const { albumId, approver } = c.req.param();

    await firestoreDb.collection("draft-album").doc(albumId).update({
      status: 2,
    });

    // Update Approver's ranking score (Increment by 1)
    const approverDocRef = firestoreDb
      .collection("approve-ranking")
      .doc(approver);

    await firestoreDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(approverDocRef);

      if (doc.exists) {
        const currentScore = doc.data()?.score || 0;
        transaction.update(approverDocRef, {
          score: currentScore + 1,
        });
      } else {
        transaction.set(approverDocRef, {
          userAddress: approver,
          score: 1,
        });
      }
    });

    return c.json({
      status: 200,
      message: `✅ Album ${albumId} approved by ${approver}`,
    });
  } catch (error) {
    console.error("🔥 Error approving album:", error);
    return c.json({
      status: 500,
      error: "Internal Server Error",
    });
  }
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
