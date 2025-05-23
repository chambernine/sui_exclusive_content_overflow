import { useState, ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase/firestore";
import {
  AlbumTier,
  AlbumCategory,
  DraftAlbum,
  DraftAlbumStatus,
  tierColors,
  tierNames,
  categoryNames,
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
  FileText,
  Check,
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  Grid,
  Users,
  Type,
  Award,
  Coins,
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
  category: AlbumCategory;
  price: number;
  description: string;
  tags: string[];
  status: DraftAlbumStatus;
  contentInfos: File[] | null;
  contents: File[] | null;
  created_at: Timestamp;
  limited: number | null;
}

export default function CreateAlbumPage() {
  const { address } = useSuiAccount();
  const { mutate: submitDraftAlbum, isPending: isSubmitting } =
    useSubmitDraftAlbum();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 2;

  const [draft, setDraft] = useState<IFormDraftAlbum>({
    albumId: "",
    owner: "",
    name: "",
    tier: AlbumTier.standard,
    category: AlbumCategory.photo,
    price: 0,
    description: "",
    tags: [],
    status: DraftAlbumStatus.requestApprove,
    contentInfos: [],
    contents: [],
    created_at: Timestamp.now(),
    limited: 10,
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
    if (name === "category") {
      return setDraft((prev) => ({
        ...prev,
        category: parseInt(value) as AlbumCategory,
      }));
    }
    if (name === "price") {
      const floatValue = parseFloat(value);
      return setDraft((prev) => ({
        ...prev,
        price: isNaN(floatValue) ? 0 : parseFloat(floatValue.toFixed(5)),
      }));
    }
    if (name === "limited") {
      const intValue = parseInt(value);
      return setDraft((prev) => ({
        ...prev,
        limited: isNaN(intValue) ? null : Math.min(intValue, 100000),
      }));
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
    const maxAllowed = 3;
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
    const maxAllowed = 5;
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

  const handleSelectCategory = (value: string) => {
    setDraft((prev) => ({
      ...prev,
      category: parseInt(value) as AlbumCategory,
    }));
  };

  const validateStep1 = () => {
    if (!draft.name) {
      toast.error("Please enter an album name.");
      return false;
    }

    if (!draft.description) {
      toast.error("Please enter a description.");
      return false;
    }

    if (draft.price <= 0) {
      toast.error("Please enter a valid price.");
      return false;
    }

    if (
      draft.limited !== null &&
      (draft.limited < 10 || draft.limited > 100000)
    ) {
      toast.error("Membership limit must be between 10 and 100,000.");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!draft.contentInfos || draft.contentInfos.length === 0) {
      toast.error("Please upload at least one preview image.");
      return false;
    }

    if (!draft.contents || draft.contents.length === 0) {
      toast.error("Please upload at least one content file.");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      handleSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!address) {
      toast.error("Wallet connect required.");
      return;
    }

    if (!validateStep1() || !validateStep2()) {
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
        category: draft.category,
        limited: draft.limited,
      };

      submitDraftAlbum(draftAlbum, {
        onSuccess: () => {
          // Reset form
          setDraft({
            albumId: "",
            owner: "",
            name: "",
            tier: AlbumTier.standard,
            category: AlbumCategory.photo,
            price: 0,
            description: "",
            tags: [],
            status: DraftAlbumStatus.requestApprove,
            contentInfos: [],
            contents: [],
            created_at: Timestamp.now(),
            limited: null,
          });
          setPreviewContentInfos([]);
          setPreviewContents([]);
          setCurrentStep(1);
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

  // Stepper component
  const FormStepper = () => (
    <div className="4">
      <div className="flex items-center justify-between px-6">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className="flex flex-col gap-2 sm:flex-row items-center"
          >
            <div
              className={`flex items-center justify-center h-10 w-10 rounded-full border-2 
                ${
                  currentStep === step
                    ? "border-primary bg-primary text-white"
                    : currentStep > step
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
            >
              {currentStep > step ? (
                <Check className="h-5 w-5" />
              ) : (
                <span>{step}</span>
              )}
            </div>
            <div className="flex flex-col sm:block ml-2">
              <p
                className={`text-sm font-medium ${
                  currentStep === step
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {step === 1 ? "Content Details" : "Upload Files"}
              </p>
            </div>
            {step < totalSteps && (
              <div className="flex-1 border-t border-border mx-4 hidden sm:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderContentDetailsStep = () => (
    <Card className="overflow-hidden backdrop-blur-sm border-border hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Content Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div variants={item} className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="name">
              <div className="flex items-center gap-1">
                <Type className="h-4 w-4" />
                Content Name
              </div>
            </Label>
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
              <Label htmlFor="tier">
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Tier
                </div>
              </Label>
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
              <Label htmlFor="category">
                <div className="flex items-center gap-1">
                  <Grid className="h-4 w-4" />
                  Category
                </div>
              </Label>
              <Select
                value={draft.category.toString()}
                onValueChange={handleSelectCategory}
                disabled
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryNames).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">{value}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="price">
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4" />
                  Price (SUI)
                </div>
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

            <div className="flex flex-col gap-1">
              <Label htmlFor="limited">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Membership Limit
                </div>
              </Label>
              <Input
                id="limited"
                type="number"
                name="limited"
                value={draft.limited || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (
                    e.target.value === "" ||
                    (value >= 10 && value <= 100000)
                  ) {
                    handleChange(e);
                  }
                }}
                defaultValue={10}
                placeholder="10"
                className="mt-1"
                min="10"
                max="100000"
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
  );

  const renderUploadFilesStep = () => (
    <>
      <motion.div variants={item}>
        <Card className="overflow-hidden backdrop-blur-sm border-border hover:shadow-lg transition-shadow mb-6 gap-2 ">
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
                      These images will be shown as previews
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
                  <h3 className="text-sm font-medium flex items-center justify-between">
                    <span>
                      {previewContentInfos.length} Preview Image
                      {previewContentInfos.length !== 1 && "s"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {previewContentInfos.length} of 3
                    </span>
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
                  {previewContentInfos.length < 3 && (
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
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden backdrop-blur-sm border-border hover:shadow-lg transition-shadow gap-2">
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
                  <h3 className="text-sm font-medium flex items-center justify-between">
                    <span>
                      {previewContents.length} Content File
                      {previewContents.length !== 1 && "s"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {previewContents.length} of 5
                    </span>
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
                  {previewContents.length < 5 && (
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
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );

  const renderAlbumForm = () => (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <FormStepper />

      {currentStep === 1 ? renderContentDetailsStep() : renderUploadFilesStep()}

      <motion.div variants={item} className="flex justify-between">
        {currentStep > 1 && (
          <Button onClick={handleBack} variant="outline" type="button">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <div className={currentStep === 1 ? "ml-auto" : ""}>
          <Button onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {currentStep < totalSteps ? (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Submit for Approval
                  </>
                )}
              </div>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <Protected description="Connect wallet to create content.">
      <div className="container w-full mx-auto py-4 px-4 sm:px-16">
        {renderAlbumForm()}
      </div>
    </Protected>
  );
}
