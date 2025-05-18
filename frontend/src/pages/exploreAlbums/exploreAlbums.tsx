import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useExploreAlbums } from "@/hooks/api/useAlbums";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Heart,
  Share2,
  Bookmark,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";
import { CardWithLens } from "@/components/custom/card-with-lens";
import { Protected } from "@/components/auth/Protected";
import { useSuiAccount } from "@/hooks/useSuiAccount";
import { ThreeDContentsLists } from "@/components/custom/3d-contents-lists";
import { tierColors, tierNames } from "@/types/album";

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

export default function ExploreAlbums() {
  const { address } = useSuiAccount();
  const { data, isLoading } = useExploreAlbums(address);
  const albums = data?.data || [];
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const navigate = useNavigate();

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

  // Filter albums based on search query and tier filter
  const filteredAlbums = albums.filter((album: Album) => {
    const matchesSearch =
      album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier =
      filterTier === "all" || album.tier.toString() === filterTier;

    return matchesSearch && matchesTier;
  });

  const handlePurchase = (albumId: string) => {
    navigate(`/explore-albums/${albumId}`);
  };

  return (
    <Protected description="Connect wallet to manage album requests">
      <div className="py-12 px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Discover Exclusive Content
          </h1>
          <p className="text-muted-foreground">
            Discover and purchase exclusive content albums
          </p>
        </motion.div>

        {albums.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center h-100"
          >
            <ThreeDContentsLists contents={albums} isLoading={isLoading} />
          </motion.div>
        )}

        <>
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
                {isLoading
                  ? "Loading albums..."
                  : `${filteredAlbums.length} albums available`}
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
                isLoading={isLoading}
                variant="album"
                count={6}
                loadingText="Loading albums..."
                gridCols="3"
              >
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {filteredAlbums.length > 0 ? (
                    filteredAlbums.map((album: Album) => (
                      <motion.div key={album.albumId} variants={item}>
                        <CardWithLens
                          imageSrc={album.contentInfos?.[0] || ""}
                          imageAlt={album.name}
                          className="overflow-hidden h-full flex flex-col bg-card border-border cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => handlePurchase(album.albumId)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-xl">
                                {album.name}
                              </CardTitle>
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
                              <p className="font-medium text-lg">
                                {album.price} SUI
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border border-primary/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePurchase(album.albumId);
                              }}
                            >
                              View Details
                            </Button>
                          </CardFooter>
                        </CardWithLens>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">
                        No contents match your search criteria
                      </p>
                    </div>
                  )}
                </motion.div>
              </LoadingWrapper>
            </TabsContent>

            <TabsContent value="list" className="m-0">
              <LoadingWrapper
                isLoading={isLoading}
                variant="card"
                count={4}
                layout="block"
                loadingText="Loading albums..."
              >
                <motion.div
                  className="space-y-3"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {filteredAlbums.length > 0 ? (
                    filteredAlbums.map((album: Album) => (
                      <motion.div key={album.albumId} variants={item}>
                        <Card
                          className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow cursor-pointer p-0"
                          onClick={() => handlePurchase(album.albumId)}
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
                                    tierColors[
                                      album.tier as keyof typeof tierColors
                                    ]
                                  } text-white w-fit shrink-0  text-sm sm:ml-2`}
                                >
                                  {
                                    tierNames[
                                      album.tier as keyof typeof tierNames
                                    ]
                                  }
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
                                      handlePurchase(album.albumId);
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
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No contents match your search criteria
                      </p>
                    </div>
                  )}
                </motion.div>
              </LoadingWrapper>
            </TabsContent>
          </Tabs>
        </>
      </div>
    </Protected>
  );
}
