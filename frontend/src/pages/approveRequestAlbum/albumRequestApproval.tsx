import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DraftAlbumStatus, AlbumTier, tierColors } from "@/types/album";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Protected } from "@/components/auth/Protected";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ClipboardCheck, Album } from "lucide-react";
import {
  usePendingApprovalAlbums,
  useMyAlbums,
  useApproveAlbum,
  usePublishAlbum,
} from "@/hooks/api/useAlbums";

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
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70 } },
  };

  const handleApprove = async (albumId: string) => {
    approveMutation.mutate({ albumId });
  };

  const handlePublish = async (albumId: string) => {
    publishMutation.mutate(albumId);
  };

  const formatTimestamp = (ts: Album["created_at"]) => {
    return new Date(ts.seconds * 1000).toLocaleString();
  };

  const renderPendingApprovalContent = () => {
    if (isLoadingPendingApproval && !address) {
      return <p>Connect to wallet first</p>;
    }

    if (isLoadingPendingApproval) {
      return <p>Loading albums...</p>;
    }

    if (pendingApproval.length === 0) {
      return <p>No pending albums found to approve.</p>;
    }

    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {pendingApproval.map((album: Album) => (
          <motion.div key={album.albumId} variants={item}>
            <Card className="bg-gray-900 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">{album.name}</CardTitle>
                <p className="text-sm text-gray-400">Owner: {album.owner}</p>
                <p className="text-sm text-gray-400">
                  Tier: {AlbumTier[album.tier]}
                </p>
                <p className="text-sm text-gray-400">Price: {album.price} 💰</p>
                <p className="text-sm text-gray-400">
                  Created: {formatTimestamp(album.created_at)}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  Tags: {album.tags?.join(", ") || "None"}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm">{album.description}</p>
                <div className="font-medium">Content Information:</div>
                {album.contentInfos?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {album.contentInfos.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`content-${i}`}
                        className="h-28 w-full object-cover rounded border border-gray-700"
                      />
                    ))}
                  </div>
                )}

                <div className="font-medium">Content Preview:</div>
                {album.contents && (
                  <div className="grid grid-cols-2 gap-2">
                    {album.contents.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`content-${i}`}
                        className="h-28 w-full object-cover rounded border border-gray-700"
                      />
                    ))}
                  </div>
                )}

                <Button
                  className="mt-2 w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(album.albumId)}
                >
                  Approve Album
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderMyAlbumsContent = () => {
    if (isLoadingMyAlbums && !address) {
      return <p>Connect to wallet first</p>;
    }

    if (isLoadingMyAlbums) {
      return <p>Loading your albums...</p>;
    }

    if (myAlbums.length === 0) {
      return <p>You don't have any albums in the approval process.</p>;
    }

    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {myAlbums.map((album: Album) => (
          <motion.div key={album.albumId} variants={item}>
            <Card className="bg-gray-900 border border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="text-lg">{album.name}</CardTitle>
                <Badge
                  variant="outline"
                  className={`${tierColors[album.tier]} text-white mt-2 w-fit`}
                >
                  {AlbumTier[album.tier]}
                </Badge>
                <p className="text-sm text-gray-400 mt-1">
                  Price: {album.price} 💰
                </p>
                <p className="text-sm text-gray-400">
                  Created: {formatTimestamp(album.created_at)}
                </p>
                <Badge
                  className={`mt-2 ${
                    album.status === DraftAlbumStatus.approved
                      ? "bg-green-700"
                      : album.status === DraftAlbumStatus.requestApprove
                      ? "bg-yellow-600"
                      : "bg-gray-600"
                  }`}
                >
                  {DraftAlbumStatus[album.status]}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm">{album.description}</p>

                {album.contentInfos && album.contentInfos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {album.contentInfos.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`preview-${i}`}
                        className="h-28 w-full object-cover rounded border border-gray-700"
                      />
                    ))}
                  </div>
                )}

                <Button
                  disabled={album.status !== DraftAlbumStatus.approved}
                  onClick={() => handlePublish(album.albumId)}
                  className={`w-full mt-4 ${
                    album.status === DraftAlbumStatus.approved
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-600"
                  }`}
                >
                  {album.status === DraftAlbumStatus.approved
                    ? "Publish Album"
                    : "Waiting for Approval"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <Protected description="Connect wallet to manage album requests">
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            Album Request Management
          </h1>
          <p className="text-muted-foreground">
            Review submitted albums and manage your album publication process
          </p>
        </motion.div>

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="pending-approval">
              Albums to Approve
            </TabsTrigger>
            <TabsTrigger value="my-albums">My Album Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="pending-approval" className="mt-2">
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Albums Awaiting Your Approval
              </h3>
              <p className="text-sm text-muted-foreground">
                Review and approve albums submitted by creators.
              </p>
            </div>
            {renderPendingApprovalContent()}
          </TabsContent>

          <TabsContent value="my-albums" className="mt-2">
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-2 flex items-center gap-2">
                <Album className="h-5 w-5 text-primary" />
                My Albums Ready to Publish
              </h3>
              <p className="text-sm text-muted-foreground">
                Track the status of your submitted albums and publish approved
                ones.
              </p>
            </div>
            {renderMyAlbumsContent()}
          </TabsContent>
        </Tabs>
      </div>
    </Protected>
  );
}
