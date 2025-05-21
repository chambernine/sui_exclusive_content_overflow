// src/pages/Home.tsx
import { ConnectButton } from "@mysten/dapp-kit";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Login } from "@/components/auth/Login";
import { useExploreAlbums } from "@/hooks/api/useAlbums";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Heart, Share2, Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { tierColors, tierNames } from "@/types/album";
import { useProfile } from "@/hooks/api/useProfile";
import { Protected } from "@/components/auth/Protected";

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

export default function Home() {
  const { account, address } = useSuiAccount();
  const navigate = useNavigate();
  const { data, isLoading } = useExploreAlbums(address);
  const albums = data?.data || [];

  const [showMobileProfile, setShowMobileProfile] = useState<boolean>(false);

  // Get profile data using the same hook that's used in viewProfile
  const { data: profileData, error: profileError } = useProfile(
    account?.address
  );

  useEffect(() => {
    // If user has connected and we have profile data response (even if null)
    if (account?.address && (profileData !== undefined || profileError)) {
      // Check if user has no profile data, redirect to profile page with edit mode
      if (!profileData?.data) {
        // Store a flag in localStorage to indicate that edit mode should be enabled
        localStorage.setItem("enableProfileEditMode", "true");
        navigate("/profile");
      }
    }
  }, [account, profileData, profileError, navigate]);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
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
        stiffness: 100,
      },
    },
  };

  // Profile Card Component
  const ProfileCard = () => (
    <Card className="overflow-hidden border-border hover:shadow-md transition-shadow gap-4">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Your Profile</CardTitle>
        <ThemeToggle />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mb-3">
            <span className="font-bold text-lg text-primary">
              {address ? address.slice(0, 2) : ""}
            </span>
          </div>
          <div className="hidden lg:flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary dark:text-primary">
            <span className="font-mono text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-3 text-center">
          <div>
            <p className="font-medium">0</p>
            <p className="text-xs text-muted-foreground">Owned</p>
          </div>
          <div>
            <p className="font-medium">0</p>
            <p className="text-xs text-muted-foreground">Created</p>
          </div>
          <div>
            <p className="font-medium">0</p>
            <p className="text-xs text-muted-foreground">Favorites</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/profile")}
        >
          View Full Profile
        </Button>
      </CardFooter>
    </Card>
  );

  // Quick Actions Component
  const QuickActions = () => (
    <Card className="overflow-hidden border-border hover:shadow-md transition-shadow gap-2">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 flex flex-col gap-1">
        <Button
          variant="default"
          className="w-full"
          onClick={() => navigate("/explore-albums")}
        >
          Explore All Contents
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/create-draft")}
        >
          Create New Content
        </Button>
      </CardContent>
    </Card>
  );

  // Featured Tier Component
  const FeaturedTier = () => (
    <Card className="overflow-hidden border-border hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg">Featured Tier</CardTitle>
        <CardDescription>
          Premium content with exclusive benefits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden border border-border/50 shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white font-medium text-center">
            Premium Tier
          </div>
          <div className="p-4 space-y-3 bg-card">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className="text-sm">Get access to premium content</p>
            </div>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Early access to new releases</span>
              </li>
              <li className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M20 8V14M17 11H23M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Exclusive creator content</span>
              </li>
              <li className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.93 4.93L19.07 19.07M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Ad-free experience</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/explore-albums")}
        >
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );

  // Mobile Profile Drawer
  const MobileProfileDrawer = () => (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs"
      onClick={() => setShowMobileProfile(false)}
    >
      <motion.div
        className="fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-auto bg-card rounded-t-2xl p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <ProfileCard />
        <div className="mt-4 mb-20">
          <QuickActions />
        </div>
      </motion.div>
    </motion.div>
  );

  const handleNavigateToAlbum = (albumId: string) => {
    navigate(`/explore-albums/${albumId}`);
  };

  return (
    <Protected hideChildren>
      <div className="min-h-screen w-full flex flex-col p-4 md:p-6">
        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Profile */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="hidden lg:block lg:col-span-3 space-y-6"
          >
            <motion.div variants={item}>
              <ProfileCard />
            </motion.div>
          </motion.div>

          {/* Middle Column - Main Content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-6 space-y-6"
          >
            {/* Feed Content */}
            <motion.div variants={item} className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Your Feed
                <span className="text-xs font-normal px-2 py-1 bg-primary/10 text-primary rounded-md">
                  Latest content
                </span>
              </h2>
              <LoadingWrapper
                isLoading={isLoading}
                variant="card"
                count={3}
                layout="block"
                loadingText="Loading feed..."
              >
                {albums.length > 0 ? (
                  albums.map((album: Album) => (
                    <Card
                      key={album.albumId}
                      className="overflow-hidden border-border hover:shadow-md transition-all duration-300 mb-4 group"
                    >
                      <CardHeader className="pb-2 space-y-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border-2 border-primary ring-2 ring-background">
                              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white font-medium">
                                {album.owner.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {album.owner.slice(0, 6)}...
                                  {album.owner.slice(-4)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Content Creator
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={`${
                              tierColors[album.tier as keyof typeof tierColors]
                            } text-white text-sm`}
                          >
                            {tierNames[album.tier as keyof typeof tierNames]}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="pb-0 space-y-3">
                        <h3 className="font-medium text-lg">{album.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {album.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {album.tags?.slice(0, 3).map((tag, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs bg-secondary/60 hover:bg-secondary/80 transition-colors"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {album.tags?.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{album.tags.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Album Preview */}
                        <div className="mt-3 relative overflow-hidden rounded-md">
                          <div
                            className="cursor-pointer"
                            onClick={() => handleNavigateToAlbum(album.albumId)}
                          >
                            {album.contentInfos?.[0] ? (
                              <AspectRatio
                                ratio={16 / 9}
                                className="overflow-hidden rounded-md"
                              >
                                <motion.img
                                  src={album.contentInfos[0]}
                                  alt={album.name}
                                  className="w-full h-full object-cover"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.5 }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </AspectRatio>
                            ) : (
                              <AspectRatio
                                ratio={16 / 9}
                                className="overflow-hidden rounded-md bg-muted/30 flex items-center justify-center"
                              >
                                <p className="text-muted-foreground text-sm">
                                  No preview available
                                </p>
                              </AspectRatio>
                            )}
                          </div>

                          {/* Multiple images indicator */}
                          {album.contentInfos?.length > 1 && (
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-black/70 backdrop-blur-sm text-white border border-white/20">
                                +{album.contentInfos.length} images
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="pt-3 pb-3">
                        <div className="w-full border-t border-border pt-3">
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-5 text-muted-foreground">
                              <motion.div
                                className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
                                whileHover={{ scale: 1.05 }}
                              >
                                <Heart className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                  {album.interaction?.likes || 0}
                                </span>
                              </motion.div>
                              <motion.div
                                className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
                                whileHover={{ scale: 1.05 }}
                              >
                                <Share2 className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                  {album.interaction?.shares || 0}
                                </span>
                              </motion.div>
                              <motion.div
                                className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
                                whileHover={{ scale: 1.05 }}
                              >
                                <Bookmark className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                  {album.interaction?.saves || 0}
                                </span>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <motion.div
                    className="text-center py-16 border border-dashed border-border rounded-lg bg-card/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bookmark className="h-7 w-7 text-primary opacity-70" />
                      </div>
                      <h3 className="text-xl font-medium">No content yet</h3>
                      <p className="text-muted-foreground text-center mb-2">
                        There's no content available in your feed. Explore our
                        marketplace or create your own content.
                      </p>
                      <div className="flex gap-3 mt-2">
                        <Button
                          variant="default"
                          onClick={() => navigate("/explore-albums")}
                          className="gap-1"
                        >
                          Explore Marketplace
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate("/create-draft")}
                        >
                          Create Content
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </LoadingWrapper>
            </motion.div>
          </motion.div>

          {/* Right Column - Quick Actions and Featured Tier */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-3 space-y-6"
          >
            {/* Display only on larger screens */}
            <div className="hidden lg:block space-y-6">
              <motion.div variants={item}>
                <QuickActions />
              </motion.div>

              <motion.div variants={item}>
                <FeaturedTier />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Profile Drawer - Only shows when toggled */}
        {showMobileProfile && <MobileProfileDrawer />}
      </div>
    </Protected>
  );
}
