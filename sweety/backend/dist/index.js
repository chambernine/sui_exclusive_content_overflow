import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { firestoreDb } from "./firebaseAdmin.js";
import { createAlbum, publishWalrus, sealEncryptions } from "./utils.js";
const app = new Hono();
app.use("*", cors({
    origin: "http://localhost:5173",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
}));
app.get("/", (c) => {
    return c.text("Hello Hono!");
});
// --- user profile ---
// checking if user already in profile db return IProfile or null never existed
app.get("/profile/:walletAddress", async (c) => {
    const walletAddress = c.req.param("walletAddress");
    // Assuming you use Firestore and walletAddress is the document ID
    const doc = await firestoreDb.collection("users").doc(walletAddress).get();
    if (!doc.exists) {
        return c.json({ data: undefined }, 200);
    }
    return c.json({ data: doc.data() }, 200);
});
app.post("/edit-profile", async (c) => {
    const body = await c.req.formData();
    const socialLinks = {
        x: body.get("social_links[x]")?.toString() || "",
        twitch: body.get("social_links[twitch]")?.toString() || "",
        ig: body.get("social_links[instragram]")?.toString() || "",
        youtube: body.get("social_links[youtube]")?.toString() || "",
    };
    const form = {
        walletAddress: body.get("walletAddress")?.toString() || "",
        username: body.get("username")?.toString() || "",
        description: body.get("description")?.toString() || "",
        profile_image_file: body.get("profile_image_file")?.toString() ?? "",
        banner_image_files: body.getAll("banner_image_files[]").map((file) => file.toString()) ?? [],
        socialLinks: socialLinks,
        purchase: [],
    };
    // Here you'd normally update Firestore, Supabase, etc.
    await firestoreDb.collection("users").doc(form.walletAddress).set({
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
app.get("/draft-album/:albumId", async (c) => {
    try {
        const { albumId } = c.req.param();
        const draftRef = firestoreDb.collection("draft-album").doc(albumId);
        const draftSnap = await draftRef.get();
        if (!draftSnap.exists) {
            return c.json({ status: 404, error: "Draft album not found" });
        }
        const data = draftSnap.data();
        return c.json({ data }, 200);
    }
    catch (err) {
        console.error("🔥 Error fetching draft album:", err);
        return c.json({ status: 500, error: "Internal Server Error" });
    }
});
// --- draft album request for approaval ---
app.post("/draft-album/request-approval", async (c) => {
    const body = await c.req.json();
    await firestoreDb.collection("draft-album").doc(body.id).set({
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
// --- draft albums approval ---
app.get("/draft-album-approval/:approver", async (c) => {
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
    }
    catch (err) {
        console.error("🔥 Error fetching approvals:", err);
        return c.json({ status: 500, error: "Internal Server Error" });
    }
});
app.patch("/draft-album-approval/:albumId/:approver", async (c) => {
    try {
        const { albumId, approver } = c.req.param();
        console.log(albumId, approver);
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
            }
            else {
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
    }
    catch (error) {
        console.error("🔥 Error approving album:", error);
        return c.json({
            status: 500,
            error: "Internal Server Error",
        });
    }
});
// --- draft album publish to marketplace ---
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
    }
    catch (err) {
        console.error("🔥 Error fetching approvals:", err);
        return c.json({ status: 500, error: "Internal Server Error" });
    }
});
// once publish album, delete draft album & create new entity in albums
app.patch("/my-album/publish", async (c) => {
    try {
        const body = await c.req.json();
        const { id } = body;
        const draftDocRef = firestoreDb
            .collection("draft-album")
            .doc(id);
        if (!draftDocRef) {
            return c.json({ status: 404, error: "Draft album not found" });
        }
        const draftDocSnap = await draftDocRef.get();
        const draftAlbum = draftDocSnap.data();
        const { albumId: albumAccessId, capId } = await createAlbum(draftAlbum.name, draftAlbum.price, draftAlbum.owner);
        const encryptedBlobs = await sealEncryptions(albumAccessId, draftAlbum.contents);
        const walrusObjectIds = await publishWalrus(encryptedBlobs);
        console.log("album & capId : ", albumAccessId, capId);
        console.log("publishWalrus: ", walrusObjectIds);
        if (walrusObjectIds.length <= 0) {
            throw new Error("❌ Failed to publish album");
        }
        draftDocRef.update({
            albumId: albumAccessId,
            capId: capId,
            publishedBlobs: walrusObjectIds.map((walrusObject) => {
                return {
                    blobId: walrusObject.blob_id,
                    ispublished: false,
                };
            }),
        });
        //return to sign message to publish walrus object to albumId
        //cannot done it on server side due to invalid sign owner address of cap and server keypair
        return c.json({
            status: 200,
            message: `✅ Album ${draftAlbum.albumId} published by ${draftAlbum.owner}`,
        });
    }
    catch (error) {
        console.error("🔥 Error publishing album:", error);
        return c.json({
            status: 500,
            error: "Internal Server Error",
        });
    }
});
app.patch("/my-album/publish/:albumId/:blobId", async (c) => {
    try {
        const { albumId, blobId } = c.req.param();
        const draftDocRef = firestoreDb.collection("draft-album").doc(albumId);
        const draftDocSnap = await draftDocRef.get();
        if (!draftDocSnap.exists) {
            return c.json({ status: 404, error: "Draft album not found" });
        }
        const draftAlbum = draftDocSnap.data();
        if (!draftAlbum.albumId) {
            return c.json({ status: 404, error: "draft album ID not published yet" });
        }
        // 1. Update ispublished to true for the specified blobId
        const updatedBlobs = (draftAlbum.publishedBlobs || []).map((b) => b.blobId === blobId ? { ...b, ispublished: true } : b);
        await draftDocRef.update({ publishedBlobs: updatedBlobs });
        // 2. Check if all blobs are now published
        const allPublished = updatedBlobs.every((b) => b.ispublished);
        if (!allPublished) {
            return c.json({
                status: 200,
                message: `✅ Blob ${blobId} marked as published. Awaiting others.`,
            });
        }
        // 3. Create PublishedAlbum and delete draft
        const publishedAlbum = {
            albumId: draftAlbum.albumId,
            owner: draftAlbum.owner,
            name: draftAlbum.name,
            tier: draftAlbum.tier,
            price: draftAlbum.price,
            description: draftAlbum.description,
            tags: draftAlbum.tags,
            contentInfos: draftAlbum.contentInfos,
            contentsObjectId: draftAlbum.publishedBlobs?.map((publishedBlob) => {
                return publishedBlob.blobId;
            }),
            created_at: draftAlbum.created_at,
            interaction: {
                likes: 0,
                shares: 0,
                saves: 0,
            },
        };
        await firestoreDb
            .collection("albums")
            .doc(publishedAlbum.albumId)
            .set(publishedAlbum);
        await draftDocRef.delete();
        return c.json({
            status: 200,
            message: `🎉 Album ${publishedAlbum.albumId} fully published and finalized.`,
        });
    }
    catch (err) {
        console.error("🔥 Error finalizing album:", err);
        return c.json({ status: 500, error: "Internal Server Error" });
    }
});
// --- get bougth album by user ---
app.get("/my-album/purchase/:owner", async (c) => {
    try {
        const { owner } = c.req.param();
        // Step 1: Load the user
        const userDoc = await firestoreDb.collection("users").doc(owner).get();
        if (!userDoc.exists) {
            return c.json({ status: 404, error: "User not found" });
        }
        const purchased = userDoc.data()?.purchased || [];
        if (purchased.length === 0) {
            return c.json({ status: 200, data: [] });
        }
        // Step 2: Batch load album metadata
        const albumRefs = purchased.map((albumId) => firestoreDb.collection("albums").doc(albumId));
        const albumDocs = await firestoreDb.getAll(...albumRefs);
        // Step 3: Map to PublishedAlbum[]
        const albums = albumDocs
            .filter((doc) => doc.exists)
            .map((doc) => {
            const data = doc.data();
            return {
                albumId: doc.id,
                owner: data.owner,
                name: data.name,
                tier: data.tier,
                price: data.price,
                description: data.description,
                tags: data.tags,
                contentInfos: data.contentInfos,
                contentsObjectId: data.contentsObjectId,
                created_at: data.created_at,
                interaction: data.interaction || { likes: 0, shares: 0, saves: 0 },
            };
        });
        return c.json({ status: 200, data: albums });
    }
    catch (err) {
        console.error("🔥 Error fetching purchased albums:", err);
        return c.json({ status: 500, error: "Internal Server Error" });
    }
});
app.get("/explore-albums", async (c) => {
    try {
        const snapshot = await firestoreDb.collection("albums").get();
        const albums = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                albumId: data.albumId,
                owner: data.owner,
                name: data.name,
                tier: data.tier,
                price: data.price,
                description: data.description,
                tags: data.tags,
                contentInfos: data.contentInfos,
                contentsObjectId: data.contentsObjectId,
                created_at: data.created_at,
                interaction: data.interaction || { likes: 0, shares: 0, saves: 0 },
            };
        });
        return c.json({ data: albums }, 200);
    }
    catch (error) {
        console.error("🔥 Error fetching albums:", error);
        return c.json({ error: "Failed to fetch albums" }, 500);
    }
});
app.post("/explore-album/purchase/:albumId/:supporter", async (c) => {
    try {
        const { albumId, supporter } = c.req.param();
        const userRef = firestoreDb.collection("users").doc(supporter);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return c.json({ status: 404, error: "User not found" });
        }
        const existing = userDoc.data()?.purchased || [];
        if (!existing.includes(albumId)) {
            existing.push(albumId);
            await userRef.update({ purchased: existing });
        }
        return c.json({
            status: 200,
            message: `✅ Album ${albumId} added to user ${supporter}'s purchased list.`,
        });
    }
    catch (err) {
        console.error("🔥 Error recording purchase:", err);
        return c.json({ status: 500, error: "Internal Server Error" });
    }
});
app.get("/explore-album/:albumId", async (c) => {
    try {
        const { albumId } = c.req.param();
        const docRef = firestoreDb.collection("albums").doc(albumId);
        const doc = await docRef.get();
        if (!doc.exists) {
            return c.json({ status: 404, error: "Album not found" });
        }
        const data = doc.data();
        if (!data) {
            return c.json({ status: 404, error: "Album not found" });
        }
        const album = {
            albumId: doc.id,
            owner: data.owner,
            name: data.name,
            tier: data.tier,
            price: data.price,
            description: data.description,
            tags: data.tags,
            contentInfos: data.contentInfos,
            contentsObjectId: data.contentsObjectId,
            created_at: data.created_at,
            interaction: data.interaction || { likes: 0, shares: 0, saves: 0 },
        };
        return c.json({ data: album }, 200);
    }
    catch (error) {
        console.error("🔥 Error fetching album:", error);
        return c.json({ status: 500, error: "Failed to fetch album" });
    }
});
serve({
    fetch: app.fetch,
    port: 3000,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
