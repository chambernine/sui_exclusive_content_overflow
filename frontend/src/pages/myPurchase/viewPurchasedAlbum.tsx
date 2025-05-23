import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { useSignPersonalMessage, useSuiClient } from "@mysten/dapp-kit";
import { getAllowlistedKeyServers, SealClient, SessionKey } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex } from "@mysten/sui/utils";

import { TESTNET_PACKAGE_ID } from "@/constant/constant";
import { downloadAndDecrypt, MoveCallConstructor } from "@/utils/utils";
import { PublishedAlbum } from "@/types/album";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Share2,
  Bookmark,
  LockKeyhole,
  Tag as TagIcon,
  ArrowLeft,
  MessageSquare,
  Info,
} from "lucide-react";

import { tierColors, tierNames } from "@/types/album";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import LetterGlitch from "@/components/ui/LetterGlitch";
import { CardWithLens } from "@/components/custom/card-with-lens";

const TTL_MIN = 10;

export default function ViewPurchasedAlbum() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const { address } = useSuiAccount();
  const suiClient = useSuiClient();
  const { mutate: signPersonalMessage } = useSignPersonalMessage();

  const [album, setAlbum] = useState<PublishedAlbum | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States for decryption functionality
  const [decryptedFileUrls, setDecryptedFileUrls] = useState<string[]>([]);
  const [currentSessionKey, setCurrentSessionKey] = useState<SessionKey | null>(
    null
  );
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Carousel states
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  // Initialize SealClient
  const client = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers("testnet"),
    verifyKeyServers: false,
  });

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

  useEffect(() => {
    // Fetch album data from local storage
    const storedAlbum = localStorage.getItem("viewingAlbum");

    if (storedAlbum) {
      try {
        const parsedAlbum = JSON.parse(storedAlbum);
        console.log("Retrieved album data from localStorage:", parsedAlbum);

        if (parsedAlbum.albumId === albumId) {
          setAlbum(parsedAlbum);
          setLoading(false);
        } else {
          console.log(
            "Album ID mismatch: stored album has different ID than the requested one"
          );
          setError("Album not found or ID mismatch");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error parsing album data from localStorage:", err);
        setError("Failed to load album data");
        setLoading(false);
      }
    } else {
      console.log("No album data found in localStorage");
      setError("Album data not found");
      setLoading(false);
    }
  }, [address, albumId]);

  // Function to construct the move call for album content
  function constructMoveCall(albumId: string): MoveCallConstructor {
    return (tx: Transaction, id: string) => {
      tx.moveCall({
        target: `${TESTNET_PACKAGE_ID}::exclusive::seal_approve`,
        arguments: [tx.pure.vector("u8", fromHex(id)), tx.object(albumId)],
      });
    };
  }

  // Function to decrypt album content
  const decryptAlbumContent = async (albumData: PublishedAlbum) => {
    if (!albumData) return;

    setIsDecrypting(true);
    // Use the correct property based on the PublishedAlbum interface
    const blobIds = albumData.contentsObjectId || [];

    if (
      currentSessionKey &&
      !currentSessionKey.isExpired() &&
      currentSessionKey.getAddress() === address
    ) {
      const moveCallConstructor = constructMoveCall(albumData.albumId);
      await downloadAndDecrypt(
        blobIds,
        currentSessionKey,
        suiClient,
        client,
        moveCallConstructor,
        setError,
        setDecryptedFileUrls,
        () => {}, // No need to set dialog open
        setReloadKey
      );
      setIsDecrypting(false);
      return;
    }

    setCurrentSessionKey(null);
    const sessionKey = new SessionKey({
      address: address!,
      packageId: TESTNET_PACKAGE_ID,
      ttlMin: TTL_MIN,
    });

    try {
      signPersonalMessage(
        {
          message: sessionKey.getPersonalMessage(),
        },
        {
          onSuccess: async (result) => {
            await sessionKey.setPersonalMessageSignature(result.signature);
            const moveCallConstructor = constructMoveCall(albumData.albumId);
            await downloadAndDecrypt(
              blobIds,
              sessionKey,
              suiClient,
              client,
              moveCallConstructor,
              setError,
              setDecryptedFileUrls,
              () => {}, // No need to set dialog open
              setReloadKey
            );
            setCurrentSessionKey(sessionKey);
            setIsDecrypting(false);
          },
        }
      );
    } catch (error: any) {
      console.error("Error while trying to decrypt content:", error);
      setError(error.message || "Failed to decrypt album content");
      setIsDecrypting(false);
    }
  };

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

  // No share functionality needed

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

  if (loading) {
    return (
      <div className="container mx-auto py-4 md:py-6 max-w-7xl">
        {/* Back button skeleton */}
        <div className="mb-4">
          <Skeleton className="h-10 w-28" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Gallery & Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main image carousel skeleton */}
            <div className="aspect-video rounded-lg overflow-hidden">
              <Skeleton className="h-full w-full rounded-lg" />

              {/* Carousel controls */}
              <div className="flex justify-between px-2 absolute left-0 right-0 top-1/2 -translate-y-1/2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={() => navigate("/profile")} className="mx-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Profile
        </Button>
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
          <Button onClick={() => navigate("/profile")} className="mx-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 md:py-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/profile")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Profile
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:justify-center gap-8">
        {/* Image Gallery and Content */}
        <motion.div
          className="space-y-4 sm:space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="w-full overflow-hidden rounded-lg shadow-lg"
            variants={itemVariants}
          >
            {decryptedFileUrls.length > 0 ? (
              <Carousel
                opts={{
                  loop: true,
                  align: "center",
                }}
                setApi={setCarouselApi}
                className="relative"
              >
                <CarouselContent>
                  {decryptedFileUrls.map((img: string, i: number) => (
                    <CarouselItem key={`${i}-${reloadKey}`}>
                      <AspectRatio
                        ratio={16 / 9}
                        className="bg-card/50 backdrop-blur-sm"
                      >
                        <CardWithLens
                          imageSrc={img}
                          imageAlt={`${album?.name || "Album"} - Content ${
                            i + 1
                          }`}
                          className="h-full w-full overflow-hidden border-none shadow-none"
                        >
                          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                            Content {i + 1} of {decryptedFileUrls.length}
                          </div>
                        </CardWithLens>
                      </AspectRatio>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70" />
                <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70" />
              </Carousel>
            ) : (
              <AspectRatio ratio={16 / 9}>
                <div className="flex flex-col items-center justify-center h-full w-full bg-muted rounded-lg text-muted-foreground">
                  {isDecrypting ? (
                    <LetterGlitch
                      glitchColors={["#2b4539", "#61dca3", "#61b3dc"]}
                      glitchSpeed={50}
                      centerVignette={false}
                      outerVignette={false}
                      smooth={true}
                    />
                  ) : (
                    <>
                      <LockKeyhole className="h-16 w-16 mb-3 opacity-70" />
                      <p>Content needs to be decrypted</p>
                      <Button
                        onClick={() => decryptAlbumContent(album!)}
                        variant="outline"
                        className="mt-4"
                      >
                        Decrypt Content
                      </Button>
                    </>
                  )}
                </div>
              </AspectRatio>
            )}
          </motion.div>

          {/* Thumbnail Gallery */}
          {decryptedFileUrls.length > 0 && (
            <motion.div
              className="flex flex-wrap gap-3 justify-center"
              variants={itemVariants}
            >
              {decryptedFileUrls.map((img: string, i: number) => (
                <motion.div
                  key={`thumbnail-${i}-${reloadKey}`}
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
            </motion.div>
          )}

          {/* Content Details Section */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden h-full flex flex-col bg-card border-border cursor-default hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="prose prose-sm dark:prose-invert">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold">{album?.name}</h1>
                    <Badge
                      className={`${
                        tierColors[album?.tier as keyof typeof tierColors]
                      } text-white text-sm`}
                    >
                      {tierNames[album?.tier as keyof typeof tierNames]}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {album?.tags?.map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="leading-relaxed whitespace-pre-line mt-4">
                    {album?.description}
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
                      Created
                    </span>
                    <span className="col-span-2 flex justify-end">
                      <span className="bg-background px-2 py-1 rounded text-xs truncate max-w-full">
                        {formatDate(album?.created_at)}
                      </span>
                    </span>

                    <span className="text-muted-foreground col-span-1">
                      Creator
                    </span>
                    <span className="col-span-2 flex justify-end">
                      <span className="font-mono bg-background px-2 py-1 rounded text-xs truncate max-w-full">
                        {album?.owner}
                      </span>
                    </span>

                    <span className="text-muted-foreground col-span-1">
                      Content ID
                    </span>
                    <span className="col-span-2 flex justify-end">
                      <span className="font-mono bg-background px-2 py-1 rounded text-xs truncate max-w-full">
                        {album?.albumId}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Community Engagement section */}
                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-2 text-base font-semibold mb-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Community Engagement
                  </div>
                  <div className="flex w-full items-center justify-between text-muted-foreground p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      <span className="text-xs sm:text-base">
                        {album?.interaction?.likes || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Share2 className="h-5 w-5" />
                      <span className="text-xs sm:text-base">
                        {album?.interaction?.shares || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-5 w-5" />
                      <span className="text-xs sm:text-base">
                        {album?.interaction?.saves || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
