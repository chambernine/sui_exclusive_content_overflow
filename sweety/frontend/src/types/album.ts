// types/draftAlbum.ts

import { Timestamp } from "firebase/firestore";

export interface DraftAlbum {
  albumId: string;
  owner: string;
  name: string;
  tier: 'standard' | 'premium' | 'exclusive' | 'principle';
  price: number;
  description: string;
  tags: string[];
  status: 'draft' | 'pending_approval' | 'approved' | 'reject';
  contentInfo: string[]
  contents: string[]; // array of URLs (image/video)
  created_at: Timestamp;
  interaction: {
    likes: number;
    shares: number;
    saves: number;
  };
}