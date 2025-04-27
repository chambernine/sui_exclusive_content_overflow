import { useState, ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase/firestore";
import { AlbumTier, DraftAlbum, DraftAlbumStatus } from "@/types/album";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import axios from "axios";
import { fileToBase64 } from "@/utils/fileFormat";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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

export default function CreateDraftAlbum() {
  const { address } = useSuiAccount();

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
      alert(`🚫 Maximum of ${maxAllowed} preview files allowed.`);
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
      alert(`🚫 Maximum of ${maxAllowed} content files allowed.`);
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

  const handleSave = async () => {
    if (!address) {
      alert("⚠️ Wallet connect required.");
      return;
    }

    const base64Contents = draft.contents
      ? await Promise.all(draft.contents.map(fileToBase64))
      : [];

    const base64Previews = draft.contentInfos
      ? await Promise.all(draft.contentInfos.map(fileToBase64))
      : [];

    const draftAlbum: DraftAlbum = {
      ...draft,
      albumId: uuidv4(),
      owner: address,
      contents: base64Contents,
      contentInfos: base64Previews,
    };

      console.log(draftAlbum)
    try {
      const response = await axios.post(
        "http://localhost:3000/draft-album/request-approval",
        draftAlbum,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("✅ Submitted:", response.data);
      alert("✅ Draft album submitted for approval!");
    } catch (error) {
      console.error("❌ Submission failed:", error);
      alert("Submission failed. Check console.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">🎶 Create Draft Album</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Album Name</Label>
          <Input name="name" value={draft.name} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="tier">Tier</Label>
          <select
            name="tier"
            value={draft.tier}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
          >
            <option value={AlbumTier.standard}>Standard</option>
            <option value={AlbumTier.premium}>Premium</option>
            <option value={AlbumTier.exclusive}>Exclusive</option>
            <option value={AlbumTier.principle}>Principle</option>
          </select>
        </div>

        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            type="number"
            name="price"
            value={draft.price}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            name="description"
            value={draft.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            name="tags"
            value={draft.tags.join(", ")}
            onChange={handleChange}
          />
        </div>

        {/* Preview Section */}
        <div>
          <Label htmlFor="preview">Upload Preview Images</Label>
          <Input
            id="preview"
            type="file"
            accept="image/*"
            multiple
            onChange={handlePreviewFiles}
          />
          {previewContentInfos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {previewContentInfos.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`preview-${index}`}
                  className="h-24 w-full object-cover rounded border border-gray-700"
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div>
          <Label htmlFor="content">Upload Album Content</Label>
          <Input
            id="content"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleContentFiles}
          />
          {previewContents.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {previewContents.map((src, index) => (
                <img
                  key={index}                  
                  src={src}
                  className="h-24 w-full object-cover rounded border border-gray-700"
                />
              ))}
            </div>
          )}
          <p className="text-sm text-gray-400">Max 10 files per section</p>
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
        >
          📤 Publish for Approval
        </Button>
      </div>
    </div>
  );
}