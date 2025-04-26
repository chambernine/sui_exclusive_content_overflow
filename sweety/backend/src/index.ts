import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { firestoreDb } from './firebaseAdmin.js'
import type { DraftAlbum, IFormData } from './type.js'

const app = new Hono()

// Enable CORS for localhost:3000
app.use('*', cors({
  origin: 'http://localhost:5173',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}))

app.get('/', (c) => {
  return c.text('Hello Hono!')
  // console.log(fireStoreDb)
})

app.post("/edit-profile", async (c) => {
  const body = await c.req.formData()
  const socialLinks = {
    x: body.get('social_links[x]')?.toString() || '',
    twitch: body.get('social_links[twitch]')?.toString() || '',
    ig: body.get('social_links[instragram]')?.toString() || '',
    youtube: body.get('social_links[youtube]')?.toString() || ''
  }

  const form: IFormData = {
    walletAddress: body.get('walletAddress')?.toString() || '',
    username: body.get('username')?.toString() || '',
    description: body.get('description')?.toString() || '',
    profile_image_file: body.get('profile_image_file')?.toString() ?? "",
    banner_image_files: body.getAll('banner_image_files[]').map(file => file.toString()) ?? [],
    socialLinks: socialLinks
  }
  console.log("form :",form)
  // Here you’d normally update Firestore, Supabase, etc.

  await firestoreDb.collection('user-profile').doc(form.walletAddress).set({
    userAddress: form.walletAddress,
    username: form.username,
    description: form.description,
    profileImageBase64: form.profile_image_file,
    bannerImagesBase64: form.banner_image_files,
    socialLinks: form.socialLinks,
    createdAt: Date.now()
  })

  return c.json({
    status: 200
  })
})

app.post("/draft-album/request-approval", async (c)=>{
  const body: DraftAlbum = await c.req.json()
  
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
  await firestoreDb.collection('draft-album').doc(body.albumId).set({
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
  })

  return c.json({
    status: 200
  })
})

app.get("/my-album/:owner", async (c) => {
  try {
    const { owner } = c.req.param()
    const snapshot = await firestoreDb
      .collection('draft-album')
      .where('owner', '==', owner)
      .get()

    const albums = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return c.json({
      status: 200,
      data: albums
    })
  } catch (err) {
    console.error('🔥 Error fetching approvals:', err)
    return c.json({ status: 500, error: 'Internal Server Error' })
  }
})


app.get("/album-approval/:approver", async (c) => {
  try {
    const { approver } = c.req.param()
    const snapshot = await firestoreDb
      .collection('draft-album')
      .where('status', 'in', [0, 1])
      .where('owner', '!=', approver)
      .get()

    const albums = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return c.json({
      status: 200,
      data: albums
    })
  } catch (err) {
    console.error('🔥 Error fetching approvals:', err)
    return c.json({ status: 500, error: 'Internal Server Error' })
  }
})

app.patch("/album-approval/:albumId/:approver", async (c) => {
  try {
    const { albumId, approver } = c.req.param();

    await firestoreDb.collection('draft-album').doc(albumId).update({
      status: 2,
    })

    // Update Approver's ranking score (Increment by 1)
    const approverDocRef = firestoreDb.collection('approve-ranking').doc(approver);

    await firestoreDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(approverDocRef);

      if (doc.exists) {
        const currentScore = doc.data()?.score || 0;
        transaction.update(approverDocRef, {
          score: currentScore + 1
        });
      } else {
        transaction.set(approverDocRef, {
          userAddress: approver,
          score: 1
        });
      }
    })


    return c.json({
      status: 200,
      message: `✅ Album ${albumId} approved by ${approver}`
    })

  } catch (error) {
    console.error('🔥 Error approving album:', error);
    return c.json({
      status: 500,
      error: 'Internal Server Error'
    });
  }
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
