import type { Timestamp } from "firebase-admin/firestore";

export interface IUserData {
  walletAddress: string;
  username: string;
  description: string;
  profile_image_file: string;
  banner_image_files: string[];
  socialLinks: {
    x: string;
    twitch: string;
    instagram: string;
    youtube: string;
  };
  purchase: string[];
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
  id: string;
  albumId?: string;
  capId?: string;
  owner: string;
  name: string;
  tier: AlbumTier;
  limited: number;
  price: number;
  description: string;
  tags: string[];
  status: DraftAlbumStatus;
  contentInfos: string[];
  contents: string[];
  created_at: Timestamp;
  publishedBlobs?: {
    blobId: string
    ispublished: boolean
  }[]
}

export interface WalrusObjectResponse {
  id: string;
  registered_epoch: number;
  blob_id: string;
  size: string;
  encoding_type: number;
  certified_epoch: number | null;
  storage: {
    id: string;
    start_epoch: number;
    end_epoch: number;
    storage_size: string;
  };
  deletable: boolean;
  cost: number;
  resourceOperation: {
    registerFromScratch: {
      encodedLength: string;
      epochsAhead: number;
    };
  };
}

export interface PublishedAlbum { 
  albumId: string;
  owner: string;
  name: string;
  tier: number;
  limited: number;
  price: number;
  description: string;
  tags: string[];
  contentInfos: string[]
  contentsObjectId?: string[];
  interaction: {
    likes: number;
    shares: number;
    saves: number;
  };
  created_at: Timestamp;
}
