import { Timestamp } from 'firebase/firestore';
import { ProfileMetaData } from './profile';

enum userRole {
    user = 0,
    creator = 1 
}

export interface User {
    walletAddress: string;
    username: string;
    role: userRole
    profileinfo: ProfileMetaData | null
    created_at: Timestamp
}