import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useInteractContract from "@/hooks/useInteractContract";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { useExploreAlbumById } from "@/hooks/api/useAlbums";
import { Protected } from "@/components/auth/Protected";
import { CardWithLens } from "@/components/custom/card-with-lens";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Heart,
  Share2,
  Bookmark,
  Lock,
  Tag as TagIcon,
  Info,
  CreditCard,
  ArrowLeft,
  MessageSquare,
  AlertTriangle as ExclamationTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { tierColors, tierNames } from "@/types/album";
import { PublishStatus } from "@/types/interact";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { DOMAIN_DEV } from "@/constant/constant";
import { useSuiClient } from "@mysten/dapp-kit";

import { AvatarCircles } from "@/components/magicui/avatar-circles";

interface Album {
  albumId: string;
  name: string;
  owner: string;
  tier: number;
  price: number;
  description: string;
  tags: string[];
  contentInfos: string[];
  created_at: object;
  interaction: {
    likes: number;
    shares: number;
    saves: number;
  };
}

export default function BuyAlbum() {
  const { albumId } = useParams();
  const suiClient = useSuiClient();
  const navigate = useNavigate();
  const { address } = useSuiAccount();
  const { data, isLoading } = useExploreAlbumById(albumId || "", address);
  const album: Album | null = data?.data || null;
  const { CreateSupportAlbumTx } = useInteractContract();

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [purchaseInProgress, setPurchaseInProgress] = useState<boolean>(false);
  const [purchaseCount, setPurchaseCount] = useState<number>(0);
  const [limited, setLimited] = useState<number>(0); // Set your max purchases per user here
  const [loadingPurchaseCount, setLoadingPurchaseCount] =
    useState<boolean>(true);

  const [members, setMembers] = useState([]);

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

  const onPurchaseAlbum = async (albumId: string, address: string) => {
    await fetch(`${DOMAIN_DEV}/explore-album/purchase/${albumId}/${address}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  };

  const handlePurchase = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!album || !album.albumId) return;

    if (purchaseCount >= limited) {
      toast.error(
        `You've reached the maximum purchase limit of ${limited} albums`
      );
      return;
    }

    setPurchaseInProgress(true);
    try {
      const txResult: PublishStatus = await CreateSupportAlbumTx(
        album.albumId,
        album.price * 1_000_000_000,
        20
      );

      if (txResult.status === "approved") {
        await onPurchaseAlbum(album.albumId, address);
        toast.success("Transaction approved!");
        navigate("/profile");

        // If you need to redirect or update state after successful purchase, do it here
      } else if (txResult.status === "failed") {
        console.error("Transaction failed:", txResult.error);
        toast.error("Transaction failed. Check console for details.");
      } else if (txResult.status === "rejected") {
        toast.error("Transaction was rejected.");
      }
    } catch (err) {
      console.error("Error during purchase transaction:", err);
      toast.error("Failed to complete purchase. Please try again.");
    } finally {
      setPurchaseInProgress(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

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
    setLoadingPurchaseCount(true);
    const fetchAllowlist = async () => {
      if (!albumId) return;
      try {
        const allowlist = await suiClient.getObject({
          id: albumId!,
          options: { showContent: true },
        });

        const fields =
          (allowlist.data?.content as { fields: any })?.fields || {};

        setLimited(fields.max_insider - 1);
        setPurchaseCount(fields.insider.length - 1);
        setMembers(fields.insider.slice(1));

        setLoadingPurchaseCount(false);
      } catch (error) {
        console.error("Error fetching allowlist:", error);
      }
    };
    fetchAllowlist();
  }, [albumId, suiClient]);

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

                {/* Community Engagement */}
                <div className="space-y-4 mt-6">
                  <Skeleton className="h-6 w-40" />
                  <div className="flex justify-between p-4 bg-muted/30 rounded-lg">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-8" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Card */}
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
            onClick={() => navigate("/explore-albums")}
            className="mx-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Protected description="Connect wallet to view and purchase content">
      <div className="container mx-auto py-4 max-w-7xl">
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
                              Purchase to unlock more content
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
                  {/* Creator Card moved here */}
                  <div className="prose prose-sm dark:prose-invert ">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center">
                        <h1 className="text-3xl font-bold">{album.name}</h1>
                        <a
                          href={`https://testnet.suivision.xyz/account/${album.albumId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center hover:opacity-80 transition-opacity"
                          title="View on Sui Explorer"
                        >
                          <img
                            src="/suiscan.png"
                            alt="Sui Explorer"
                            className="h-6 w-6"
                          />
                        </a>
                      </div>
                      <Badge
                        className={`${
                          tierColors[album.tier as keyof typeof tierColors]
                        } text-white text-sm`}
                      >
                        {tierNames[album.tier as keyof typeof tierNames]}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {album.tags?.map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
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
                  {/* Content Details - Updated to match image layout */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-base font-semibold mb-2">
                      <TagIcon className="h-5 w-5 text-primary" />
                      Content Details
                    </div>
                    <div className="grid grid-cols-3 gap-y-3 bg-muted/50 p-4 rounded-lg text-sm">
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

                      <span className="text-muted-foreground col-span-1">
                        Content ID
                      </span>
                      <span className="col-span-2 flex justify-end">
                        <span className="font-mono bg-background px-2 py-1 rounded text-xs truncate max-w-full">
                          {album.albumId}
                        </span>
                      </span>

                      <span className="text-muted-foreground col-span-1">
                        Contract Address
                      </span>
                      <span className="col-span-2 flex justify-end">
                        <span className="font-mono bg-background px-2 py-1 rounded text-xs truncate max-w-full">
                          {album.albumId}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Community Engagement section - kept from original */}
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center gap-2 text-base font-semibold mb-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Community Engagement
                    </div>
                    <div className="flex w-full items-center justify-between text-muted-foreground p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        <span className="text-xs sm:text-base">
                          {album.interaction?.likes || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        <span className="text-xs sm:text-base">
                          {album.interaction?.shares || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bookmark className="h-5 w-5" />
                        <span className="text-xs sm:text-base">
                          {album.interaction?.saves || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Right Column - Purchase Card */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="sticky top-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Purchase This Content</CardTitle>
                <CardDescription>
                  Get immediate access to all exclusive content
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <div className="text-2xl font-bold">{album.price} SUI</div>
                </div>

                {/* Purchase count indicator */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Purchase limit:
                    </span>
                    <div className="font-medium flex items-center">
                      {loadingPurchaseCount ? (
                        <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-t-transparent border-primary"></div>
                      ) : (
                        <span
                          className={
                            purchaseCount >= limited
                              ? "text-red-600 font-bold"
                              : ""
                          }
                        >
                          {purchaseCount}/{limited}
                        </span>
                      )}
                    </div>
                  </div>

                  {!loadingPurchaseCount && (
                    <Progress
                      value={(purchaseCount / limited) * 100}
                      className={
                        purchaseCount >= limited
                          ? "bg-red-200"
                          : purchaseCount > limited * 0.75
                          ? "bg-amber-200"
                          : purchaseCount > limited * 0.5
                          ? "bg-emerald-200"
                          : "bg-primary/20"
                      }
                      style={
                        {
                          "--progress-indicator-color":
                            purchaseCount >= limited
                              ? "rgb(220, 38, 38)"
                              : purchaseCount > limited * 0.75
                              ? "rgb(217, 119, 6)"
                              : purchaseCount > limited * 0.5
                              ? "rgb(5, 150, 105)"
                              : "var(--primary)",
                        } as React.CSSProperties
                      }
                    />
                  )}
                </div>

                <div className="mt-2">
                  {!loadingPurchaseCount ? (
                    purchaseCount > 0 && (
                      <AvatarCircles
                        title={`Purchase Members (${purchaseCount} of ${limited})`}
                        avatarUrls={
                          members.map((address: string) => ({
                            imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
                            profileUrl: `https://suiscan.xyz/testnet/account/${address}`,
                          })) || []
                        }
                        numPeople={purchaseCount > 5 ? purchaseCount - 5 : 0}
                      />
                    )
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="rounded-md bg-primary/10 p-3 border border-primary/20">
                  <h4 className="font-medium text-sm flex items-center mb-2">
                    <Info className="h-4 w-4 mr-2 text-primary" />
                    What you'll get:
                  </h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Full access to all exclusive images</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Permanent access to your purchased content</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Support the creator directly</span>
                    </li>
                  </ul>
                </div>

                {/* Purchase Limit Warning */}
                {purchaseCount >= limited && (
                  <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
                    <ExclamationTriangle className="inline-block mr-2 h-5 w-5" />
                    You have reached the maximum purchase limit of {limited}{" "}
                    albums. Please remove an existing album from your collection
                    to purchase this one.
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col space-y-3">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={purchaseInProgress || purchaseCount >= limited}
                  onClick={handlePurchase}
                >
                  {purchaseInProgress ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-current"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Purchase for {album.price} SUI
                    </>
                  )}
                </Button>

                <div className="flex w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </Protected>
  );
}
