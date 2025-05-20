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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { tierColors, tierNames } from "@/types/album";
import { Protected } from "@/components/auth/Protected";
import { useProfile, useUpdateProfile } from "@/hooks/api/useProfile";
import { useMyAlbums, useMyPurchasedAlbums } from "@/hooks/api/useAlbums";
import { CardWithLens } from "@/components/custom/card-with-lens";
import { fileToBase64 } from "@/utils/fileFormat";
import { useNavigate } from "react-router-dom";

interface ProfileMetaData {
  userAddress: string;
  username: string;
  description: string;
  profileImageBase64: string;
  bannerImagesBase64: string[];
  socialLinks: {
    x: string;
    twitch: string;
    instagram: string;
    youtube: string;
  };
  createdAt: number;
}

interface Album {
  albumId: string;
  name: string;
  owner: string;
  tier: number;
  price: number;
  description: string;
  tags: string[];
  contentInfos: string[];
  interaction: {
    likes: number;
    shares: number;
    saves: number;
  };
}

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTier, setFilterTier] = useState<string>("all");
  // New state to track if user needs to create a profile
  const [needsProfileCreation, setNeedsProfileCreation] = useState(false);

  const navigate = useNavigate();

  // Check localStorage for editMode flag from Login component
  useEffect(() => {
    const enableEditMode = localStorage.getItem("enableProfileEditMode");
    if (enableEditMode === "true") {
      setEditMode(true);
      setNeedsProfileCreation(true);
      // Clear the flag after using it
      localStorage.removeItem("enableProfileEditMode");
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
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
    refetch: refetchProfile,
  } = useProfile(address);

  // Fetch user's created albums
  const { data: myAlbumsData, isLoading: isMyAlbumsLoading } =
    useMyAlbums(address);

  // Fetch user's purchased albums
  const { data: purchasedAlbumsData, isLoading: isPurchasedAlbumsLoading } =
    useMyPurchasedAlbums(address);

  // Update profile state when data is fetched
  useEffect(() => {
    if (profileData && profileData.data) {
      // Profile exists, no need for creation
      setNeedsProfileCreation(false);

      // Set user info
      setUserInfo(profileData.data);

      // Update form values with fetched data from the new response format
      form.reset({
        username: profileData.data.username || "",
        bio: profileData.data.description || "",
        profileImage: profileData.data.profileImageBase64 || profileImage,
        social_links: {
          x: profileData.data.socialLinks?.x || null,
          instagram: profileData.data.socialLinks?.instagram || null,
          twitch: profileData.data.socialLinks?.twitch || null,
          youtube: profileData.data.socialLinks?.youtube || null,
        },
      });

      if (profileData.data.profileImageBase64) {
        setProfileImage(profileData.data.profileImageBase64);
      }
    } else if (profileError || (profileData && !profileData.data)) {
      // Profile doesn't exist, needs creation
      console.error("❌ Failed to fetch user profile:", profileError);
      setEditMode(true);
      setNeedsProfileCreation(true);
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
  const { mutate: updateProfileMutation } = useUpdateProfile();

  const handleSaveProfile = async (values: z.infer<typeof formSchema>) => {
    setIsUpdating(true);
    try {
      // Handle file upload if it's a File object
      let profileImageBase64 = profileImage;
      if (values.profileImage instanceof File) {
        profileImageBase64 = await fileToBase64(values.profileImage as File);
      }
      // If it's already a string (base64), keep it as is
      else if (typeof values.profileImage === "string") {
        profileImageBase64 = values.profileImage;
      }

      // Check if we need to update the profile image
      const formData = {
        ...values,
        walletAddress: address,
        profile_image_file: profileImageBase64 || userInfo?.profileImageBase64,
      };

      // Use the updateProfile mutation from TanStack Query
      updateProfileMutation(formData, {
        onSuccess: () => {
          setIsUpdating(false);
          setEditMode(false);
          refetchProfile();
        },
        onError: (error) => {
          console.error("Error saving profile:", error);
          setIsUpdating(false);
        },
      });
    } catch (error) {
      console.error("Error processing profile data:", error);
      setIsUpdating(false);
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store the file object for later processing during form submission
      form.setValue("profileImage", file);

      // Create a temporary URL for preview
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl);

      // Clean up the URL when it's no longer needed to prevent memory leaks
      return () => URL.revokeObjectURL(previewUrl);
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
            <Card
              key={item}
              className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow cursor-pointer p-0"
            >
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
            No contents match your search criteria
          </p>
        </div>
      );
    }

    const handleViewDetails = (album: Album) => {
      localStorage.setItem("viewingAlbum", JSON.stringify(album));
      navigate(`/profile/myPurchase/${album.albumId}`);
    };

    return (
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filteredAlbums.map((album: Album) => (
          <motion.div key={album.albumId} variants={item}>
            <CardWithLens
              imageSrc={album.contentInfos?.[0] || ""}
              imageAlt={album.name}
              className="overflow-hidden h-full flex flex-col bg-card border-border cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleViewDetails(album)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{album.name}</CardTitle>
                  <Badge
                    className={`${
                      tierColors[album.tier as keyof typeof tierColors]
                    } text-white text-sm`}
                  >
                    {tierNames[album.tier as keyof typeof tierNames]}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {album.owner?.slice(0, 6)}...
                  {album.owner?.slice(-4)}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex-col gap-3">
                <div className="flex justify-between items-center w-full border-t border-border pt-3">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">
                        {album.interaction?.likes || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      <span className="text-sm">
                        {album.interaction?.shares || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark className="h-4 w-4" />
                      <span className="text-sm">
                        {album.interaction?.saves || 0}
                      </span>
                    </div>
                  </div>
                  <p className="font-medium text-lg">{album.price} SUI</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border border-primary/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(album);
                  }}
                >
                  View Details
                </Button>
              </CardFooter>
            </CardWithLens>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  // Album list view component
  const renderAlbumList = (albums: any, loading: boolean) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <Card
              key={item}
              className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow cursor-pointer p-0"
            >
              <div className="flex flex-col sm:flex-row h-full">
                <div className="hidden sm:block w-full sm:w-48 h-40 bg-muted animate-pulse" />
                <div className="flex-1 p-3 sm:p-4">
                  <div className="h-4 w-3/4 bg-muted animate-pulse mb-2" />
                  <div className="h-4 w-1/2 bg-muted animate-pulse mb-4" />
                  <div className="h-4 w-1/4 bg-muted animate-pulse" />
                </div>
              </div>
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
            No contents match your search criteria
          </p>
        </div>
      );
    }

    const handleViewDetails = (album: Album) => {
      localStorage.setItem("viewingAlbum", JSON.stringify(album));
      navigate(`/profile/myPurchase/${album.albumId}`);
    };

    return (
      <motion.div
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filteredAlbums.map((album: Album) => (
          <motion.div key={album.albumId} variants={item}>
            <Card
              className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow cursor-pointer p-0"
              onClick={() => handleViewDetails(album)}
            >
              <div className="flex flex-col sm:flex-row h-full">
                <div className="hidden sm:block w-full sm:w-48 h-40 sm:h-auto relative">
                  <AspectRatio ratio={16 / 9} className="h-full">
                    {album.contentInfos?.[0] ? (
                      <img
                        src={album.contentInfos[0]}
                        alt={album.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        No preview
                      </div>
                    )}
                  </AspectRatio>
                </div>
                <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {album.name}
                      </h3>
                    </div>
                    <Badge
                      className={`${
                        tierColors[album.tier as keyof typeof tierColors]
                      } text-white w-fit shrink-0 text-sm sm:ml-2`}
                    >
                      {tierNames[album.tier as keyof typeof tierNames]}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span className="text-xs sm:text-sm">
                          {album.interaction?.likes || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        <span className="text-xs sm:text-sm">
                          {album.interaction?.shares || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="h-4 w-4" />
                        <span className="text-xs sm:text-sm">
                          {album.interaction?.saves || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm sm:text-base">
                        {album.price} SUI
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 sm:px-3 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border border-primary/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(album);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderProfileContent = () => {
    // If user needs to create a profile, show the profile creation interface only
    if (needsProfileCreation) {
      return (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8 max-w-2xl mx-auto"
        >
          <motion.div variants={item}>
            <Card className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow">
              <CardHeader className="pb-0 text-center">
                <CardTitle className="text-2xl md:text-3xl">
                  Create Your Profile
                </CardTitle>
                <CardDescription>
                  You need to set up profile before using this app
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                <div className="flex flex-col items-center gap-6 mb-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileImage || ""} alt="Profile" />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <User className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
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
                  </div>
                </div>

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
                            <Input placeholder="Enter a username" {...field} />
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
                          <FormLabel>About You</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell others about yourself"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Social Links Section */}
                    <div className="space-y-2">
                      <Label>Social Links (Optional)</Label>
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

                    <Button
                      type="submit"
                      className="w-full mt-6"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-1"></div>
                          <span>Creating Profile...</span>
                        </div>
                      ) : (
                        "Create Profile"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      );
    }

    // Regular profile view for users who already have profiles
    return (
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
                <div className="flex-1 text-center md:text-left w-full">
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
                        {form.getValues("bio") || ""}
                      </p>

                      {/* Social Links Display */}
                      <div className="flex items-center gap-2 mt-3">
                        {Object.entries(
                          form.getValues("social_links") || {}
                        ).map(
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
                        : `${
                            filterAlbums(purchasedAlbumsData?.data).length
                          } albums available`}
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
                    <LoadingWrapper
                      isLoading={isPurchasedAlbumsLoading}
                      variant="album"
                      count={6}
                      loadingText="Loading albums..."
                      gridCols="3"
                    >
                      {renderAlbumGrid(
                        purchasedAlbumsData?.data,
                        isPurchasedAlbumsLoading
                      )}
                    </LoadingWrapper>
                  </TabsContent>

                  <TabsContent value="list" className="m-0">
                    <LoadingWrapper
                      isLoading={isPurchasedAlbumsLoading}
                      variant="card"
                      count={4}
                      layout="block"
                      loadingText="Loading albums..."
                    >
                      {renderAlbumList(
                        purchasedAlbumsData?.data,
                        isPurchasedAlbumsLoading
                      )}
                    </LoadingWrapper>
                  </TabsContent>
                </Tabs>
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
                        : `${
                            filterAlbums(myAlbumsData?.data).length
                          } albums available`}
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
                    <LoadingWrapper
                      isLoading={isMyAlbumsLoading}
                      variant="album"
                      count={6}
                      loadingText="Loading albums..."
                      gridCols="3"
                    >
                      {renderAlbumGrid(myAlbumsData?.data, isMyAlbumsLoading)}
                    </LoadingWrapper>
                  </TabsContent>

                  <TabsContent value="list" className="m-0">
                    <LoadingWrapper
                      isLoading={isMyAlbumsLoading}
                      variant="card"
                      count={4}
                      layout="block"
                      loadingText="Loading albums..."
                    >
                      {renderAlbumList(myAlbumsData?.data, isMyAlbumsLoading)}
                    </LoadingWrapper>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <Protected description="Connect wallet to view profile">
      <div className="container p-4">
        <LoadingWrapper isLoading={isProfileLoading} variant="profile">
          <div className="w-full mx-auto">{renderProfileContent()}</div>
        </LoadingWrapper>
      </div>
    </Protected>
  );
}
