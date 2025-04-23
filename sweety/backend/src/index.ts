import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { firestoreDb } from './firebaseAdmin.js'
import type { IFormData } from './type.js'

const app = new Hono()

// Enable CORS for localhost:3000
app.use('*', cors({
  origin: 'http://localhost:5173',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))

app.get('/', (c) => {
  return c.text('Hello Hono!')
  // console.log(fireStoreDb)
})

// const uploadFileToStorage = async (file: File, path: string) => {
//   const buffer = await file.arrayBuffer()
//   const fileName = `${path}/${file.name}`
//   // const fileRef = bucket.file(fileName)

//   await fileRef.save(Buffer.from(buffer), {
//     metadata: {
//       contentType: file.type,
//       firebaseStorageDownloadTokens: uuidv4()
//     },
//     public: true
//   })

//   return `https://storage.googleapis.com/${bucket.name}/${fileName}`
// }

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

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
