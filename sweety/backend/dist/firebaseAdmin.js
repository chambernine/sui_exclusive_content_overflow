import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";
import dotenv from "dotenv";
dotenv.config();
const services = {
    type: process.env.SERVICE_KEY_TYPE,
    project_id: process.env.SERVICE_KEY_PROJECT_ID,
    private_key_id: process.env.SERVICE_KEY_PRIVATE_KEY_ID,
    private_key: process.env.SERVICE_KEY_PRIVATE_KEY,
    client_email: process.env.SERVICE_KEY_CLIENT_EMAIL,
    client_id: process.env.SERVICE_KEY_CLIENT_ID,
    auth_uri: process.env.SERVICE_KEY_AUTH_URI,
    token_uri: process.env.SERVICE_KEY_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.SERVICE_KEY_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.SERVICE_KEY_CLIENT_X509_CERT_URL,
    universe_domain: process.env.SERVICE_KEY_UNIVERSE_DOMAIN,
};
const adminApp = initializeApp({
    credential: cert(services),
    databaseURL: process.env.FIREBASE_DB_URL,
});
const firestoreDb = getFirestore(adminApp);
const realtimeDbAdmin = getDatabase(adminApp);
export { firestoreDb, realtimeDbAdmin };
