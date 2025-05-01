import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LayoutGrid,
  List,
  Edit,
  Check,
  X,
  Upload,
  Twitter,
  Instagram,
  Twitch,
  Youtube,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { fileToBase64 } from "@/utils/fileFormat";
import { AlbumTier, tierColors, tierNames } from "@/types/album";
import { Protected } from "@/components/auth/Protected";

interface Album {
  id: string;
  title: string;
  tier: AlbumTier;
  preview: string;
}

const mockPurchasedAlbums: Album[] = [
  {
    id: "1",
    title: "City Nights",
    tier: AlbumTier.premium,
    preview:
      "https://images.pexels.com/photos/1722183/pexels-photo-1722183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "2",
    title: "Ocean Waves",
    tier: AlbumTier.exclusive,
    preview:
      "https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "3",
    title: "Desert Dreams",
    tier: AlbumTier.standard,
    preview:
      "https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "4",
    title: "Celestial Beyond",
    tier: AlbumTier.principle,
    preview:
      "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
];

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  bio: z.string().max(160, {
    message: "Bio must not be longer than 160 characters.",
  }),
  profileImage: z.any().optional(),
  social_links: z.object({
    x: z.string().nullable(),
    instagram: z.string().nullable(),
    twitch: z.string().nullable(),
    youtube: z.string().nullable(),
  }),
});

export function ProfilePage() {
  const { address } = useSuiAccount();
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(
    "https://i.pravatar.cc/150?img=12"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "Web3Creator",
      bio: "Digital artist specializing in cosmic and abstract themes. Collector of rare digital art and NFTs since 2018.",
      profileImage: profileImage,
      social_links: {
        x: null,
        instagram: null,
        twitch: null,
        youtube: null,
      },
    },
  });

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
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  const handleSaveProfile = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // Process the profile image if it's a File object
      let profileImageBase64 = null;
      if (values.profileImage instanceof File) {
        profileImageBase64 = await fileToBase64(values.profileImage);
      }

      const formData = {
        ...values,
        walletAddress: address,
        profileImage: profileImageBase64 || values.profileImage,
      };

      // In a real app, you would save the profile data
      console.log(formData);

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setIsSaved(true);
        setEditMode(false);

        // Show success toast
        // toast({
        //   title: "Profile updated",
        //   description: "Your profile has been updated successfully.",
        // });

        setTimeout(() => setIsSaved(false), 3000);
      }, 1000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setIsLoading(false);
      //   toast({
      //     title: "Error",
      //     description: "Failed to update profile.",
      //     variant: "destructive",
      //   });
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("profileImage", file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "x":
        return <Twitter className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "twitch":
        return <Twitch className="h-4 w-4" />;
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const renderProfileContent = () => (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item}>
        <Card className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileImage} alt="Profile" />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <Upload className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                {editMode && (
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-0 cursor-pointer"
                  >
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <Edit className="h-4 w-4" />
                    </div>
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleProfileImageUpload}
                    />
                  </label>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                {editMode ? (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleSaveProfile)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Social Links Section */}
                      <div className="space-y-2">
                        <Label>Social Links</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(
                            form.getValues("social_links") || {}
                          ).map(([platform, _]) => (
                            <FormField
                              key={platform}
                              control={form.control}
                              name={`social_links.${platform}` as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                        {getSocialIcon(platform)}
                                      </span>
                                      <Input
                                        placeholder={`Your ${platform} profile URL`}
                                        className="pl-8"
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                      />
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditMode(false)}
                          type="button"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button size="sm" type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-1"></div>
                              <span>Saving...</span>
                            </div>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div>
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">
                        {form.getValues("username")}
                      </h2>
                      <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditMode(true)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-2">
                      {form.getValues("bio")}
                    </p>

                    {/* Social Links Display */}
                    <div className="flex items-center gap-2 mt-3">
                      {Object.entries(form.getValues("social_links") || {}).map(
                        ([platform, value]) =>
                          value && (
                            <a
                              key={platform}
                              href={value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {getSocialIcon(platform)}
                            </a>
                          )
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">4</span>
                        <span className="text-muted-foreground text-sm">
                          Albums
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">2</span>
                        <span className="text-muted-foreground text-sm">
                          NFTs
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {address
                            ? `${address.slice(0, 6)}...${address.slice(-4)}`
                            : "0x83f...9e21"}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          Wallet
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">My Collection</h2>
          </div>

          <Tabs defaultValue="grid">
            <div className="flex justify-between items-center mb-4">
              <p className="text-muted-foreground">
                {mockPurchasedAlbums.length} items
              </p>
              <TabsList>
                <TabsTrigger value="grid">
                  <LayoutGrid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="m-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mockPurchasedAlbums.map((album) => (
                  <motion.div key={album.id} variants={item}>
                    <Card className="overflow-hidden h-full flex flex-col bg-card border-border cursor-pointer hover:shadow-lg transition-shadow">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AspectRatio ratio={16 / 9}>
                          <img
                            src={album.preview}
                            alt={album.title}
                            className="object-cover w-full h-full rounded-t-lg"
                          />
                        </AspectRatio>
                      </motion.div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{album.title}</CardTitle>
                        <Badge
                          variant="outline"
                          className={`${
                            tierColors[album.tier]
                          } text-white mt-2 w-fit`}
                        >
                          {tierNames[album.tier]}
                        </Badge>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="m-0">
              <div className="space-y-3">
                {mockPurchasedAlbums.map((album) => (
                  <Card
                    key={album.id}
                    className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center">
                      <div className="w-24 h-16">
                        <AspectRatio ratio={16 / 9} className="h-full">
                          <img
                            src={album.preview}
                            alt={album.title}
                            className="object-cover w-full h-full"
                          />
                        </AspectRatio>
                      </div>
                      <CardHeader className="py-2 px-3 flex-1">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm font-medium">
                            {album.title}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={`${tierColors[album.tier]} text-white`}
                          >
                            {tierNames[album.tier]}
                          </Badge>
                        </div>
                      </CardHeader>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <Protected description="Connect wallet to view profile">
      <div className="container py-12 px-4">
        <div className="max-w-4xl mx-auto">{renderProfileContent()}</div>
      </div>
    </Protected>
  );
}
