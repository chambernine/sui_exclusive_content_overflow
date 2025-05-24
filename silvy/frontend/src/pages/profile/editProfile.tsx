import React, { useState } from "react";
import { useSuiAccount } from "@/hooks/useSuiAccount";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import type { SocialBanner } from "@/types/profile";

import axios from "axios";
import { fileToBase64 } from "@/utils/fileFormat";
import { DOMAIN_DEV } from "@/constant/constant";

interface IUserData {
  walletAddress?: string;
  username: string;
  profile_image_file: File | null;
  banner_image_files: File[] | null;
  social_links: SocialBanner;
  description: string;
}

export default function Profile() {
  const { address } = useSuiAccount();

  const [formData, setFormData] = useState<IUserData>({
    username: "",
    description: "",
    profile_image_file: null,
    banner_image_files: null,
    social_links: {
      x: null,
      instragram: null,
      twitch: null,
      youtube: null,
    },
  });

  const [previewProfileImage, setPreviewProfileImage] = useState<string | null>(
    null
  );
  const [previewBannerImages, setPreviewBannerImages] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "profile_image_file" && files?.[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, profile_image_file: file }));
      setPreviewProfileImage(URL.createObjectURL(file));
    } else if (name === "banner_image_files" && files?.length) {
      const fileList = Array.from(files);
      setFormData((prev) => ({ ...prev, banner_image_files: fileList }));
      setPreviewBannerImages(fileList.map((file) => URL.createObjectURL(file)));
    } else if (name in formData.social_links) {
      setFormData((prev) => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [name]: value || null,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profileImageBase64 = formData.profile_image_file
      ? await fileToBase64(formData.profile_image_file as File)
      : null;
    const bannerImagesBase64 = formData.banner_image_files
      ? await Promise.all(
          formData.banner_image_files.map((f) => fileToBase64(f))
        )
      : [];

    const form = {
      ...formData,
      walletAddress: address,
      profile_image_file: profileImageBase64,
      banner_image_files: bannerImagesBase64,
    };
    console.log(form);
    const response = await axios.post(`${DOMAIN_DEV}/edit-profile`, form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    );

    console.log(response);
    // const result = await response.json();
    // console.log(result);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>👤 Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Profile Image Upload */}
            <div>
              <Label htmlFor="profile_image_file">Profile Image</Label>
              <Input
                id="profile_image_file"
                name="profile_image_file"
                type="file"
                accept="image/*"
                onChange={handleChange}
              />
              {previewProfileImage && (
                <img
                  src={previewProfileImage}
                  alt="Profile Preview"
                  className="mt-2 h-32 w-32 object-cover rounded-full border"
                />
              )}
            </div>

            {/* Banner Images Upload */}
            <div>
              <Label htmlFor="banner_image_files">Banner Images</Label>
              <Input
                id="banner_image_files"
                name="banner_image_files"
                type="file"
                accept="image/*"
                multiple
                onChange={handleChange}
              />
              {previewBannerImages.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {previewBannerImages.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`Banner ${index}`}
                      className="h-24 w-full object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(formData.social_links).map(
                ([platform, value]) => (
                  <div key={platform}>
                    <Label htmlFor={platform}>{platform}</Label>
                    <Input
                      id={platform}
                      name={platform}
                      value={value || ""}
                      onChange={handleChange}
                    />
                  </div>
                )
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full mt-4">
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
