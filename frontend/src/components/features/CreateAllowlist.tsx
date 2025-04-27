import { Transaction } from "@mysten/sui/transactions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useState } from "react";
import { useNetworkVariable } from "../../config/networkConfig";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, PlusCircle, Users } from "lucide-react";

export function CreateAllowlist() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();

  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showEffects: true,
        },
      }),
  });

  function createAllowlist(name: string) {
    if (name.trim() === "") {
      alert("Please enter a name for your photo content");
      return;
    }

    setIsCreating(true);
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::allowlist::create_allowlist_entry`,
      arguments: [tx.pure.string(name)],
    });
    tx.setGasBudget(10000000);

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          console.log("res", result);
          // Extract the created allowlist object ID from the transaction result
          const allowlistObject = result.effects?.created?.find(
            (item) =>
              item.owner &&
              typeof item.owner === "object" &&
              "Shared" in item.owner
          );
          const createdObjectId = allowlistObject?.reference?.objectId;
          setIsCreating(false);

          if (createdObjectId) {
            window.open(
              `${window.location.origin}/allowlist-example/admin/allowlist/${createdObjectId}`,
              "_blank"
            );
          }
        },
        onError: () => {
          setIsCreating(false);
        },
      }
    );
  }

  const handleViewAll = () => {
    navigate(`/allowlist-example/admin/allowlists`);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Create content</h1>
          <p className="text-muted-foreground">
            Create exclusive photo contents for your viewers
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create New Photo Content Card */}
        <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-border/60">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                  <PlusCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Create New Photo Content</CardTitle>
                  <CardDescription>
                    Create a new exclusive photo content to manage content
                    access
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="allowlist-name" className="text-sm font-medium">
                  Content Name*
                </label>
                <div className="relative">
                  <input
                    id="allowlist-name"
                    className="w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                    placeholder="Enter a name for your photo content"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <FileText className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <p className="text-xs text-muted-foreground">
                  For example: "Summer Collection", "Portrait Series", or
                  "Travel Photos"
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="content-description"
                  className="text-sm font-medium"
                >
                  Description (Optional)
                </label>
                <div className="relative">
                  <textarea
                    id="content-description"
                    className="w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 min-h-[80px] resize-none"
                    placeholder="Add a description for your content"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Add details about your content for your own reference
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="w-full"
                  onClick={() => createAllowlist(name)}
                  disabled={name.trim() === "" || isCreating}
                >
                  {isCreating ? "Creating..." : "Create Photo Content"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Existing Contents Card */}
        <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-border/60">
          <CardHeader className="pb-3">
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Manage Your Contents</CardTitle>
            <CardDescription>
              Control access to your exclusive photos and manage viewers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                View and manage all your photo contents. Add or remove viewers,
                upload exclusive photos, and configure access settings.
              </p>
              <Button
                className="w-full border-primary/20 hover:border-primary/40"
                onClick={handleViewAll}
              >
                View All Contents
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-border/60">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-3">
            Quick Guide to Creating Exclusive Photo Contents
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                <span className="font-medium">1</span>
              </div>
              <h4 className="font-medium">Create a Photo Content</h4>
              <p className="text-sm text-muted-foreground">
                Set up a named content to organize your exclusive photos for
                viewers.
              </p>
            </div>
            <div className="space-y-2">
              <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                <span className="font-medium">2</span>
              </div>
              <h4 className="font-medium">Add Viewers</h4>
              <p className="text-sm text-muted-foreground">
                Add wallet addresses of viewers who should have access to your
                photos.
              </p>
            </div>
            <div className="space-y-2">
              <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                <span className="font-medium">3</span>
              </div>
              <h4 className="font-medium">Upload Private Photos</h4>
              <p className="text-sm text-muted-foreground">
                Upload and encrypt your exclusive photos, which will only be
                viewable by authorized viewers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
