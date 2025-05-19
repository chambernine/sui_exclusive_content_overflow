import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DraftAlbumStatus, tierColors, tierNames } from "@/types/album";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Protected } from "@/components/auth/Protected";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  CheckCircle,
  ClipboardCheck,
  Album,
  Search,
  Clock,
  CheckSquare,
  Image as ImageIcon,
} from "lucide-react";
import {
  usePendingApprovalAlbums,
  useMyAlbums,
  useApproveAlbum,
  usePublishAlbum,
} from "@/hooks/api/useAlbums";
import { useNavigate } from "react-router-dom";

interface Album {
  id: string;
  albumId: string;
  name: string;
  tier: number;
  owner: string;
  price: number;
  description: string;
  tags: string[];
  status: DraftAlbumStatus;
  contentInfos: string[];
  contents: string[];
  created_at: { seconds: number; nanoseconds: number }; // Timestamp from Firestore
}

export default function AlbumRequestApproval() {
  const { address } = useSuiAccount();
  const [currentTab, setCurrentTab] = useState<string>("pending-approval");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetching data with React Query
  const { data: pendingApprovalData, isLoading: isLoadingPendingApproval } =
    usePendingApprovalAlbums(address);

  const { data: myAlbumsData, isLoading: isLoadingMyAlbums } =
    useMyAlbums(address);

  // Mutations
  const approveMutation = useApproveAlbum(address);
  const publishMutation = usePublishAlbum(address);

  const pendingApproval = pendingApprovalData?.data || [];
  const myAlbums = myAlbumsData?.data || [];

  const filteredPendingApproval = pendingApproval.filter(
    (album: Album) =>
      album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const filteredMyAlbums = myAlbums.filter(
    (album: Album) =>
      album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
      },
    },
  };

  const handleApprove = async (albumId: string) => {
    approveMutation.mutate({ albumId });
  };

  const handlePublish = async (album: Album) => {
    navigate(`/management-contents/${album.id}`);
  };

  const formatTimestamp = (ts: Album["created_at"]) => {
    return new Date(ts.seconds * 1000).toLocaleString();
  };

  const toggleExpandCard = (albumId: string) => {
    setExpandedCard(expandedCard === albumId ? null : albumId);
  };

  const renderStatusBadge = (status: DraftAlbumStatus) => {
    switch (status) {
      case DraftAlbumStatus.approved:
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/20"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case DraftAlbumStatus.requestApprove:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
          >
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-500/10 text-gray-500 border-gray-500/20"
          >
            Draft
          </Badge>
        );
    }
  };

  const renderSkeletonCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card
          key={i}
          className="bg-card border-border hover:shadow-md transition-shadow overflow-hidden"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Skeleton className="h-24 w-full rounded" />
              <Skeleton className="h-24 w-full rounded" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full rounded" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const renderPendingApprovalContent = () => {
    if (isLoadingPendingApproval && !address) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ClipboardCheck className="h-12 w-12 mb-4 opacity-30" />
          <p>Connect to wallet first to view pending approvals</p>
        </div>
      );
    }

    if (isLoadingPendingApproval) {
      return renderSkeletonCards();
    }

    if (filteredPendingApproval.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ClipboardCheck className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-center mb-1">
            No pending contents found to approve.
          </p>
          <p className="text-sm">
            Contents awaiting your approval will appear here.
          </p>
        </div>
      );
    }

    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {filteredPendingApproval.map((album: Album) => (
          <motion.div key={album.albumId} variants={item}>
            <Card className="bg-card border-border hover:shadow-md transition-shadow overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">
                    {album.name}
                  </CardTitle>
                  <Badge
                    className={`${
                      tierColors[album.tier as keyof typeof tierColors]
                    } text-white text-sm`}
                  >
                    {tierNames[album.tier as keyof typeof tierNames]}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {album.tags?.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {album.tags?.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{album.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Price:
                    </span>
                    <span className="font-medium">{album.price} SUI</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Owner:
                    </span>
                    <span className="font-mono text-sm">
                      {album.owner.slice(0, 10)}...{album.owner.slice(-6)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Created:
                    </span>
                    <span className="text-sm">
                      {formatTimestamp(album.created_at)}
                    </span>
                  </div>
                </div>

                <motion.div
                  initial={{ height: "60px", overflow: "hidden" }}
                  animate={{
                    height: expandedCard === album.albumId ? "auto" : "60px",
                    overflow:
                      expandedCard === album.albumId ? "visible" : "hidden",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm leading-relaxed">{album.description}</p>
                </motion.div>

                {album.description && album.description.length > 150 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs p-0 h-auto"
                    onClick={() => toggleExpandCard(album.albumId)}
                  >
                    {expandedCard === album.albumId ? "Show less" : "Read more"}
                  </Button>
                )}

                <Separator className="my-2" />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5" /> Content Preview
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {album.contentInfos?.slice(0, 2).map((img, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AspectRatio ratio={16 / 9}>
                          <img
                            src={img}
                            alt={`preview-${i}`}
                            className="h-full w-full object-cover rounded"
                          />
                        </AspectRatio>
                      </motion.div>
                    ))}
                    {album.contentInfos?.length > 2 && (
                      <div className="absolute bottom-2 right-2">
                        <Badge
                          variant="secondary"
                          className="bg-background/90 backdrop-blur-sm"
                        >
                          +{album.contentInfos.length - 2} more
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full glass bg-primary hover:bg-primary/90 text-white"
                  onClick={() => handleApprove(album.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Content
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderMyAlbumsContent = () => {
    if (isLoadingMyAlbums && !address) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Album className="h-12 w-12 mb-4 opacity-30" />
          <p>Connect to wallet first to view your contents</p>
        </div>
      );
    }

    if (isLoadingMyAlbums) {
      return renderSkeletonCards();
    }

    if (filteredMyAlbums.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Album className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-center mb-1">
            You don't have any contents in the approval process.
          </p>
          <p className="text-sm">Create a new content to see it here.</p>
        </div>
      );
    }

    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {filteredMyAlbums.map((album: Album) => (
          <motion.div key={album.albumId} variants={item}>
            <Card className="bg-card border-border hover:shadow-md transition-shadow overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">
                    {album.name}
                  </CardTitle>
                  <div>{renderStatusBadge(album.status)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <Badge
                    className={`${
                      tierColors[album.tier as keyof typeof tierColors]
                    } text-white text-sm`}
                  >
                    {tierNames[album.tier as keyof typeof tierNames]}
                  </Badge>
                  <span className="text-sm font-medium">{album.price} SUI</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <motion.div
                  initial={{ height: "60px", overflow: "hidden" }}
                  animate={{
                    height: expandedCard === album.albumId ? "auto" : "60px",
                    overflow:
                      expandedCard === album.albumId ? "visible" : "hidden",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm leading-relaxed">{album.description}</p>
                </motion.div>

                {album.description && album.description.length > 150 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs p-0 h-auto"
                    onClick={() => toggleExpandCard(album.albumId)}
                  >
                    {expandedCard === album.albumId ? "Show less" : "Read more"}
                  </Button>
                )}

                <Separator className="my-2" />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5" /> Content Preview
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Created: {formatTimestamp(album.created_at).split(",")[0]}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="grid grid-cols-2 gap-2">
                      {album.contentInfos?.slice(0, 2).map((img, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AspectRatio ratio={1}>
                            <img
                              src={img}
                              alt={`preview-${i}`}
                              className="h-full w-full object-cover rounded"
                            />
                          </AspectRatio>
                        </motion.div>
                      ))}
                    </div>

                    {album.contentInfos?.length > 2 && (
                      <div className="absolute bottom-2 right-2">
                        <Badge
                          variant="secondary"
                          className="bg-background/90 backdrop-blur-sm"
                        >
                          +{album.contentInfos.length - 2} more
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <AnimatePresence mode="wait">
                  {album.status === DraftAlbumStatus.approved ? (
                    <motion.div
                      key="publish-button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full"
                    >
                      <Button
                        onClick={() => handlePublish(album)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Publish Content
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="waiting-button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full"
                    >
                      <Button
                        disabled
                        variant="outline"
                        className="w-full cursor-not-allowed"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {album.status === DraftAlbumStatus.requestApprove
                          ? "Awaiting Approval"
                          : "Draft Status"}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <Protected description="Connect wallet to manage content requests">
      <div className="container w-full mx-auto p-4">
        {/* <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 gradient-text">
            <ClipboardCheck className="h-6 w-6" />
            Contents Management
          </h1>
          <p className="text-muted-foreground">
            Review submitted contents and manage your content publication
            process
          </p>
        </motion.div> */}

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="pending-approval" className="flex gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Contents to Approve</span>
                <Badge
                  variant="secondary"
                  className="ml-1 bg-secondary/30 text-xs"
                >
                  {filteredPendingApproval?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="my-albums" className="flex gap-2">
                <Album className="h-4 w-4" />
                <span>My Contents Request</span>
                <Badge
                  variant="secondary"
                  className="ml-1 bg-secondary/30 text-xs"
                >
                  {filteredMyAlbums?.length || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, description, or tags..."
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-card rounded-lg p-4">
            <TabsContent value="pending-approval" className="mt-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-1 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Contents Awaiting Your Approval
                    </h3>
                  </div>
                  <Badge variant="outline" className="bg-primary/10">
                    {filteredPendingApproval.length} content
                    {filteredPendingApproval.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                {renderPendingApprovalContent()}
              </motion.div>
            </TabsContent>

            <TabsContent value="my-albums" className="mt-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-1 flex items-center gap-2">
                      <Album className="h-5 w-5 text-primary" />
                      My Contents Ready to Publish
                    </h3>
                  </div>
                  <Badge variant="outline" className="bg-primary/10">
                    {filteredMyAlbums.length} content
                    {filteredMyAlbums.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                {renderMyAlbumsContent()}
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Protected>
  );
}
