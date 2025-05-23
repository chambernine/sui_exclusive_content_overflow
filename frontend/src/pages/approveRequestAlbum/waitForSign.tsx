import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import useInteractContract from "@/hooks/useInteractContract";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CardWithLens } from "@/components/custom/card-with-lens";
import { Skeleton } from "@/components/ui/skeleton";
import type { DraftAlbum } from "@/types/album";
import { PublishStatus } from "@/types/interact";
import { tierColors, tierNames, AlbumTier } from "@/types/album";
import {
  Check,
  Clock,
  CheckCircle,
  ArrowLeft,
  Tag as TagIcon,
  Info,
  CircleCheck,
  Lock,
  FileText,
  Codesandbox,
} from "lucide-react";
import { toast } from "sonner";
import { Protected } from "@/components/auth/Protected";
import { DOMAIN_DEV } from "@/constant/constant";
import { WalrusLoading } from "@/components/ui/walrus-loading";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

export default function PublishDraftAlbum() {
  const navigate = useNavigate();

  const { albumId: dbId } = useParams();
  const { address } = useSuiAccount();
  const { publishBlobsToAlbum } = useInteractContract();
  const [isLoading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [album, setAlbum] = useState<DraftAlbum | null>(null);
  const [publishingBlobId, setPublishingBlobId] = useState<string | null>(null);

  // Add carousel states to match BuyAlbum
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  // Carousel effects
  useEffect(() => {
    if (!carouselApi) return;
    carouselApi.scrollTo(selectedImage);
  }, [carouselApi, selectedImage]);

  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () => {
      setSelectedImage(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", handleSelect);

    return () => {
      carouselApi.off("select", handleSelect);
    };
  }, [carouselApi]);

  // Fetch draft album
  const fetchAlbum = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${DOMAIN_DEV}/draft-album/${dbId}`);

      setAlbum(res.data.data);

      if (res.data.error === "Draft album not found") {
        navigate("/explore-albums");
      }
    } catch (err) {
      console.error("Error loading album:", err);
      toast.error("Failed to load album details");
    } finally {
      setLoading(false);
    }
  };

  // Called after signing
  const markBlobAsPublished = async (blobId: string) => {
    try {
      await axios.patch(`${DOMAIN_DEV}/my-album/publish/${dbId}/${blobId}`);
      await fetchAlbum(); // Refresh data

      toast.success("Content successfully published!");
    } catch (err) {
      console.error("❌ Failed to update backend publish state:", err);
      toast.error("Failed to update publish state");
    } finally {
      setPublishingBlobId(null);
    }
  };

  const onPublishAlbumOnChain = async () => {
    if (!album) return;
    setIsPublishing(true);
    try {
      await axios.patch(
        `${DOMAIN_DEV}/my-album/publish`,
        { id: dbId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      await fetchAlbum();
      toast.success("Album initialized on blockchain!");
    } catch (err) {
      console.error("Failed to publish album:", err);
      toast.error("Failed to publish album to blockchain");
    } finally {
      setIsPublishing(false);
    }
  };

  // Use useCallback to memoize fetchAlbum function
  const memoizedFetchAlbum = useCallback(fetchAlbum, [dbId]);

  useEffect(() => {
    if (dbId && address) {
      memoizedFetchAlbum();
    }
  }, [dbId, address, memoizedFetchAlbum]);

  // Calculate publishing progress
  const calculateProgress = () => {
    if (!album || !album.publishedBlobs || album.publishedBlobs.length === 0)
      return 0;

    const publishedCount = album.publishedBlobs.filter(
      (blob) => blob.ispublished
    ).length;
    return (publishedCount / album.publishedBlobs.length) * 100;
  };

  const progress = calculateProgress();
  const isAllPublished =
    album?.publishedBlobs?.every((blob) => blob.ispublished) || false;
  const isAnyPublished =
    album?.publishedBlobs?.some((blob) => blob.ispublished) || false;
  const pendingCount =
    album?.publishedBlobs?.filter((blob) => !blob.ispublished).length || 0;

  // Format date helper function
  const formatDate = (created_at: any) => {
    if (!created_at || !created_at.seconds) return "Unknown date";
    const date = new Date(created_at.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (isAllPublished) {
      toast.success("All content has been successfully published!");
      navigate("/explore-albums");
    }
  }, [isAllPublished, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-4 md:py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Gallery & Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main image carousel skeleton */}
            <div className="aspect-video rounded-lg overflow-hidden">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>

            {/* Content Details Card */}
            <div className="rounded-lg overflow-hidden">
              <div className="p-6 space-y-4">
                {/* Title and tier */}
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <Skeleton className="h-9 w-3/4" />
                  <Skeleton className="h-6 w-24" />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-5 w-16 rounded-full" />
                  ))}
                </div>

                {/* Description */}
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                <Skeleton className="h-px w-full my-4" />

                {/* Content Details */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid grid-cols-3 gap-y-3 bg-muted/30 p-4 rounded-lg">
                    {[1, 2, 3, 4].map((i) => (
                      <React.Fragment key={i}>
                        <Skeleton className="h-4 w-20" />
                        <div className="col-span-2 flex justify-end">
                          <Skeleton className="h-5 w-32" />
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Publish Card */}
          <div className="space-y-6">
            <div className="bg-card/30 backdrop-blur-sm border-border rounded-lg overflow-hidden">
              {/* Card Header */}
              <div className="p-6 pb-2">
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-8 w-24" />
                </div>

                <Skeleton className="h-px w-full" />

                <div className="rounded-md bg-primary/10 p-3 border border-primary/20">
                  <Skeleton className="h-5 w-32 mb-3" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start">
                        <Skeleton className="h-4 w-4 mr-2 mt-1" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-0 flex flex-col space-y-3">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <div className="max-w-md mx-auto">
          <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Album not found</h1>
          <p className="text-muted-foreground mb-6">
            The album you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => navigate("/management-contents")}
            className="mx-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contents Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Protected>
      <WalrusLoading size={160} showMessage={true} isLoading={isPublishing}>
        <div className="container mx-auto py-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate("/management-contents")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contents Management
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 lg:justify-center gap-8">
            {/* Left Column - Image Gallery */}
            <motion.div
              className="lg:col-span-2 space-y-4 sm:space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="w-full overflow-hidden rounded-lg shadow-lg"
                variants={itemVariants}
              >
                {album.contentInfos?.length > 0 ? (
                  <Carousel
                    opts={{
                      loop: true,
                      align: "center",
                    }}
                    setApi={setCarouselApi}
                    className="relative"
                  >
                    <CarouselContent>
                      {album.contentInfos.map((img: string, i: number) => (
                        <CarouselItem key={i}>
                          <AspectRatio
                            ratio={16 / 9}
                            className="bg-card/50 backdrop-blur-sm"
                          >
                            <CardWithLens
                              imageSrc={img}
                              imageAlt={`${album.name} - Preview ${i + 1}`}
                              className="h-full w-full overflow-hidden border-none shadow-none"
                            >
                              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                                Preview {i + 1} of {album.contentInfos.length}
                              </div>
                            </CardWithLens>
                          </AspectRatio>
                        </CarouselItem>
                      ))}
                      {/* Locked content item */}
                      <CarouselItem key="locked">
                        <AspectRatio
                          ratio={16 / 9}
                          className="bg-card/50 backdrop-blur-sm"
                        >
                          <div className="h-full w-full overflow-hidden border-none shadow-none relative bg-black/20">
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <Lock className="h-16 w-16 text-muted-foreground mb-3 opacity-70" />
                              <p className="text-lg text-white font-medium">
                                Exclusive Content
                              </p>
                              <p className="text-sm text-white/80 mt-2">
                                Publish to make content available
                              </p>
                            </div>
                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                              Locked Content
                            </div>
                          </div>
                        </AspectRatio>
                      </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70" />
                    <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70" />
                  </Carousel>
                ) : (
                  <AspectRatio ratio={16 / 9}>
                    <div className="flex items-center justify-center h-full w-full bg-muted rounded-lg text-muted-foreground">
                      No preview available
                    </div>
                  </AspectRatio>
                )}
              </motion.div>

              {/* Thumbnail Gallery */}
              {album.contentInfos?.length > 0 && (
                <motion.div
                  className="flex flex-wrap gap-3 justify-center"
                  variants={itemVariants}
                >
                  {album.contentInfos.map((img: string, i: number) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`cursor-pointer overflow-hidden rounded-md border-4 transition-all ${
                        selectedImage === i
                          ? "border-primary shadow-lg"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedImage(i)}
                    >
                      <AspectRatio ratio={1} className="w-20 sm:w-24">
                        <img
                          src={img}
                          alt={`Thumbnail ${i + 1}`}
                          className="object-cover h-full w-full"
                        />
                      </AspectRatio>
                    </motion.div>
                  ))}
                  {/* Locked content thumbnail */}
                  <motion.div
                    key="locked-thumbnail"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`cursor-pointer overflow-hidden rounded-md border-4 transition-all ${
                      selectedImage === album.contentInfos.length
                        ? "border-primary shadow-lg"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedImage(album.contentInfos.length)}
                  >
                    <AspectRatio ratio={1} className="w-20 sm:w-24 bg-black/20">
                      <div className="flex items-center justify-center h-full w-full">
                        <Lock className="h-6 w-6 text-white/70" />
                      </div>
                    </AspectRatio>
                  </motion.div>
                </motion.div>
              )}

              {/* Content Details Section */}
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden h-full flex flex-col bg-card border-border cursor-default hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="prose prose-sm dark:prose-invert">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold">{album.name}</h1>
                        <Badge
                          className={`${
                            tierColors[album.tier as AlbumTier]
                          } text-white text-sm`}
                        >
                          {tierNames[album.tier as AlbumTier]}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {album.tags?.map((tag: string, i: number) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="leading-relaxed whitespace-pre-line mt-4">
                        {album.description}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <Separator className="my-2" />
                    {/* Content Details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-base font-semibold mb-2">
                        <TagIcon className="h-5 w-5 text-primary" />
                        Content Details
                      </div>

                      <div className="grid grid-cols-3 gap-y-3 bg-muted/50 p-4 rounded-lg text-sm">
                        <span className="text-muted-foreground col-span-1">
                          Content Count
                        </span>
                        <span className="col-span-2 flex justify-end">
                          <span className="bg-background px-2 py-1 rounded text-xs truncate max-w-full">
                            {album.contents?.length || 0} files
                          </span>
                        </span>
                        <span className="text-muted-foreground col-span-1">
                          Created
                        </span>
                        <span className="col-span-2 flex justify-end">
                          <span className="bg-background px-2 py-1 rounded text-xs truncate max-w-full">
                            {formatDate(album.created_at)}
                          </span>
                        </span>

                        <span className="text-muted-foreground col-span-1">
                          Creator
                        </span>
                        <span className="col-span-2 flex justify-end">
                          <span className="font-mono bg-background px-2 py-1 rounded text-xs truncate max-w-full">
                            {album.owner}
                          </span>
                        </span>

                        {album.albumId && (
                          <>
                            <span className="text-muted-foreground col-span-1">
                              Album ID
                            </span>
                            <span className="col-span-2 flex justify-end">
                              <span className="font-mono bg-background px-2 py-1 rounded text-xs truncate max-w-full">
                                {album.albumId}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status section */}
                    <div className="space-y-4 mt-6">
                      <div className="flex items-center gap-2 text-base font-semibold mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Publication Status
                      </div>
                      <div className="flex w-full items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          <span className="text-xs sm:text-base">
                            {album.contents?.length || 0} Files
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isAllPublished ? (
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-500 border-green-500/30"
                            >
                              <Check className="mr-1 h-3 w-3" /> Complete
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-500 border-amber-500/30"
                            >
                              <Clock className="mr-1 h-3 w-3" /> {pendingCount}{" "}
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Right Column - Publish Card */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="sticky top-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Publish This Content</CardTitle>
                  <CardDescription>
                    Make your content available on the blockchain
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Status:
                    </span>
                    <div className="font-medium">
                      {isAllPublished ? (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-500 border-green-500/30"
                        >
                          <Check className="mr-1 h-3 w-3" /> Complete
                        </Badge>
                      ) : album.publishedBlobs &&
                        album.publishedBlobs.length > 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-500 border-amber-500/30"
                        >
                          <Clock className="mr-1 h-3 w-3" /> In Progress
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-blue-500/10 text-blue-500 border-blue-500/30"
                        >
                          <Info className="mr-1 h-3 w-3" /> Not Started
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Publication progress indicator */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Publication progress:
                      </span>
                      <div className="font-medium flex items-center">
                        {album.publishedBlobs ? (
                          <>{Math.round(progress)}%</>
                        ) : (
                          <>0%</>
                        )}
                      </div>
                    </div>

                    <Progress
                      value={progress}
                      className={
                        isAllPublished
                          ? "bg-green-200"
                          : isAnyPublished
                          ? "bg-amber-200"
                          : "bg-primary/20"
                      }
                      style={
                        {
                          "--progress-indicator-color": isAllPublished
                            ? "rgb(34, 197, 94)"
                            : isAnyPublished
                            ? "rgb(217, 119, 6)"
                            : "var(--primary)",
                        } as React.CSSProperties
                      }
                    />
                  </div>

                  <Separator />

                  <div className="rounded-md bg-primary/10 p-3 border border-primary/20">
                    <h4 className="font-medium text-sm flex items-center mb-2">
                      <Info className="h-4 w-4 mr-2 text-primary" />
                      Publication Steps:
                    </h4>
                    <ol className="text-sm space-y-2 list-decimal pl-5">
                      <li className="text-muted-foreground">
                        Preserve content on the blockchain
                      </li>
                      <li className="text-muted-foreground">
                        Sign each content blob individually
                      </li>
                    </ol>
                  </div>

                  {/* Blob list for signing */}
                  {album.albumId &&
                    album.publishedBlobs &&
                    album.publishedBlobs.length > 0 && (
                      <div className="space-y-3 bg-card/50 p-3 rounded-lg border border-border">
                        <div className="max-h-56 overflow-y-auto space-y-2">
                          {album.publishedBlobs?.map((blob) => (
                            <div
                              key={blob.blobId}
                              id={`blob-${blob.blobId}`}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-shadow ${
                                blob.ispublished
                                  ? "bg-green-500/5 border-green-500/20"
                                  : "bg-card/50 border-border hover:shadow-sm"
                              }`}
                            >
                              <div className="mb-2 sm:mb-0">
                                <p
                                  className="text-xs font-mono truncate max-w-[150px] sm:max-w-[120px]"
                                  title={blob.blobId}
                                >
                                  {blob.blobId.substring(0, 8)}...
                                  {blob.blobId.substring(
                                    blob.blobId.length - 8
                                  )}
                                </p>
                                {blob.ispublished ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-500/10 text-green-500 border-green-500/30 text-xs mt-1"
                                  >
                                    <Check className="mr-1 h-3 w-3" /> Published
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs mt-1"
                                  >
                                    <Clock className="mr-1 h-3 w-3" /> Pending
                                  </Badge>
                                )}
                              </div>

                              {!blob.ispublished && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="w-full sm:w-auto"
                                  disabled={publishingBlobId === blob.blobId}
                                  onClick={async () => {
                                    try {
                                      if (!album.albumId) return;
                                      setPublishingBlobId(blob.blobId);

                                      const txResult: PublishStatus =
                                        await publishBlobsToAlbum(
                                          album.albumId,
                                          album.capId!,
                                          blob.blobId
                                        );

                                      if (txResult.status === "approved") {
                                        await markBlobAsPublished(blob.blobId);
                                      } else if (txResult.status === "failed") {
                                        setPublishingBlobId(null);
                                        toast.error(
                                          "Transaction failed. Check console for details."
                                        );
                                      } else if (
                                        txResult.status === "rejected"
                                      ) {
                                        setPublishingBlobId(null);
                                        toast.error(
                                          "Transaction was rejected."
                                        );
                                      }
                                    } catch (err) {
                                      console.error(
                                        "Error during sign & publish:",
                                        err
                                      );
                                      toast.error(
                                        "Failed to sign and publish content"
                                      );
                                      setPublishingBlobId(null);
                                    }
                                  }}
                                >
                                  {publishingBlobId === blob.blobId ? (
                                    <>
                                      <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2"></div>
                                      Processing...
                                    </>
                                  ) : (
                                    <>Sign & Publish</>
                                  )}
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-3">
                  {!album.albumId ? (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      onClick={onPublishAlbumOnChain}
                      disabled={isPublishing}
                    >
                      {isPublishing ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2"></div>
                          Initializing...
                        </>
                      ) : (
                        <>
                          <Codesandbox className="mr-1 h-4 w-4" />
                          Preserve
                        </>
                      )}
                    </Button>
                  ) : isAllPublished ? (
                    <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm">
                      <CircleCheck className="inline-block mr-2 h-5 w-5" />
                      All content has been successfully published to the
                      blockchain. Your album is now live on the platform!
                    </div>
                  ) : null}

                  {album.albumId && (
                    <div className="text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded-md">
                      {isAllPublished ? (
                        <p className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          All content has been successfully published to the
                          blockchain
                        </p>
                      ) : (
                        <p className="flex items-center">
                          <Clock className="h-4 w-4 text-amber-500 mr-2" />
                          Sign each blob individually to publish your content
                        </p>
                      )}
                    </div>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </WalrusLoading>
    </Protected>
  );
}
