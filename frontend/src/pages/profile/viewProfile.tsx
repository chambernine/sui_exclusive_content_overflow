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
  Twitter,
  Instagram,
  Twitch,
  Youtube,
  Heart,
  Share2,
  Bookmark,
  User,
  Search,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { AlbumTier, tierColors, tierNames } from "@/types/album";
import { Protected } from "@/components/auth/Protected";
import { useProfile, useUpdateProfile } from "@/hooks/api/useProfile";
import { useMyAlbums, useMyPurchasedAlbums } from "@/hooks/api/useAlbums";
import { CardWithLens } from "@/components/custom/card-with-lens";

interface ProfileMetaData {
  userAddress: string;
  username: string;
  description: string;
  profileImageBase64: string;
  bannerImagesBase64: string[];
  socialLinks: {
    x: string;
    twitch: string;
    ig: string;
    youtube: string;
  };
  createdAt: number;
}

interface Album {
  id: string;
  title: string;
  tier: AlbumTier;
  preview: string;
  description?: string;
  interaction?: {
    likes: number;
    shares: number;
    saves: number;
  };
}

const mockPurchasedAlbums: Album[] = [
  {
    id: "1",
    title: "City Nights",
    tier: AlbumTier.premium,
    preview:
      "https://images.pexels.com/photos/1722183/pexels-photo-1722183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    description: "A stunning collection of urban nightscapes and city lights",
    interaction: {
      likes: 124,
      shares: 32,
      saves: 56,
    },
  },
  {
    id: "2",
    title: "Ocean Waves",
    tier: AlbumTier.exclusive,
    preview:
      "https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    description: "Serene ocean landscapes and the beauty of water in motion",
    interaction: {
      likes: 98,
      shares: 14,
      saves: 43,
    },
  },
  {
    id: "3",
    title: "Desert Dreams",
    tier: AlbumTier.standard,
    preview:
      "https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    description:
      "Explore the mysterious and beautiful landscapes of sand and sky",
    interaction: {
      likes: 76,
      shares: 22,
      saves: 38,
    },
  },
  {
    id: "4",
    title: "Celestial Beyond",
    tier: AlbumTier.principle,
    preview:
      "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    description:
      "Journey through the cosmos with these stellar space photographs",
    interaction: {
      likes: 142,
      shares: 47,
      saves: 83,
    },
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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userInfo, setUserInfo] = useState<ProfileMetaData | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTier, setFilterTier] = useState<string>("all");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "anonymous",
      bio: "",
      profileImage: profileImage,
      social_links: {
        x: null,
        instagram: null,
        twitch: null,
        youtube: null,
      },
    },
  });

  // Fetch profile data using useProfile hook
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile(address);

  // Fetch user's created albums
  const { data: myAlbumsData, isLoading: isMyAlbumsLoading } =
    useMyAlbums(address);

  // Fetch user's purchased albums
  const { data: purchasedAlbumsData, isLoading: isPurchasedAlbumsLoading } =
    useMyPurchasedAlbums(address);

  console.log(myAlbumsData, "myAlbumsData");
  console.log(purchasedAlbumsData, "purchasedAlbumsData");

  // Update profile state when data is fetched
  useEffect(() => {
    if (profileData) {
      // Set user info
      setUserInfo(profileData.data);

      // Update form values with fetched data from the new response format
      form.reset({
        username: profileData.data.username || "",
        bio: profileData.data.description || "",
        profileImage: profileData.data.profileImageBase64 || profileImage,
        social_links: {
          x: profileData.data.socialLinks?.x || null,
          instagram: profileData.data.socialLinks?.ig || null, // Map 'ig' to 'instagram' for the form
          twitch: profileData.data.socialLinks?.twitch || null,
          youtube: profileData.data.socialLinks?.youtube || null,
        },
      });

      if (profileData.data.profileImageBase64) {
        setProfileImage(profileData.data.profileImageBase64);
      }
    } else if (profileError) {
      console.error("❌ Failed to fetch user profile:", profileError);
      setEditMode(true);
    }
  }, [
    profileData,
    isProfileLoading,
    profileError,
    address,
    form,
    profileImage,
  ]);

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

  // Get update profile mutation hook
  const { mutate: updateProfileMutation, isPending: isUpdatingProfile } =
    useUpdateProfile();

  const handleSaveProfile = async (values: z.infer<typeof formSchema>) => {
    setIsUpdating(true);
    const profileImageBase64 = values.profileImage
      ? await fileToBase64(values.profileImage as File)
      : null;
    // const bannerImagesBase64 = values.banner_image_files
    //   ? await Promise.all(values.banner_image_files.map((f) => fileToBase64(f)))
    //   : [];

    const formData = {
      ...values,
      walletAddress: address,
      profile_image_file: profileImageBase64,
      // banner_image_files: bannerImagesBase64,
    };

    // Use the updateProfile mutation from TanStack Query
    updateProfileMutation(formData, {
      onSuccess: () => {
        setIsUpdating(false);
        setEditMode(false);
        setTimeout(() => setIsSaved(false), 3000);
      },
      onError: (error) => {
        console.error("Error saving profile:", error);
        setIsUpdating(false);
      },
    });
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

  const filterAlbums = (albums: any[]) => {
    if (!albums) return [];

    return albums.filter((album: any) => {
      const title = album.title || album.name || "";
      const description = album.description || "";

      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier =
        filterTier === "all" || album.tier?.toString() === filterTier;

      return matchesSearch && matchesTier;
    });
  };

  // Album display components
  const renderAlbumGrid = (albums: any, loading: boolean) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 w-3/4 bg-muted animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!albums || albums.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No albums found</p>
        </div>
      );
    }

    const filteredAlbums = filterAlbums(albums);

    if (filteredAlbums.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No albums match your search criteria
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlbums.map((album: any) => (
          <CardWithLens
            key={album.id || album.albumId}
            className="overflow-hidden"
          >
            <AspectRatio ratio={1 / 1}>
              <div className="h-full bg-muted overflow-hidden relative">
                <div className="absolute top-2 right-2">
                  <Badge
                    className={`${
                      tierColors[album.tier as keyof typeof tierColors]
                    } text-white text-sm`}
                  >
                    {tierNames[album.tier as keyof typeof tierNames]}
                  </Badge>
                </div>
                <img
                  src={
                    album.preview ||
                    album.contentInfos?.[0] ||
                    "https://via.placeholder.com/300"
                  }
                  alt={album.title || album.name}
                  className="w-full h-full object-cover transition-all hover:scale-105"
                />
              </div>
            </AspectRatio>
            <CardContent className="p-4">
              <h3 className="font-medium text-lg">
                {album.title || album.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {album.description}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Heart className="h-4 w-4" />
                </Button>
                <span>{album.interaction?.likes || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Share2 className="h-4 w-4" />
                </Button>
                <span>{album.interaction?.shares || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <span>{album.interaction?.saves || 0}</span>
              </div>
            </CardFooter>
          </CardWithLens>
        ))}
      </div>
    );
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
                  <AvatarImage src={profileImage || ""} alt="Profile" />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <User className="h-10 w-10" />
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
                          {["x", "instagram", "twitch", "youtube"].map(
                            (platform) => (
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
                            )
                          )}
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
                        <Button size="sm" type="submit" disabled={isUpdating}>
                          {isUpdating ? (
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
                        <span className="font-medium">
                          {myAlbumsData?.data?.length || 0}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          Albums
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {purchasedAlbumsData?.data?.length || 0}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          Purchased
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

          <Tabs defaultValue="purchased">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="purchased">Purchased Albums</TabsTrigger>
                <TabsTrigger value="created">Created Albums</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="purchased" className="m-0">
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute top-2.5 left-3 text-muted-foreground" />
                  <Input
                    placeholder="Search albums..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterTier} onValueChange={setFilterTier}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by tier" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="0">Standard</SelectItem>
                    <SelectItem value="1">Premium</SelectItem>
                    <SelectItem value="2">Exclusive</SelectItem>
                    <SelectItem value="3">Principle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="grid" className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-muted-foreground">
                    {isPurchasedAlbumsLoading
                      ? "Loading albums..."
                      : `${filterAlbums.length} albums available`}
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
              </Tabs>

              {renderAlbumGrid(
                purchasedAlbumsData?.data,
                isPurchasedAlbumsLoading
              )}
            </TabsContent>

            <TabsContent value="created" className="m-0">
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute top-2.5 left-3 text-muted-foreground" />
                  <Input
                    placeholder="Search albums..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterTier} onValueChange={setFilterTier}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by tier" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="0">Standard</SelectItem>
                    <SelectItem value="1">Premium</SelectItem>
                    <SelectItem value="2">Exclusive</SelectItem>
                    <SelectItem value="3">Principle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="grid" className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-muted-foreground">
                    {isMyAlbumsLoading
                      ? "Loading albums..."
                      : `${filterAlbums.length} albums available`}
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
              </Tabs>
              {renderAlbumGrid(myAlbumsData?.data, isMyAlbumsLoading)}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <Protected description="Connect wallet to view profile">
      <div className="container py-12 px-10">
        <LoadingWrapper isLoading={isProfileLoading} variant="profile">
          <div className="w-full mx-auto">{renderProfileContent()}</div>
        </LoadingWrapper>
      </div>
    </Protected>
  );
}
