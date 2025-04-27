import React, { useState, useEffect } from "react";
import { Transaction } from "@mysten/sui/transactions";

import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllowlistedKeyServers, SealClient } from "@mysten/seal";
import { fromHex, toHex } from "@mysten/sui/utils";
import { useNetworkVariable } from "@/config/networkConfig";
import {
  Loader2,
  Upload,
  Image,
  Check,
  Server,
  FileImage,
  Lock,
  Save,
  Clock,
  Trash,
} from "lucide-react";
import { Draft } from "@/lib/types";
import { DraftsManager } from "@/lib/draftsManager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type Data = {
  status: string;
  blobId: string;
  endEpoch: string;
  suiRefType: string;
  suiRef: string;
  suiBaseUrl: string;
  blobUrl: string;
  suiUrl: string;
  isImage: string;
};

interface WalrusUploadProps {
  policyObject: string;
  cap_id: string;
  moduleName: string;
}

type WalrusService = {
  id: string;
  name: string;
  publisherUrl: string;
  aggregatorUrl: string;
};

export function WalrusUpload({
  policyObject,
  cap_id,
  moduleName,
}: WalrusUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<Data | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<string>("service1");
  const [isDraftSaving, setIsDraftSaving] = useState<boolean>(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [showDraftsDialog, setShowDraftsDialog] = useState(false);
  const [draftName, setDraftName] = useState<string>("");
  const [draftDescription, setDraftDescription] = useState<string>("");

  const SUI_VIEW_TX_URL = `https://suiscan.xyz/testnet/tx`;
  const SUI_VIEW_OBJECT_URL = `https://suiscan.xyz/testnet/object`;

  const NUM_EPOCH = 1;
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();
  const client = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers("testnet"),
    verifyKeyServers: false,
  });

  const services: WalrusService[] = [
    {
      id: "service1",
      name: "walrus.space",
      publisherUrl: "/publisher1",
      aggregatorUrl: "/aggregator1",
    },
    {
      id: "service2",
      name: "staketab.org",
      publisherUrl: "/publisher2",
      aggregatorUrl: "/aggregator2",
    },
    {
      id: "service3",
      name: "redundex.com",
      publisherUrl: "/publisher3",
      aggregatorUrl: "/aggregator3",
    },
    {
      id: "service4",
      name: "nodes.guru",
      publisherUrl: "/publisher4",
      aggregatorUrl: "/aggregator4",
    },
    {
      id: "service5",
      name: "banansen.dev",
      publisherUrl: "/publisher5",
      aggregatorUrl: "/aggregator5",
    },
    {
      id: "service6",
      name: "everstake.one",
      publisherUrl: "/publisher6",
      aggregatorUrl: "/aggregator6",
    },
  ];

  function getAggregatorUrl(path: string): string {
    const service = services.find((s) => s.id === selectedService);
    const cleanPath = path.replace(/^\/+/, "").replace(/^v1\//, "");
    return `${service?.aggregatorUrl}/v1/${cleanPath}`;
  }

  function getPublisherUrl(path: string): string {
    const service = services.find((s) => s.id === selectedService);
    const cleanPath = path.replace(/^\/+/, "").replace(/^v1\//, "");
    return `${service?.publisherUrl}/v1/${cleanPath}`;
  }

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

  useEffect(() => {
    const loadedDrafts = DraftsManager.getDrafts();
    setDrafts(loadedDrafts);
  }, []);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    // Max 10 MiB size
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10 MiB");
      return;
    }
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }
    setFile(file);
    setInfo(null);
  };

  const handleSaveDraft = () => {
    if (draftName.trim() === "") {
      alert("Please enter a name for your draft");
      return;
    }

    setIsDraftSaving(true);

    try {
      const draft: Draft = {
        id: currentDraftId || crypto.randomUUID(),
        name: draftName,
        createdAt: new Date(),
        updatedAt: new Date(),
        content: {
          title: draftName,
          description: draftDescription,
          imageFiles: file ? [file] : undefined,
        },
      };

      const savedDraft = DraftsManager.saveDraft(draft);
      setCurrentDraftId(savedDraft.id);

      // Update the drafts list
      setDrafts(DraftsManager.getDrafts());

      // Show success message
      alert("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft. Please try again.");
    } finally {
      setIsDraftSaving(false);
    }
  };

  const loadDraft = (draft: Draft) => {
    setDraftName(draft.name);
    setDraftDescription(draft.content?.description || "");
    setCurrentDraftId(draft.id);

    // If the draft has image files, load the first one
    if (draft.content?.imageFiles?.length) {
      // We can't directly restore the File object from localStorage
      // Instead, show a message that the file needs to be re-selected
      setFile(null);
    }

    setShowDraftsDialog(false);
  };

  const deleteDraft = (id: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    if (confirm("Are you sure you want to delete this draft?")) {
      DraftsManager.deleteDraft(id);

      // If deleted the current draft, clear the form
      if (id === currentDraftId) {
        setDraftName("");
        setDraftDescription("");
        setFile(null);
        setCurrentDraftId(null);
      }

      // Update the drafts list
      setDrafts(DraftsManager.getDrafts());
    }
  };

  const handleSubmit = () => {
    setIsUploading(true);
    if (file) {
      const reader = new FileReader();
      reader.onload = async function (event) {
        if (event.target && event.target.result) {
          const result = event.target.result;
          if (result instanceof ArrayBuffer) {
            const nonce = crypto.getRandomValues(new Uint8Array(5));
            const policyObjectBytes = fromHex(policyObject);
            const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));
            const { encryptedObject: encryptedBytes } = await client.encrypt({
              threshold: 2,
              packageId,
              id,
              data: new Uint8Array(result),
            });
            const storageInfo = await storeBlob(encryptedBytes);
            displayUpload(storageInfo.info, file.type);
            setIsUploading(false);
          } else {
            console.error("Unexpected result type:", typeof result);
            setIsUploading(false);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.error("No file selected");
    }
  };

  const displayUpload = (storage_info: any, media_type: any) => {
    let info;
    if ("alreadyCertified" in storage_info) {
      info = {
        status: "Already certified",
        blobId: storage_info.alreadyCertified.blobId,
        endEpoch: storage_info.alreadyCertified.endEpoch,
        suiRefType: "Previous Sui Certified Event",
        suiRef: storage_info.alreadyCertified.event.txDigest,
        suiBaseUrl: SUI_VIEW_TX_URL,
        blobUrl: getAggregatorUrl(
          `/v1/blobs/${storage_info.alreadyCertified.blobId}`
        ),
        suiUrl: `${SUI_VIEW_OBJECT_URL}/${storage_info.alreadyCertified.event.txDigest}`,
        isImage: media_type.startsWith("image"),
      };
    } else if ("newlyCreated" in storage_info) {
      info = {
        status: "Newly created",
        blobId: storage_info.newlyCreated.blobObject.blobId,
        endEpoch: storage_info.newlyCreated.blobObject.storage.endEpoch,
        suiRefType: "Associated Sui Object",
        suiRef: storage_info.newlyCreated.blobObject.id,
        suiBaseUrl: SUI_VIEW_OBJECT_URL,
        blobUrl: getAggregatorUrl(
          `/v1/blobs/${storage_info.newlyCreated.blobObject.blobId}`
        ),
        suiUrl: `${SUI_VIEW_OBJECT_URL}/${storage_info.newlyCreated.blobObject.id}`,
        isImage: media_type.startsWith("image"),
      };
    } else {
      throw Error("Unhandled successful response!");
    }
    setInfo(info);
  };

  const storeBlob = async (encryptedData: Uint8Array) => {
    try {
      console.log("Sending encrypted data to backend:", encryptedData);
      const response = await fetch("http://localhost:4000/api/publish_blob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          encryptedData,
          epoch: 3, // if you want to specify epoch, although backend already has fixed 3
        }),
      });
      const res = await response.json();

      if (!response.ok) {
        const errorResponse = await res;
        console.error("❌ Backend error:", errorResponse.error);
        throw new Error(errorResponse.error || "Unknown error occurred");
      }
      return res;
    } catch (error) {
      console.error("🔴 Error in storeBlob:", error);
      throw error;
    }
  };

  async function handlePublish(
    wl_id: string,
    cap_id: string,
    moduleName: string
  ) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::${moduleName}::publish`,
      arguments: [
        tx.object(wl_id),
        tx.object(cap_id),
        tx.pure.string(info!.blobId),
      ],
    });

    tx.setGasBudget(10000000);
    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          console.log("res", result);
          alert(
            "Blob attached successfully, now share the link or upload more."
          );
        },
      }
    );
  }

  return (
    <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-border/60">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mb-2">
              <FileImage className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Upload Exclusive Photo</CardTitle>
              <CardDescription>
                Upload and encrypt your private photos for subscribers
              </CardDescription>
            </div>
          </div>

          {drafts.length > 0 && (
            <Dialog open={showDraftsDialog} onOpenChange={setShowDraftsDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex gap-1.5 items-center"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Drafts ({drafts.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Saved Drafts</DialogTitle>
                  <DialogDescription>
                    Continue working on your previously saved content drafts
                  </DialogDescription>
                </DialogHeader>

                <div className="max-h-[400px] overflow-y-auto space-y-2 my-2">
                  {drafts.length > 0 ? (
                    drafts.map((draft) => (
                      <div
                        key={draft.id}
                        onClick={() => loadDraft(draft)}
                        className="border rounded-md p-4 hover:bg-accent/30 transition-colors cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <h3 className="font-medium">{draft.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            Last updated:{" "}
                            {new Date(draft.updatedAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                          onClick={(e) => deleteDraft(draft.id, e)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete draft</span>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No saved drafts found
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDraftsDialog(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Selection */}
        <div className="space-y-2">
          <label
            htmlFor="walrus-service"
            className="text-sm font-medium flex items-center gap-1.5"
          >
            <Server className="h-4 w-4 text-muted-foreground" />
            Select Walrus service:
          </label>
          <select
            id="walrus-service"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            aria-label="Select Walrus service"
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none"
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        {/* Draft name and description */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="draft-name" className="text-sm font-medium">
              Draft Name
            </label>
            <div className="relative">
              <input
                id="draft-name"
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                placeholder="Enter a name for your draft"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="draft-description" className="text-sm font-medium">
              Description (Optional)
            </label>
            <div className="relative">
              <textarea
                id="draft-description"
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 min-h-[60px] resize-none"
                placeholder="Add a description for your draft"
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* File upload */}
        <div className="space-y-4">
          <label htmlFor="file-upload" className="text-sm font-medium">
            Select Image to Upload
          </label>

          <div className="flex flex-col items-center gap-3">
            {!file ? (
              <>
                <FileImage className="h-10 w-10 text-muted-foreground" />
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  aria-label="Choose image file to upload"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  className="gap-2"
                >
                  <Image className="h-4 w-4" />
                  Browse for Image
                </Button>
              </>
            ) : (
              <div className="w-full bg-primary/5 border border-primary/10 p-4 rounded-md flex flex-col items-center">
                <div className="bg-background/50 p-2 rounded-full mb-2">
                  <FileImage className="h-8 w-8 text-primary" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{file.name}</span>
                </div>
                <Badge variant="outline" className="bg-background/70 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setInfo(null);
                    // Clear the file input
                    const fileInput = document.getElementById(
                      "file-upload"
                    ) as HTMLInputElement;
                    if (fileInput) fileInput.value = "";
                  }}
                  className="mt-3"
                >
                  Change Image
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              File size must be less than 10 MiB. Only image files are allowed.
            </p>
          </div>
        </div>

        {/* Upload steps - updated with 3 buttons */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Save Draft Button */}
          <div className="space-y-2">
            <Button
              onClick={handleSaveDraft}
              disabled={draftName.trim() === "" || isDraftSaving}
              className="w-full"
              variant="outline"
            >
              {isDraftSaving ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save Draft</span>
                </div>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Save your work for later
            </p>
          </div>

          {/* Encrypt & Upload Button */}
          <div className="space-y-2">
            <Button
              onClick={handleSubmit}
              disabled={file === null || isUploading}
              className="w-full"
              variant="secondary"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Encrypting & Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>1. Encrypt & Upload</span>
                </div>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              First encrypt and upload your image to Walrus
            </p>
          </div>

          {/* Associate to Membership Button */}
          <div className="space-y-2">
            <Button
              onClick={() => handlePublish(policyObject, cap_id, moduleName)}
              disabled={!info || !file || policyObject === ""}
              className="w-full"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>2. Associate to Membership</span>
              </div>
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Then link the photo to your membership
            </p>
          </div>
        </div>

        {currentDraftId && (
          <p className="text-xs text-primary flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Working from saved draft
          </p>
        )}

        {/* Upload info */}
        {info && file && (
          <div className="rounded-lg border bg-background/70 backdrop-blur-sm p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <h4 className="font-medium">Upload Successful</h4>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium">{info.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Blob ID:</span>
                <span className="font-medium font-mono">
                  {info.blobId.substring(0, 12)}...
                </span>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Links:</span>
                <div className="space-x-2 flex">
                  <a
                    href={info.blobUrl}
                    className="text-primary hover:underline text-sm"
                    download
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        info.blobUrl,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                  >
                    Encrypted File
                  </a>
                  <a
                    href={info.suiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Sui Object
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WalrusUpload;
