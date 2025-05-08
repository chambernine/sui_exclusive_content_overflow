import { useState, ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase/firestore";
import {
  AlbumTier,
  DraftAlbum,
  DraftAlbumStatus,
  tierColors,
  tierNames,
} from "@/types/album";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { fileToBase64 } from "@/utils/fileFormat";
import { motion } from "framer-motion";
import { useSubmitDraftAlbum } from "@/hooks/api/useAlbums";
import {
  Image,
  Upload,
  X,
  Tag as TagIcon,
  Sparkles,
  FileText,
  Check,
  PlusCircle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Protected } from "@/components/auth/Protected";

export interface IFormDraftAlbum {
  albumId: string;
  owner: string;
  name: string;
  tier: AlbumTier;
  price: number;
  description: string;
  tags: string[];
  status: DraftAlbumStatus;
  contentInfos: File[] | null;
  contents: File[] | null;
  created_at: Timestamp;
}

export default function CreateAlbumPage() {
  const { address } = useSuiAccount();
  const { mutate: submitDraftAlbum, isPending: isSubmitting } =
    useSubmitDraftAlbum();

  const [draft, setDraft] = useState<IFormDraftAlbum>({
    albumId: "",
    owner: "",
    name: "",
    tier: AlbumTier.standard,
    price: 0,
    description: "",
    tags: [],
    status: DraftAlbumStatus.requestApprove,
    contentInfos: [],
    contents: [],
    created_at: Timestamp.now(),
  });

  const [previewContentInfos, setPreviewContentInfos] = useState<string[]>([]);
  const [previewContents, setPreviewContents] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "tier") {
      return setDraft((prev) => ({
        ...prev,
        tier: parseInt(value) as AlbumTier,
      }));
    }
    if (name === "price") {
      return setDraft((prev) => ({ ...prev, price: parseInt(value) }));
    }
    if (name === "tags") {
      return setDraft((prev) => ({
        ...prev,
        tags: value.split(",").map((tag) => tag.trim()),
      }));
    }

    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreviewFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    const maxAllowed = 10;
    const current = draft.contentInfos?.length || 0;

    if (current + fileList.length > maxAllowed) {
      toast.error(`Maximum of ${maxAllowed} preview files allowed.`);
      return;
    }

    setDraft((prev) => ({
      ...prev,
      contentInfos: [...(prev.contentInfos || []), ...fileList],
    }));

    setPreviewContentInfos((prev) => [
      ...prev,
      ...fileList.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleContentFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    const maxAllowed = 10;
    const current = draft.contents?.length || 0;

    if (current + fileList.length > maxAllowed) {
      toast.error(`Maximum of ${maxAllowed} content files allowed.`);
      return;
    }

    setDraft((prev) => ({
      ...prev,
      contents: [...(prev.contents || []), ...fileList],
    }));

    setPreviewContents((prev) => [
      ...prev,
      ...fileList.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeContentInfoFile = (index: number) => {
    const newContentInfos = [...(draft.contentInfos || [])];
    newContentInfos.splice(index, 1);

    const newPreviews = [...previewContentInfos];
    newPreviews.splice(index, 1);

    setDraft((prev) => ({
      ...prev,
      contentInfos: newContentInfos.length ? newContentInfos : [],
    }));
    setPreviewContentInfos(newPreviews);
  };

  const removeContentFile = (index: number) => {
    const newContents = [...(draft.contents || [])];
    newContents.splice(index, 1);

    const newPreviews = [...previewContents];
    newPreviews.splice(index, 1);

    setDraft((prev) => ({
      ...prev,
      contents: newContents.length ? newContents : [],
    }));
    setPreviewContents(newPreviews);
  };

  const handleSelectTier = (value: string) => {
    setDraft((prev) => ({
      ...prev,
      tier: parseInt(value) as AlbumTier,
    }));
  };

  const handleSave = async () => {
    if (!address) {
      toast.error("Wallet connect required.");
      return;
    }

    if (!draft.name) {
      toast.error("Please enter an album name.");
      return;
    }

    if (!draft.description) {
      toast.error("Please enter a description.");
      return;
    }

    if (draft.price <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    if (!draft.contentInfos || draft.contentInfos.length === 0) {
      toast.error("Please upload at least one preview image.");
      return;
    }

    if (!draft.contents || draft.contents.length === 0) {
      toast.error("Please upload at least one content file.");
      return;
    }

    try {
      const base64Contents = draft.contents
        ? await Promise.all(draft.contents.map(fileToBase64))
        : [];

      const base64Previews = draft.contentInfos
        ? await Promise.all(draft.contentInfos.map(fileToBase64))
        : [];

      const draftAlbum: DraftAlbum = {
        ...draft,
        id: uuidv4(),
        owner: address,
        contents: base64Contents,
        contentInfos: base64Previews,
      };

      submitDraftAlbum(draftAlbum, {
        onSuccess: () => {
          // Reset form
          setDraft({
            albumId: "",
            owner: "",
            name: "",
            tier: AlbumTier.standard,
            price: 0,
            description: "",
            tags: [],
            status: DraftAlbumStatus.requestApprove,
            contentInfos: [],
            contents: [],
            created_at: Timestamp.now(),
          });
          setPreviewContentInfos([]);
          setPreviewContents([]);
        },
      });
    } catch (error) {
      console.error("Preparation failed:", error);
      toast.error("Failed to prepare submission. Please try again.");
    }
  };

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

  const renderAlbumForm = () => (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <Card className="overflow-hidden backdrop-blur-sm border-border hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div variants={item} className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Content Name</Label>
              <Input
                id="name"
                name="name"
                value={draft.name}
                onChange={handleChange}
                placeholder="Enter content name"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="tier">Tier</Label>
                <Select
                  value={draft.tier.toString()}
                  onValueChange={handleSelectTier}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tierNames).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full ${
                              tierColors[key as unknown as AlbumTier]
                            }`}
                          />
                          {value}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="price">
                  <div className="flex items-center gap-1">Price (SUI)</div>
                </Label>
                <Input
                  id="price"
                  type="number"
                  name="price"
                  value={draft.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="description">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Description
                </div>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={draft.description}
                onChange={handleChange}
                placeholder="Describe your content"
                className="mt-1 min-h-24"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="tags">
                <div className="flex items-center gap-1">
                  <TagIcon className="h-4 w-4" />
                  Tags (comma separated)
                </div>
              </Label>
              <Input
                id="tags"
                name="tags"
                value={draft.tags.join(", ")}
                onChange={handleChange}
                placeholder="art, photography, exclusive, etc."
                className="mt-1"
              />
            </div>
          </motion.div>
        </CardContent>
      </Card>

      <motion.div variants={item}>
        <Card className="overflow-hidden backdrop-blur-sm border-border hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Preview Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewContentInfos.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors hover:border-primary/50">
                <label
                  htmlFor="preview-images"
                  className="cursor-pointer block"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Image className="h-8 w-8 text-muted-foreground" />
                    <span className="font-medium">Upload Preview Images</span>
                    <span className="text-xs text-muted-foreground">
                      These images will be shown as previews to potential buyers
                    </span>
                  </div>
                </label>
                <input
                  id="preview-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePreviewFiles}
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium">
                    {previewContentInfos.length} Preview Image
                    {previewContentInfos.length !== 1 && "s"}
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {previewContentInfos.map((src, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-md overflow-hidden border border-border"
                    >
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeContentInfoFile(index)}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <label
                    htmlFor="preview-images-additional"
                    className="cursor-pointer flex items-center justify-center aspect-square border-2 border-dashed border-border rounded-md hover:border-primary/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <PlusCircle className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">
                        Add more
                      </span>
                    </div>
                    <input
                      id="preview-images-additional"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePreviewFiles}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden backdrop-blur-sm border-border hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Exclusive Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewContents.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors hover:border-primary/50">
                <label htmlFor="content-files" className="cursor-pointer block">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="font-medium">
                      Upload Exclusive Content
                    </span>
                    <span className="text-xs text-muted-foreground">
                      These files will be accessible to users after purchase
                    </span>
                  </div>
                </label>
                <input
                  id="content-files"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleContentFiles}
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium">
                    {previewContents.length} Content File
                    {previewContents.length !== 1 && "s"}
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {previewContents.map((src, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-md overflow-hidden border border-border"
                    >
                      <img
                        src={src}
                        className="h-full w-full object-cover"
                        alt={`Content ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeContentFile(index)}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <label
                    htmlFor="content-files-additional"
                    className="cursor-pointer flex items-center justify-center aspect-square border-2 border-dashed border-border rounded-md hover:border-primary/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <PlusCircle className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">
                        Add more
                      </span>
                    </div>
                    <input
                      id="content-files-additional"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleContentFiles}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="flex justify-end">
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Submit for Approval
            </div>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );

  return (
    <Protected description="Connect wallet to create content.">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Create New Content
          </h1>
          <p className="text-muted-foreground">
            Share your exclusive content with your fans and supporters
          </p>
        </motion.div>

        {renderAlbumForm()}
      </div>
    </Protected>
  );
}
