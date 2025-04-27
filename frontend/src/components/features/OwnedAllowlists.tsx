import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useCallback, useEffect, useState } from "react";
import { useNetworkVariable } from "../../config/networkConfig";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getObjectExplorerLink } from "@/lib/sui";
import { motion } from "framer-motion";
import {
  ListChecks,
  FileText,
  Settings,
  User,
  Users,
  ExternalLink,
  Loader2,
  Image,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export interface Cap {
  id: string;
  allowlist_id: string;
}

export interface CardItem {
  cap_id: string;
  allowlist_id: string;
  list: string[];
  name: string;
}

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
  show: { opacity: 1, y: 0 },
};

export function AllAllowlist() {
  const packageId = useNetworkVariable("packageId");
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [cardItems, setCardItems] = useState<CardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getCapObj = useCallback(async () => {
    if (!currentAccount?.address) return;
    setIsLoading(true);

    try {
      const res = await suiClient.getOwnedObjects({
        owner: currentAccount?.address,
        options: {
          showContent: true,
          showType: true,
        },
        filter: {
          StructType: `${packageId}::allowlist::Cap`,
        },
      });

      const caps = res.data
        .map((obj) => {
          const fields = (obj!.data!.content as { fields: any }).fields;
          return {
            id: fields?.id.id,
            allowlist_id: fields?.allowlist_id,
          };
        })
        .filter((item) => item !== null) as Cap[];

      const cardItems: CardItem[] = await Promise.all(
        caps.map(async (cap) => {
          const allowlist = await suiClient.getObject({
            id: cap.allowlist_id,
            options: { showContent: true },
          });
          const fields =
            (allowlist.data?.content as { fields: any })?.fields || {};
          return {
            cap_id: cap.id,
            allowlist_id: cap.allowlist_id,
            list: fields.list || [],
            name: fields.name || "Unnamed Membership",
          };
        })
      );

      setCardItems(cardItems);
    } catch (error) {
      console.error("Error fetching memberships:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount?.address, packageId, suiClient]);

  useEffect(() => {
    getCapObj();
  }, [getCapObj]);

  const handleCreateNew = () => {
    window.location.href = "/allowlist-example";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Loading your content...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Content</h1>
        <p className="text-muted-foreground">
          Manage your exclusive photo contents and subscriber access
        </p>
      </div>

      {cardItems.length === 0 ? (
        <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-border/60">
          <CardContent className="flex flex-col items-center text-center p-12 gap-4">
            <div className="bg-muted/50 p-4 rounded-full">
              <Image className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No Content Found</h3>
            <p className="text-muted-foreground max-w-md">
              You haven't created any membership tiers yet. Create your first
              tier to start sharing exclusive content.
            </p>
            <Button onClick={handleCreateNew} className="mt-2">
              Create Your First Membership
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {cardItems.map((item) => (
            <motion.div key={`${item.cap_id}-${item.allowlist_id}`}>
              <Card className="overflow-hidden h-full bg-background/50 backdrop-blur-sm border-border/60 hover:border-primary/30 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-background/70 backdrop-blur-sm"
                    >
                      {item.list.length}{" "}
                      {item.list.length === 1 ? "Subscriber" : "Subscribers"}
                    </Badge>
                  </div>
                  <CardTitle className="mt-1 truncate">{item.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <span>ID:</span>
                    {getObjectExplorerLink(item.allowlist_id)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Subscriber list preview */}
                  <div className="p-3 bg-background/70 rounded-md border">
                    <h4 className="text-xs uppercase text-muted-foreground mb-2 flex items-center gap-1">
                      <Users className="h-3 w-3" /> Subscribers
                    </h4>
                    {item.list.length > 0 ? (
                      <div className="space-y-1.5">
                        {item.list.slice(0, 3).map((address, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-mono truncate">
                              {address.substring(0, 12)}...
                            </span>
                          </div>
                        ))}
                        {item.list.length > 3 && (
                          <div className="text-xs text-muted-foreground italic">
                            +{item.list.length - 3} more subscribers
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No subscribers added yet
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      to={`/allowlist-example/admin/allowlist/${item.allowlist_id}`}
                      className="flex-1"
                    >
                      <Button variant="default" className="w-full gap-1.5">
                        <Settings className="h-3.5 w-3.5" />
                        Manage Content
                      </Button>
                    </Link>
                    <Link
                      to={`/allowlist-example/view/allowlist/${item.allowlist_id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full gap-1.5 border-primary/20 hover:border-primary/40"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Preview
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Add new tier card */}
          <motion.div variants={item}>
            <Card
              className="overflow-hidden h-full bg-background/30 backdrop-blur-sm border-dashed border-border/60 hover:border-primary/30 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer"
              onClick={handleCreateNew}
            >
              <div className="bg-primary/5 p-4 rounded-full mb-4">
                <ListChecks className="h-8 w-8 text-primary/70" />
              </div>
              <h3 className="text-lg font-medium">Create New Content</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Set up a new membership tier with exclusive content
              </p>
              <Button variant="outline" size="sm">
                Create Content
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
