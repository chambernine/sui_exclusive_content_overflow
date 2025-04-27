import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { useEffect, useState } from "react";
import {
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  Search,
  User,
  Users,
  X,
  Lock,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { useNetworkVariable } from "../../config/networkConfig";
import { getObjectExplorerLink } from "@/lib/sui";
import { motion } from "framer-motion";

export interface Allowlist {
  id: string;
  name: string;
  list: string[];
}

interface AllowlistProps {
  setRecipientAllowlist: React.Dispatch<React.SetStateAction<string>>;
  setCapId: React.Dispatch<React.SetStateAction<string>>;
}

export function Allowlist({ setRecipientAllowlist, setCapId }: AllowlistProps) {
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [allowlist, setAllowlist] = useState<Allowlist>();
  const [isLoading, setIsLoading] = useState(true);
  const [newAddress, setNewAddress] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const { id } = useParams();
  const [capId, setInnerCapId] = useState<string>();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  useEffect(() => {
    async function getAllowlist() {
      setIsLoading(true);
      if (!currentAccount?.address) {
        console.warn("No account address available");
        setIsLoading(false);
        return;
      }

      try {
        // load all caps
        const res = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          options: {
            showContent: true,
            showType: true,
          },
          filter: {
            StructType: `${packageId}::allowlist::Cap`,
          },
        });

        // find the cap for the given allowlist id
        const capId = res.data
          .map((obj) => {
            const fields = (obj!.data!.content as { fields: any }).fields;
            return {
              id: fields?.id.id,
              allowlist_id: fields?.allowlist_id,
            };
          })
          .filter((item) => item.allowlist_id === id)
          .map((item) => item.id) as string[];
        setCapId(capId[0]);
        setInnerCapId(capId[0]);

        // load the allowlist for the given id
        const allowlist = await suiClient.getObject({
          id: id!,
          options: { showContent: true },
        });
        const fields =
          (allowlist.data?.content as { fields: any })?.fields || {};
        setAllowlist({
          id: id!,
          name: fields.name,
          list: fields.list,
        });
        setRecipientAllowlist(id!);
      } catch (error) {
        console.error("Error fetching membership tier:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Call getAllowlist immediately
    getAllowlist();
  }, [id, currentAccount?.address]);

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

  const addItem = async (
    newAddressToAdd: string,
    wl_id: string,
    cap_id: string
  ) => {
    if (newAddressToAdd.trim() !== "") {
      if (!isValidSuiAddress(newAddressToAdd.trim())) {
        alert("Invalid wallet address");
        return;
      }

      setIsAddingAddress(true);

      try {
        const tx = new Transaction();
        tx.moveCall({
          arguments: [
            tx.object(wl_id),
            tx.object(cap_id),
            tx.pure.address(newAddressToAdd.trim()),
          ],
          target: `${packageId}::allowlist::add`,
        });
        tx.setGasBudget(10000000);

        await signAndExecute(
          {
            transaction: tx,
          },
          {
            onSuccess: async (result) => {
              console.log("res", result);
              setNewAddress("");
            },
          }
        );
      } catch (error) {
        console.error("Error adding subscriber:", error);
      } finally {
        setIsAddingAddress(false);
      }
    }
  };

  const removeItem = async (
    addressToRemove: string,
    wl_id: string,
    cap_id: string
  ) => {
    if (addressToRemove.trim() !== "") {
      setIsRemoving(addressToRemove);
      try {
        const tx = new Transaction();
        tx.moveCall({
          arguments: [
            tx.object(wl_id),
            tx.object(cap_id),
            tx.pure.address(addressToRemove.trim()),
          ],
          target: `${packageId}::allowlist::remove`,
        });
        tx.setGasBudget(10000000);

        await signAndExecute(
          {
            transaction: tx,
          },
          {
            onSuccess: async (result) => {
              console.log("res", result);
            },
          }
        );
      } catch (error) {
        console.error("Error removing subscriber:", error);
      } finally {
        setIsRemoving(null);
      }
    }
  };

  const copyToClipboard = () => {
    if (!allowlist?.id) return;

    const shareUrl = `${window.location.origin}/allowlist-example/view/allowlist/${allowlist.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);

    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  // Filter list by search term if needed
  const filteredList =
    searchTerm && allowlist?.list
      ? allowlist.list.filter((address) =>
          address.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allowlist?.list;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden border-border/60 bg-background/50 backdrop-blur-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Loading membership information...
              </p>
            </div>
          </div>
        ) : (
          <>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-full">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    {allowlist?.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <span>Membership ID:</span>
                    {allowlist?.id && getObjectExplorerLink(allowlist.id)}
                  </CardDescription>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={copyToClipboard}
                  >
                    {copySuccess ? (
                      <>
                        <span className="text-green-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy share link
                      </>
                    )}
                  </Button>

                  <a
                    href={`${window.location.origin}/allowlist-example/view/allowlist/${allowlist?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" className="gap-1.5 w-full">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View as Subscriber
                    </Button>
                  </a>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <h3 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-primary/70" />
                  Exclusive Content Management
                </h3>
                <p className="text-sm text-muted-foreground">
                  Share your membership link with users to access your exclusive
                  photos. Only subscribers you add below will be able to decrypt
                  and view your content.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Manage Subscribers</h3>

                {/* Add new address form */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <input
                      className="w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                      placeholder="Add subscriber wallet address (0x...)"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      disabled={isAddingAddress}
                    />
                    <User className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <Button
                    onClick={() => addItem(newAddress, id!, capId!)}
                    disabled={!newAddress || isAddingAddress}
                    className="gap-1"
                  >
                    {isAddingAddress ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add Subscriber
                  </Button>
                </div>

                {/* Search subscribers */}
                {Array.isArray(allowlist?.list) &&
                  allowlist?.list.length > 0 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        className="w-full rounded-md border bg-transparent pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                        placeholder="Search subscribers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  )}

                {/* Subscriber list */}
                <div className="border rounded-lg divide-y">
                  {Array.isArray(filteredList) && filteredList.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto">
                      {filteredList.map((address, index) => (
                        <div
                          key={`${address}-${index}`}
                          className="flex items-center justify-between p-3 hover:bg-accent/30 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/5 p-1.5 rounded-full">
                              <User className="h-3.5 w-3.5 text-primary/70" />
                            </div>
                            <span className="font-mono text-sm truncate">
                              {address}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(address, id!, capId!)}
                            disabled={isRemoving === address}
                          >
                            {isRemoving === address ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-muted p-3 rounded-full">
                          <Users className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium">No subscribers yet</p>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          Add wallet addresses to give subscribers access to
                          your exclusive photos.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subscriber count */}
                {Array.isArray(allowlist?.list) &&
                  allowlist?.list.length > 0 && (
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>
                        {searchTerm &&
                        filteredList &&
                        filteredList.length !== allowlist?.list.length ? (
                          <>
                            Showing {filteredList?.length} of{" "}
                            {allowlist?.list.length} subscribers
                          </>
                        ) : (
                          <>{allowlist?.list.length} subscribers total</>
                        )}
                      </span>

                      {searchTerm &&
                        filteredList &&
                        filteredList.length !== allowlist?.list.length && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => setSearchTerm("")}
                          >
                            Clear search
                          </Button>
                        )}
                    </div>
                  )}
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </motion.div>
  );
}
