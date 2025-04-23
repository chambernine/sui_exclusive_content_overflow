import type { Timestamp } from "firebase-admin/firestore";

export interface IFormData {
  walletAddress: string;
  username: string;
  description: string;
  profile_image_file: string;
  banner_image_files: string[];
  socialLinks: {
    x: string;
    twitch: string;
    ig: string;
    youtube: string;
  };
}


export enum DraftAlbumStatus { 
  draft = 0,
  requestApprove = 1,
  approved = 2,
  reject = 3,
}
export enum AlbumTier { 
  standard = 0,
  premium = 1,
  exclusive = 2,
  principle = 3,
}

export interface DraftAlbum {
  albumId: string;
  owner: string;
  name: string;
  tier: AlbumTier;
  price: number;
  description: string;
  tags: string[];
  status: DraftAlbumStatus
  contentInfos: string[]
  contents: string[];
  created_at: Timestamp;
}
