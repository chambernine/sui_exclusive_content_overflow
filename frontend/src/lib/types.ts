// Common types used throughout the application

export interface Draft {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  content?: {
    title: string;
    description: string;
    additionalNotes?: string;
    imageFiles?: File[];
    previewUrls?: string[];
  };
}

export interface Creator {
  id: number;
  name: string;
  address: string;
  price: string;
  profileImage: string;
  bio: string;
  subscribers: number;
  contentType?: string;
  createdAt: Date;
  contentCount: number;
  engagementRate: number; // percentage
  totalViews: number;
  rank?: number;
  rankChange?: number; // positive: improved rank, negative: dropped rank
  verified?: boolean;
}
