import React, { useState, useEffect } from "react";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Camera,
  Save,
  Trash2,
  X,
  Instagram,
  Twitter,
  Twitch,
  Youtube,
} from "lucide-react";
import { fileToBase64 } from "@/utils/fileFormat";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  description: z.string(),
  profile_image_file: z.any().optional(),
  banner_image_files: z.any().optional(),
  social_links: z.object({
    x: z.string().nullable(),
    instragram: z.string().nullable(),
    twitch: z.string().nullable(),
    youtube: z.string().nullable(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Profile() {
  const { address } = useSuiAccount();

  const [previewProfileImage, setPreviewProfileImage] = useState<string | null>(
    null
  );
  const [previewBannerImages, setPreviewBannerImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  // Initialize react-hook-form with zod resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      description: "",
      social_links: {
        x: null,
        instragram: null,
        twitch: null,
        youtube: null,
      },
    },
  });

  // Animation variants
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

  // Simulate fetch profile data (would fetch from backend in real app)
  useEffect(() => {
    // Mock delay for demo purposes
    const timer = setTimeout(() => {
      setProfileExists(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [address]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("profile_image_file", file);
      setPreviewProfileImage(URL.createObjectURL(file));
    }
  };

  const handleBannerImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      const fileList = Array.from(files);
      form.setValue("banner_image_files", fileList);
      setPreviewBannerImages(fileList.map((file) => URL.createObjectURL(file)));
    }
  };

  const removeBannerImage = (index: number) => {
    const currentFiles = form.getValues("banner_image_files") || [];
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);

    const newPreviews = [...previewBannerImages];
    newPreviews.splice(index, 1);

    form.setValue("banner_image_files", newFiles.length ? newFiles : null);
    setPreviewBannerImages(newPreviews);
  };

  const removeProfileImage = () => {
    form.setValue("profile_image_file", null);
    setPreviewProfileImage(null);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "x":
        return <Twitter size={18} />;
      case "instragram":
        return <Instagram size={18} />;
      case "twitch":
        return <Twitch size={18} />;
      case "youtube":
        return <Youtube size={18} />;
      default:
        return null;
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const profileImageBase64 = data.profile_image_file
        ? await fileToBase64(data.profile_image_file as File)
        : null;

      const bannerImagesBase64 = data.banner_image_files
        ? await Promise.all(
            (data.banner_image_files as File[]).map((f) => fileToBase64(f))
          )
        : [];

      const formData = {
        ...data,
        walletAddress: address,
        profile_image_file: profileImageBase64,
        banner_image_files: bannerImagesBase64,
      };

      // For demo, simulate API call
      setTimeout(() => {
        console.log("Profile saved:", formData);
        setIsLoading(false);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }, 1500);

      // In real app:
      // const response = await axios.post('http://localhost:3000/edit-profile', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });
      // console.log(response);
    } catch (error) {
      console.error("Error saving profile:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">👤 Your Profile</h1>
        <p className="text-muted-foreground mb-6">
          Customize how others see you on the platform
        </p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show">
        <Card className="dark:bg-black/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="gradient-text">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <motion.div
                  variants={item}
                  className="flex flex-col md:flex-row gap-8"
                >
                  {/* Profile Image Upload */}
                  <div className="mx-auto md:mx-0">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-secondary flex items-center justify-center border-2 border-primary/20">
                        {previewProfileImage ? (
                          <img
                            src={previewProfileImage}
                            alt="Profile Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>

                      <label
                        htmlFor="profile_image_file"
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
                      >
                        <span className="text-white text-sm">Change Photo</span>
                      </label>

                      <input
                        id="profile_image_file"
                        name="profile_image_file"
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />

                      {previewProfileImage && (
                        <button
                          type="button"
                          onClick={removeProfileImage}
                          className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1 shadow-lg hover:bg-destructive/90"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    {/* Username */}
                    <motion.div variants={item}>
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your username"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    {/* Description */}
                    <motion.div variants={item}>
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell others a bit about yourself"
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Banner Images Upload */}
                <motion.div variants={item}>
                  <Label htmlFor="banner_image_files" className="block mb-2">
                    Banner Images
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <label
                      htmlFor="banner_image_files"
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {previewBannerImages.length > 0
                            ? "Add more banner images"
                            : "Upload banner images"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Recommended: 1200 x 400px
                        </span>
                      </div>
                    </label>
                    <input
                      id="banner_image_files"
                      name="banner_image_files"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleBannerImagesChange}
                      className="hidden"
                    />
                  </div>

                  {previewBannerImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {previewBannerImages.map((src, index) => (
                        <div
                          key={index}
                          className="group relative h-24 rounded-md overflow-hidden"
                        >
                          <img
                            src={src}
                            alt={`Banner ${index}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeBannerImage(index)}
                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Social Links */}
                <motion.div variants={item}>
                  <Label className="block mb-2">Social Links</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(form.getValues("social_links") || {}).map(
                      ([platform, _]) => (
                        <div key={platform} className="relative">
                          <FormField
                            control={form.control}
                            name={`social_links.${platform}` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                      {getSocialIcon(platform)}
                                    </span>
                                    <Input
                                      placeholder={`Your ${platform} profile URL`}
                                      className="pl-10"
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )
                    )}
                  </div>
                </motion.div>

                {/* Submit */}
                <motion.div variants={item} className="pt-4">
                  <Button
                    type="submit"
                    className="w-full relative"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        <span>Saving...</span>
                      </div>
                    ) : isSaved ? (
                      <div className="flex items-center">
                        <motion.span
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="mr-2 text-green-300"
                        >
                          ✓
                        </motion.span>
                        Saved!
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-5 h-5 mr-2" />
                        Save Profile
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>

      {!address && (
        <motion.div
          className="mt-4 p-4 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded-md text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Please connect your wallet to update your profile
        </motion.div>
      )}
    </div>
  );
}
