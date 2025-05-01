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
  const { data, isLoading } = useExploreAlbums();
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
    <div className="py-12 px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Discover Exclusive Content
        </h1>
        <p className="text-muted-foreground">
          Discover and purchase exclusive content albums
        </p>
      </motion.div>

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
        <div className="flex justify-between items-center mb-4">
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
                    <Card
                      className="overflow-hidden h-full flex flex-col bg-card border-border cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedAlbum(album)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AspectRatio ratio={16 / 9}>
                          {album.contentInfos?.[0] ? (
                            <img
                              src={album.contentInfos[0]}
                              alt={album.name}
                              className="object-cover w-full h-full rounded-t-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
                              No preview
                            </div>
                          )}
                        </AspectRatio>
                      </motion.div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">{album.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {album.description}
                        </CardDescription>
                        <Badge
                          variant="outline"
                          className={`${
                            tierColors[album.tier]
                          } text-white mt-2 w-fit`}
                        >
                          {tierNames[album.tier]}
                        </Badge>
                      </CardHeader>
                      <CardFooter className="mt-auto pt-2">
                        <div className="flex justify-between items-center w-full">
                          <p className="font-medium text-lg">
                            {album.price / 1e9} SUI
                          </p>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
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
                      className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedAlbum(album)}
                    >
                      <div className="flex items-center">
                        <div className="w-32 h-20 sm:w-48 sm:h-28">
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
                        <div className="flex-1 p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div>
                              <h3 className="font-semibold">{album.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1 sm:max-w-[20rem]">
                                {album.description}
                              </p>
                              <Badge
                                variant="outline"
                                className={`${
                                  tierColors[album.tier]
                                } text-white mt-1 w-fit`}
                              >
                                {tierNames[album.tier]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 sm:mt-0">
                              <span className="font-medium">
                                {album.price / 1e9} SUI
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="hidden sm:flex"
                              >
                                View
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
                  <DialogDescription>
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
                  <AspectRatio ratio={16 / 9}>
                    {selectedAlbum.contentInfos?.[0] ? (
                      <img
                        src={selectedAlbum.contentInfos[0]}
                        alt={selectedAlbum.name}
                        className="object-cover w-full h-full rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                        No preview available
                      </div>
                    )}
                  </AspectRatio>
                </div>

                <div className="mt-4">
                  <div className="flex justify-around text-gray-600 text-sm">
                    <div className="flex items-center gap-1">
                      ❤️ <span>{selectedAlbum.interaction.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      🔁 <span>{selectedAlbum.interaction.shares}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      💾 <span>{selectedAlbum.interaction.saves}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span className="text-lg font-semibold">
                      {selectedAlbum.price / 1e9} SUI
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
    </div>
  );
}
