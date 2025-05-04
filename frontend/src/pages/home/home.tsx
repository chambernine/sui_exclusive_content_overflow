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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Share2, Bookmark, MessageCircle } from "lucide-react";
import { useState } from "react";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";
import { CardWithLens } from "@/components/custom/card-with-lens";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const tierNames: { [key: number]: string } = {
  0: "Standard",
  1: "Premium",
  2: "Exclusive",
  3: "Principle",
};

const tierColors: { [key: number]: string } = {
  0: "bg-green-500",
  1: "bg-blue-500",
  2: "bg-purple-500",
  3: "bg-amber-500",
};

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

  const [activeTab, setActiveTab] = useState<string>("featured");
  const [showMobileProfile, setShowMobileProfile] = useState<boolean>(false);

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

  // Featured albums - take top 3 albums based on interactions
  const featuredAlbums = [...albums]
    .sort(
      (a, b) =>
        b.interaction?.likes +
        b.interaction?.shares +
        b.interaction?.saves -
        (a.interaction?.likes + a.interaction?.shares + a.interaction?.saves)
    )
    .slice(0, 3);

  // Recent albums - assuming the array is already sorted by recency
  const recentAlbums = [...albums].slice(0, 5);

  // Albums by tier - removed filter
  const popularByTier = [...albums]
    .sort((a, b) => b.interaction?.likes - a.interaction?.likes)
    .slice(0, 4);

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
          <h3 className="font-medium">Wallet Connected</h3>
          <p className="text-sm text-muted-foreground font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
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
    <Card className="overflow-hidden border-border hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="default"
          className="w-full mb-2"
          onClick={() => navigate("/explore-albums")}
        >
          Explore All Albums
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/draft-album")}
        >
          Create New Album
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome to SUI Exclusive Content
          </h1>
          <p className="text-muted-foreground">
            Discover and collect unique digital content
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary dark:text-primary">
            <span className="mr-2">●</span>
            <span className="font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>

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
          {/* Feed Tabs */}
          <motion.div variants={item}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full justify-start mb-4">
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
              </TabsList>

              {/* Featured Albums Tab */}
              <TabsContent value="featured" className="space-y-4">
                <LoadingWrapper
                  isLoading={isLoading}
                  variant="card"
                  count={3}
                  layout="block"
                  loadingText="Loading featured albums..."
                >
                  {featuredAlbums.length > 0 ? (
                    featuredAlbums.map((album: Album) => (
                      <Card className="overflow-hidden border-border hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2 space-y-0">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border-2 border-primary">
                                <span className="font-medium text-xs">
                                  {album.owner.slice(0, 2).toUpperCase()}
                                </span>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {album.owner.slice(0, 6)}...
                                    {album.owner.slice(-4)}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={`${
                                      tierColors[album.tier]
                                    } text-white h-5`}
                                  >
                                    {tierNames[album.tier]}
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
                                  <MessageCircle className="h-4 w-4" />
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
                                onClick={() =>
                                  handleNavigateToAlbum(album.albumId)
                                }
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
                        No featured albums available
                      </p>
                    </div>
                  )}
                </LoadingWrapper>
              </TabsContent>

              {/* Recent Albums Tab */}
              <TabsContent value="recent" className="space-y-4">
                <LoadingWrapper
                  isLoading={isLoading}
                  variant="card"
                  count={5}
                  layout="block"
                  loadingText="Loading recent albums..."
                >
                  {recentAlbums.length > 0 ? (
                    recentAlbums.map((album: Album) => (
                      <Card
                        key={album.albumId}
                        className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-48 h-40 sm:h-auto relative">
                            <AspectRatio ratio={16 / 9} className="h-full">
                              {album.contentInfos?.[0] ? (
                                <img
                                  src={album.contentInfos[0]}
                                  alt={album.name}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  No preview
                                </div>
                              )}
                            </AspectRatio>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-lg">
                                  {album.name}
                                </h3>
                                <Badge
                                  className={`${
                                    tierColors[album.tier]
                                  } text-white ml-2 w-fit shrink-0`}
                                >
                                  {tierNames[album.tier]}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {album.description}
                              </p>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                              <div className="flex items-center gap-3 text-muted-foreground">
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
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleViewAlbumDetails(album.albumId)
                                }
                              >
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 border border-dashed border-border rounded-lg">
                      <p className="text-muted-foreground">
                        No recent albums available
                      </p>
                    </div>
                  )}
                </LoadingWrapper>
              </TabsContent>

              {/* Popular Albums Tab */}
              <TabsContent value="popular" className="space-y-4">
                <LoadingWrapper
                  isLoading={isLoading}
                  variant="card"
                  count={4}
                  layout="block"
                  loadingText="Loading popular albums..."
                >
                  {popularByTier.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {popularByTier.map((album: Album) => (
                        <CardWithLens
                          key={album.albumId}
                          imageSrc={album.contentInfos?.[0] || ""}
                          imageAlt={album.name}
                          className="overflow-hidden h-full flex flex-col bg-card border-border cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => handleViewAlbumDetails(album.albumId)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-xl">
                                {album.name}
                              </CardTitle>
                              <Badge
                                className={`${
                                  tierColors[album.tier]
                                } text-white ml-2 w-fit shrink-0`}
                              >
                                {tierNames[album.tier]}
                              </Badge>
                            </div>
                            <CardDescription className="line-clamp-2">
                              {album.description}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="pt-2 flex-col gap-3 mt-auto">
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
                              </div>
                              <p className="font-medium text-lg">
                                {album.price} SUI
                              </p>
                            </div>
                          </CardFooter>
                        </CardWithLens>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-dashed border-border rounded-lg">
                      <p className="text-muted-foreground">
                        No popular albums available
                      </p>
                    </div>
                  )}
                </LoadingWrapper>
              </TabsContent>
            </Tabs>
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

          {/* Mobile Actions - Visible only on mobile/tablet */}
          <div className="lg:hidden space-y-6">
            <motion.div variants={item}>
              <QuickActions />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Profile Drawer - Only shows when toggled */}
      {showMobileProfile && <MobileProfileDrawer />}
    </div>
  );
}
