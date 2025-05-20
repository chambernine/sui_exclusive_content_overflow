import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
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
import { LoadingWrapper } from "@/components/ui/loading-wrapper";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import useInteractContract from "@/hooks/useInteractContract";
import type { DraftAlbum } from "@/types/album";
import { PublishStatus } from "@/types/interact";
import { tierColors, tierNames, AlbumTier } from "@/types/album";
import {
  Check,
  Clock,
  ExternalLink,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Protected } from "@/components/auth/Protected";
import { DOMAIN_DEV } from "@/constant/constant";

export default function PublishDraftAlbum() {
  const navigate = useNavigate();

  const { albumId: dbId } = useParams();
  const { address } = useSuiAccount();
  const { publishBlobsToAlbum } = useInteractContract();
  const [isLoading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [album, setAlbum] = useState<DraftAlbum | null>(null);
  const [publishingBlobId, setPublishingBlobId] = useState<string | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Fetch draft album
  const fetchAlbum = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${DOMAIN_DEV}/draft-album/${dbId}`);
      setAlbum(res.data.data);
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
      const res = await axios.patch(
        `${DOMAIN_DEV}/my-album/publish`,
        { id: dbId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      await fetchAlbum();
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

  return (
    <Protected>
      <LoadingWrapper isLoading={isLoading} variant="publish-album">
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="w-full mx-auto p-4"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate("/management-contents")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contents Management
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-2xl font-bold tracking-tight">
                {album?.name || "Album Details"}
              </h1>

              {album?.albumId && (
                <Badge
                  variant="outline"
                  className="flex gap-1 items-center text-xs bg-background/50 backdrop-blur-sm"
                >
                  <span className="font-mono">
                    Album ID: {album.albumId.substring(0, 8)}...
                  </span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </Badge>
              )}
            </div>
          </motion.div>

          {album && (
            <>
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg font-medium">
                        Album Details
                      </CardTitle>
                      <Badge
                        className={`${
                          tierColors[album.tier as AlbumTier]
                        } px-3 py-1`}
                      >
                        {tierNames[album.tier as AlbumTier]}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm line-clamp-2">
                      {album.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3 bg-muted/10 p-3 rounded-md">
                        <h3 className="text-xs uppercase tracking-wider font-medium text-muted-foreground mb-2">
                          Basic Information
                        </h3>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-sm text-muted-foreground">
                            Price
                          </span>
                          <span className="text-sm font-medium">
                            {album.price} SUI
                          </span>
                        </div>
                        <div className="h-px bg-border/40"></div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-sm text-muted-foreground">
                            Created
                          </span>
                          <span className="text-sm">
                            {new Date(
                              album.created_at.seconds * 1000
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="h-px bg-border/40"></div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-sm text-muted-foreground">
                            Owner
                          </span>
                          <span className="font-mono bg-muted/30 px-1.5 py-0.5 rounded text-xs">
                            {album.owner.substring(0, 6)}...
                            {album.owner.substring(album.owner.length - 4)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 bg-muted/10 p-3 rounded-md">
                        <h3 className="text-xs uppercase tracking-wider font-medium text-muted-foreground mb-2">
                          Content Details
                        </h3>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-sm text-muted-foreground">
                            Contents
                          </span>
                          <span className="text-sm font-medium">
                            {album.contents.length} files
                          </span>
                        </div>
                        <div className="h-px bg-border/40"></div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-sm text-muted-foreground">
                            Previews
                          </span>
                          <span className="text-sm">
                            {album.contentInfos.length} images
                          </span>
                        </div>
                        <div className="h-px bg-border/40"></div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-sm text-muted-foreground">
                            Tags
                          </span>
                          <span className="text-sm max-w-[200px] truncate text-right bg-muted/30 px-1.5 py-0.5 rounded">
                            {album.tags.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-6">
                <Card className="overflow-hidden border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <span>Publishing Status</span>
                        {!isAllPublished && isAnyPublished && (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-500 border-amber-500/30"
                          >
                            <Clock className="mr-1 h-3 w-3" /> In Progress
                          </Badge>
                        )}
                      </CardTitle>
                      {isAllPublished && (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-500 border-green-500/30"
                        >
                          <Check className="mr-1 h-3 w-3" /> Complete
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {pendingCount > 0
                        ? `${pendingCount} content blob${
                            pendingCount !== 1 ? "s" : ""
                          } pending publication`
                        : "All content has been published successfully"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span>Publication Progress</span>
                        <span className="font-medium">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="bg-card/50 p-3 rounded-lg border border-border">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium">
                          Content Publication
                        </h3>
                        <Button
                          size="sm"
                          onClick={onPublishAlbumOnChain}
                          // disabled={isPublishing || !album.albumId}
                          className={isPublishing ? "animate-pulse" : ""}
                        >
                          {isPublishing ? (
                            <>
                              <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2"></div>
                              Publishing...
                            </>
                          ) : (
                            <>Publish Album</>
                          )}
                        </Button>
                      </div>

                      {(!album.publishedBlobs ||
                        album.publishedBlobs.length === 0) && (
                        <div className="text-center p-6 text-muted-foreground">
                          <p>
                            Click "Publish Album" to initialize the album on the
                            blockchain, then you'll be able to sign individual
                            content blobs
                          </p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {album.publishedBlobs?.map((blob) => (
                          <div
                            key={blob.blobId}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition-shadow ${
                              blob.ispublished
                                ? "bg-green-500/5 border-green-500/20"
                                : "bg-card/50 border-border hover:shadow-sm"
                            }`}
                          >
                            <div className="mb-3 sm:mb-0">
                              <div className="flex items-center">
                                <p
                                  className="text-sm font-mono truncate max-w-[180px] sm:max-w-[300px]"
                                  title={blob.blobId}
                                >
                                  {blob.blobId}
                                </p>
                              </div>
                              <div className="flex items-center mt-1">
                                {blob.ispublished ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-500/10 text-green-500 border-green-500/30 text-xs"
                                  >
                                    <Check className="mr-1 h-3 w-3" /> Published
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs"
                                  >
                                    <Clock className="mr-1 h-3 w-3" /> Pending
                                  </Badge>
                                )}
                              </div>
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
                                    } else if (txResult.status === "rejected") {
                                      setPublishingBlobId(null);
                                      toast.error("Transaction was rejected.");
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
                  </CardContent>
                  <CardFooter className="bg-muted/30 px-6 py-4 text-xs text-muted-foreground">
                    {isAllPublished ? (
                      <p className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        All content has been successfully published to the
                        blockchain
                      </p>
                    ) : (
                      <p>
                        Sign each blob individually to publish your content to
                        the blockchain
                      </p>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            </>
          )}
        </motion.div>
      </LoadingWrapper>
    </Protected>
  );
}
