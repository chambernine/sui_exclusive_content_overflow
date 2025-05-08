"use client";

import { ThreeDMarquee } from "../ui/3d-marquee";
import { Skeleton } from "../ui/skeleton";

interface Album {
  albumId: string;
  name: string;
  contentInfos: string[];
  [key: string]: any; // For other album properties
}

interface ThreeDContentsListsProps {
  contents?: Album[];
  isLoading?: boolean;
}

export function ThreeDContentsLists({
  contents = [],
  isLoading = false,
}: ThreeDContentsListsProps) {
  const placeholderImage =
    "https://placehold.co/970x700/3a3a3c/FFFFFF?text=No+Image";

  const images = [
    // Existing images
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1000",
    "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1000",
    "https://images.unsplash.com/photo-1498075702571-ecb018f3752d?q=80&w=1000",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000",
    "https://images.unsplash.com/photo-1541832676-9b763b0239ab?q=80&w=1000",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000",
    "https://images.unsplash.com/photo-1514870262631-55de0332faf6?q=80&w=1000",
    "https://images.unsplash.com/photo-1557264305-048d7e0a01ed?q=80&w=1000",
    "https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=1000",
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1000",
    "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1000",
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000",
    "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=1000",
    "https://images.unsplash.com/photo-1519638399535-1b036603ac77?q=80&w=1000",
    "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?q=80&w=1000",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1000",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000",
    "https://images.unsplash.com/photo-1489533119213-66a5cd877091?q=80&w=1000",
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1000",

    // Anime style images
    "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1000",
    "https://images.unsplash.com/photo-1560942485-b2a11cc13456?q=80&w=1000",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000",

    // Mountain landscapes
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000",
    "https://images.unsplash.com/photo-1516298773066-c48f8e9bd92b?q=80&w=1000",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000",

    // Ocean and sea views
    "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1000",
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=1000",
    "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?q=80&w=1000",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000",

    // Travel destinations
    "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=1000",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000",
    "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1000",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000",
    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=1000",
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000",
  ];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl rounded-xl bg-gray-950/5 p-2 ring-1 ring-neutral-700/10">
        <Skeleton className="h-100 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl rounded-xl bg-gray-950/5 p-2 ring-1 ring-neutral-700/10 dark:bg-">
      <ThreeDMarquee images={images} />
    </div>
  );
}
