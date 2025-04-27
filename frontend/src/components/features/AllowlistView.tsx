import { useEffect, useState } from "react";
import { useSignPersonalMessage, useSuiClient } from "@mysten/dapp-kit";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { fromHex } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";
import { getAllowlistedKeyServers, SealClient, SessionKey } from "@mysten/seal";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { useNetworkVariable } from "../../config/networkConfig";
import {
  downloadAndDecrypt,
  getObjectExplorerLink,
  MoveCallConstructor,
} from "@/lib/sui";
import {
  FileImage,
  Images,
  Key,
  LockKeyhole,
  Loader2,
  Lock,
  Unlock,
} from "lucide-react";
import { Badge } from "../ui/badge";

const TTL_MIN = 10;
export interface FeedData {
  allowlistId: string;
  allowlistName: string;
  blobIds: string[];
}

function constructMoveCall(
  packageId: string,
  allowlistId: string
): MoveCallConstructor {
  return (tx: Transaction, id: string) => {
    tx.moveCall({
      target: `${packageId}::allowlist::seal_approve`,
      arguments: [tx.pure.vector("u8", fromHex(id)), tx.object(allowlistId)],
    });
  };
}

const Feeds: React.FC<{ suiAddress: string }> = ({ suiAddress }) => {
  const suiClient = useSuiClient();
  const client = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers("testnet"),
    verifyKeyServers: false,
  });
  const packageId = useNetworkVariable("packageId");

  const [feed, setFeed] = useState<FeedData>();
  const [decryptedFileUrls, setDecryptedFileUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionKey, setCurrentSessionKey] = useState<SessionKey | null>(
    null
  );
  const { id } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const { mutate: signPersonalMessage } = useSignPersonalMessage();

  useEffect(() => {
    // Call getFeed immediately
    getFeed();

    // Set up interval to call getFeed every 3 seconds
    const intervalId = setInterval(() => {
      getFeed();
    }, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [id]); // Dependencies

  async function getFeed() {
    setIsLoading(true);
    try {
      const allowlist = await suiClient.getObject({
        id: id!,
        options: { showContent: true },
      });
      const encryptedObjects = await suiClient
        .getDynamicFields({
          parentId: id!,
        })
        .then((res) => res.data.map((obj) => obj.name.value as string));
      const fields = (allowlist.data?.content as { fields: any })?.fields || {};
      const feedData = {
        allowlistId: id!,
        allowlistName: fields?.name || "Unnamed Membership",
        blobIds: encryptedObjects,
      };
      setFeed(feedData);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const onView = async (blobIds: string[], allowlistId: string) => {
    setIsDecrypting(true);

    try {
      if (
        currentSessionKey &&
        !currentSessionKey.isExpired() &&
        currentSessionKey.getAddress() === suiAddress
      ) {
        const moveCallConstructor = constructMoveCall(packageId, allowlistId);
        await downloadAndDecrypt(
          blobIds,
          currentSessionKey,
          suiClient,
          client,
          moveCallConstructor,
          setError,
          setDecryptedFileUrls,
          setIsDialogOpen,
          setReloadKey
        );
        setIsDecrypting(false);
        return;
      }

      setCurrentSessionKey(null);

      const sessionKey = new SessionKey({
        address: suiAddress,
        packageId,
        ttlMin: TTL_MIN,
      });

      signPersonalMessage(
        {
          message: sessionKey.getPersonalMessage(),
        },
        {
          onSuccess: async (result) => {
            await sessionKey.setPersonalMessageSignature(result.signature);
            const moveCallConstructor = await constructMoveCall(
              packageId,
              allowlistId
            );
            await downloadAndDecrypt(
              blobIds,
              sessionKey,
              suiClient,
              client,
              moveCallConstructor,
              setError,
              setDecryptedFileUrls,
              setIsDialogOpen,
              setReloadKey
            );
            setCurrentSessionKey(sessionKey);
            setIsDecrypting(false);
          },
          onError: () => {
            setIsDecrypting(false);
          },
        }
      );
    } catch (error) {
      console.error("Error in decryption:", error);
      setIsDecrypting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Lock className="h-6 w-6 text-primary" />
          Premium Content
        </h1>
        <p className="text-muted-foreground">
          Access exclusive photos from your subscription
        </p>
      </div>

      <Card className="overflow-hidden border-border/60 bg-background/50 backdrop-blur-sm">
        <>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <CardTitle>{feed?.allowlistName}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <span>Membership ID:</span>
                  {feed?.allowlistId && getObjectExplorerLink(feed.allowlistId)}
                </CardDescription>
              </div>
              {feed?.blobIds && feed.blobIds.length > 0 && (
                <Badge
                  variant="outline"
                  className="bg-background/70 backdrop-blur-sm"
                >
                  {feed.blobIds.length}{" "}
                  {feed.blobIds.length === 1 ? "Photo" : "Photos"} Available
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {!feed || feed.blobIds.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12">
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                  <FileImage className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">
                  No Exclusive Photos Found
                </h3>
                <p className="text-muted-foreground max-w-md mt-2">
                  There are no photos in this membership tier yet, or you may
                  not have permission to access them.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-full shrink-0">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      Encrypted Premium Photos
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      This membership contains {feed.blobIds.length} encrypted{" "}
                      {feed.blobIds.length === 1 ? "photo" : "photos"} that you
                      can access with your subscription.
                    </p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Button
                        onClick={() => onView(feed.blobIds, feed.allowlistId)}
                        disabled={isDecrypting}
                        className="gap-2"
                      >
                        {isDecrypting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Decrypting...
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4" />
                            View Exclusive Photos
                          </>
                        )}
                      </Button>
                      {currentSessionKey && !currentSessionKey.isExpired() && (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-500 border-green-500/20"
                        >
                          Session key active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogContent
                    className="sm:max-w-4xl max-h-[90vh] overflow-y-auto"
                    key={reloadKey}
                  >
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Images className="h-5 w-5" />
                        Exclusive Photos
                      </DialogTitle>
                    </DialogHeader>

                    {decryptedFileUrls.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
                        {decryptedFileUrls.map((url, index) => (
                          <div
                            key={index}
                            className="overflow-hidden rounded-lg border bg-background shadow-sm"
                          >
                            <img
                              src={url}
                              alt={`Premium photo ${index + 1}`}
                              className="aspect-square w-full object-cover object-center"
                            />
                            <div className="p-2 text-center">
                              <p className="text-sm font-medium">
                                Exclusive Photo {index + 1}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    )}

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                        }}
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </>
      </Card>

      <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-destructive" />
              Access Error
            </AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button onClick={() => setError(null)}>Close</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default Feeds;
