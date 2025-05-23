// types/draftAlbum.ts

import { Timestamp } from "firebase/firestore";

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
export enum AlbumCategory {
  photo = 0,
  music = 1,
  video = 2,
  chat = 3,
  writing = 4,
  other = 5,
}

export interface DraftAlbum {
  id: string;
  albumId?: string;
  capId?: string;
  owner: string;
  name: string;
  tier: AlbumTier;
  category: AlbumCategory;
  price: number;
  description: string;
  tags: string[];
  status: DraftAlbumStatus;
  contentInfos: string[];
  contents: string[];
  created_at: Timestamp;
  limited: number | null;
  publishedBlobs?: {
    blobId: string;
    ispublished: boolean;
  }[];
}

// export interface PublishedAlbum {
//   albumId: string;
//   owner: string;
//   name: string;
//   tier: AlbumTier;
//   category: AlbumCategory;
//   price: number;
//   description: string;
//   tags: string[];
//   contentInfo: string[];
//   contentsObjectId: string[];
//   interaction: {
//     likes: number;
//     shares: number;
//     saves: number;
//   };
//   created_at: Timestamp;
//   membershipLimit: number | null;
// }

export interface PublishedAlbum {
  albumId: string;
  owner: string;
  name: string;
  tier: number;
  limited: number;
  price: number;
  description: string;
  tags: string[];
  contentInfos: string[];
  contentsObjectId?: string[];
  interaction: {
    likes: number;
    shares: number;
    saves: number;
  };
  created_at: Timestamp;
}

export interface WaitForSignPublishResponse {
  albumId: string;
  capId: string;
  blobId: string;
}

export const tierColors = {
  [AlbumTier.standard]: "bg-amber-700",
  [AlbumTier.premium]: "bg-neutral-400",
  [AlbumTier.exclusive]: "bg-amber-500",
  [AlbumTier.principle]: "bg-blue-400",
};

export const tierNames = {
  [AlbumTier.standard]: "Standard",
  [AlbumTier.premium]: "Premium",
  [AlbumTier.exclusive]: "Exclusive",
  [AlbumTier.principle]: "Principle",
};

export const categoryNames = {
  [AlbumCategory.photo]: "Photo",
  [AlbumCategory.music]: "Music",
  [AlbumCategory.video]: "Video",
  [AlbumCategory.writing]: "Writing",
  [AlbumCategory.chat]: "Chat",
  [AlbumCategory.other]: "Other",
};
