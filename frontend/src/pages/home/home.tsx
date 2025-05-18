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

  if (!account) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Login description="Please connect your wallet to access exclusive content" />
      </div>
    );
  }

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
    <Card className="overflow-hidden border-border hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Featured Tier</CardTitle>
        <CardDescription>
          Premium content with exclusive benefits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden border border-border">
          <div className="bg-blue-500 p-3 text-white font-medium text-center">
            Premium Tier
          </div>
          <div className="p-4 space-y-2">
            <p className="text-sm">
              Get access to premium content with additional benefits
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Early access to new releases</li>
              <li>Exclusive creator content</li>
              <li>Premium support</li>
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
    navigate(`/album/${albumId}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col p-4 md:p-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Silvy</h1>
          <p className="text-muted-foreground">
            Discover and collect exclusive content
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ConnectButton />
          {/* Mobile Profile Avatar */}
          <Avatar
            className="h-8 w-8 lg:hidden cursor-pointer border border-border"
            onClick={() => setShowMobileProfile(true)}
          >
            <AvatarFallback className="bg-primary/20 text-primary">
              {address ? address.slice(0, 2) : ""}
            </AvatarFallback>
          </Avatar>
        </div>
      </motion.div>

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
            <h2 className="text-xl font-semibold">Your Feed</h2>
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
                    className="overflow-hidden border-border hover:shadow-md transition-shadow mb-4"
                  >
                    <CardHeader className="pb-2 space-y-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border-2 border-primary">
                            <AvatarFallback>
                              {album.owner.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {album.owner.slice(0, 6)}...
                                {album.owner.slice(-4)}
                              </span>
                              <Badge
                                className={`${
                                  tierColors[
                                    album.tier as keyof typeof tierColors
                                  ]
                                } text-white text-sm`}
                              >
                                {
                                  tierNames[
                                    album.tier as keyof typeof tierNames
                                  ]
                                }
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Content Creator
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium">
                          {album.price} SUI
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-0 space-y-3">
                      <h3 className="font-medium text-lg">{album.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {album.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {album.tags?.slice(0, 3).map((tag, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
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
                      <div className="mt-2 relative">
                        <div>
                          {album.contentInfos?.[0] && (
                            <AspectRatio
                              ratio={16 / 9}
                              className="overflow-hidden rounded-md"
                            >
                              <img
                                src={album.contentInfos[0]}
                                alt={album.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                onClick={() =>
                                  handleNavigateToAlbum(album.albumId)
                                }
                              />
                            </AspectRatio>
                          )}
                        </div>

                        {/* Multiple images indicator */}
                        {album.contentInfos?.length > 1 && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-black/60 backdrop-blur-sm text-white">
                              +{album.contentInfos.length} images
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2 pb-3">
                      <div className="w-full border-t border-border pt-2">
                        <div className="flex justify-between">
                          <div className="flex space-x-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              <span className="text-xs">
                                {album.interaction?.likes || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="h-4 w-4" />
                              <span className="text-xs">
                                {album.interaction?.shares || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Bookmark className="h-4 w-4" />
                              <span className="text-xs">
                                {album.interaction?.saves || 0}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNavigateToAlbum(album.albumId)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">
                    No contents available in your feed
                  </p>
                </div>
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
  );
}
