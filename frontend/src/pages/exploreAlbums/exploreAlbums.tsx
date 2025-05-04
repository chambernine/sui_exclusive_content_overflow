import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useExploreAlbums } from "@/hooks/api/useAlbums";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ShoppingCart,
  Award,
  LayoutGrid,
  List,
  Search,
  Filter,
  Heart,
  Share2,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";
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
import { Lens } from "@/components/magicui/lens";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Protected } from "@/components/auth/Protected";
import { useSuiAccount } from "@/hooks/useSuiAccount";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

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

export default function ExploreAlbums() {
  const { address } = useSuiAccount();
  const { data, isLoading } = useExploreAlbums(address);
  const albums = data?.data || [];
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
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
    toast("Redirecting to purchase page...");
    navigate(`/explore-albums/${albumId}`);
  };

  return (
    <Protected description="Connect wallet to manage album requests">
      <div className="py-12 px-8">
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

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center h-100"
        >
          <Swiper
            spaceBetween={30}
            centeredSlides={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            navigation={true}
            modules={[Autoplay, Pagination, Navigation]}
            className="mySwiper"
          >
            {albums.length > 0 ? (
              albums.map((album: Album) => (
                <SwiperSlide key={album.albumId}>
                  <CardWithLens
                    imageSrc={album.contentInfos?.[0] || ""}
                    imageAlt={album.name}
                    className="overflow-hidden h-full flex flex-col bg-card border-border cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{album.name}</CardTitle>
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
                  </CardWithLens>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div className="h-64 w-full flex items-center justify-center bg-card border border-dashed border-border rounded-lg">
                  <div className="text-center px-4">
                    <h3 className="text-lg font-medium mb-2">
                      No albums available
                    </h3>
                    <p className="text-muted-foreground">
                      There are currently no albums to display
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            )}
          </Swiper>
        </motion.div>
        {albums.length > 0 && (
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
                            onClick={() => setSelectedAlbum(album)}
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
                            <CardFooter className="pt-2 flex-col gap-3">
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
                                className="w-full"
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
                          No albums match your search criteria
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
                            onClick={() => setSelectedAlbum(album)}
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
                                      tierColors[album.tier]
                                    } text-white w-fit shrink-0 sm:ml-2`}
                                  >
                                    {tierNames[album.tier]}
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
                                      className="h-8 px-2 sm:px-3"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAlbum(album);
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
                          No albums match your search criteria
                        </p>
                      </div>
                    )}
                  </motion.div>
                </LoadingWrapper>
              </TabsContent>
            </Tabs>

            <AnimatePresence>
              {selectedAlbum && (
                <Dialog
                  open={!!selectedAlbum}
                  onOpenChange={() => setSelectedAlbum(null)}
                >
                  <DialogContent className="sm:max-w-[600px] border-border rounded-lg">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DialogHeader>
                        <DialogTitle className="text-2xl">
                          {selectedAlbum.name}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-2">
                          {selectedAlbum.description}
                        </DialogDescription>
                        <Badge
                          variant="outline"
                          className={`${
                            tierColors[selectedAlbum.tier]
                          } text-white mt-2 w-fit`}
                        >
                          {tierNames[selectedAlbum.tier]}
                        </Badge>
                      </DialogHeader>

                      <div className="mt-4">
                        <Lens
                          zoomFactor={2}
                          lensSize={150}
                          isStatic={false}
                          ariaLabel="Zoom Area"
                          className="rounded-lg"
                        >
                          <AspectRatio ratio={16 / 9} className="w-full h-full">
                            {selectedAlbum.contentInfos[0] ? (
                              <img
                                src={selectedAlbum.contentInfos[0]}
                                alt={selectedAlbum.name}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
                                No preview available
                              </div>
                            )}
                          </AspectRatio>
                        </Lens>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border">
                        <div className="flex justify-around text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Heart className="h-5 w-5" />
                            <span>{selectedAlbum.interaction.likes}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Share2 className="h-5 w-5" />
                            <span>{selectedAlbum.interaction.shares}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bookmark className="h-5 w-5" />
                            <span>{selectedAlbum.interaction.saves}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-amber-500" />
                          <span className="text-lg font-semibold">
                            {selectedAlbum.price} SUI
                          </span>
                        </div>
                        <Button
                          onClick={() => {
                            handlePurchase(selectedAlbum.albumId);
                            setSelectedAlbum(null);
                          }}
                          className="gap-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Purchase Now
                        </Button>
                      </div>
                    </motion.div>
                  </DialogContent>
                </Dialog>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </Protected>
  );
}
