import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { AlbumTier, tierColors, tierNames } from "@/types/album";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Album {
  id: string;
  title: string;
  description: string;
  price: number;
  tier: AlbumTier;
  preview: string;
  exclusive: string;
}

const mockAlbums: Album[] = [
  {
    id: "1",
    title: "City Nights",
    description:
      "A collection of stunning nighttime cityscape photographs capturing urban architecture under neon lights.",
    price: 0.05,
    tier: AlbumTier.premium,
    preview:
      "https://images.pexels.com/photos/1722183/pexels-photo-1722183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    exclusive:
      "https://images.pexels.com/photos/316902/pexels-photo-316902.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "2",
    title: "Ocean Waves",
    description:
      "Immerse yourself in the tranquil beauty of ocean waves with this serene collection.",
    price: 0.08,
    tier: AlbumTier.exclusive,
    preview:
      "https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    exclusive:
      "https://images.pexels.com/photos/355288/pexels-photo-355288.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "3",
    title: "Desert Dreams",
    description:
      "Experience the mystical and otherworldly beauty of desert landscapes at sunset.",
    price: 0.03,
    tier: AlbumTier.standard,
    preview:
      "https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    exclusive:
      "https://images.pexels.com/photos/1906658/pexels-photo-1906658.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "4",
    title: "Celestial Beyond",
    description:
      "Explore the wonders of the night sky with these breathtaking astronomical photographs.",
    price: 0.12,
    tier: AlbumTier.principle,
    preview:
      "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    exclusive:
      "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
];

export function ContentList() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTier, setFilterTier] = useState<string>("all");

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

  const handlePurchase = () => {
    toast("Purchase successful!");
    setSelectedAlbum(null);
  };

  // Filter albums based on search query and tier filter
  const filteredAlbums = mockAlbums.filter((album) => {
    const matchesSearch =
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier =
      filterTier === "all" || album.tier.toString() === filterTier;

    return matchesSearch && matchesTier;
  });

  return (
    <div className="py-12 px-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Discover Exclusive Content
        </h1>
        <p className="text-muted-foreground">
          Explore our exclusive collection of premium albums
        </p>
      </div>

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
            <SelectItem value={AlbumTier.standard.toString()}>
              Standard
            </SelectItem>
            <SelectItem value={AlbumTier.premium.toString()}>
              Premium
            </SelectItem>
            <SelectItem value={AlbumTier.exclusive.toString()}>
              Exclusive
            </SelectItem>
            <SelectItem value={AlbumTier.principle.toString()}>
              Principle
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="grid" className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-muted-foreground">
            {filteredAlbums.length} albums available
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
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredAlbums.length > 0 ? (
              filteredAlbums.map((album) => (
                <motion.div key={album.id} variants={item}>
                  <Card
                    className="overflow-hidden h-full flex flex-col bg-card border-border cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedAlbum(album)}
                  >
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
                      <CardTitle className="text-xl">{album.title}</CardTitle>
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
                        <p className="font-medium text-lg">{album.price} SUI</p>
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
        </TabsContent>

        <TabsContent value="list" className="m-0">
          <motion.div
            className="space-y-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredAlbums.length > 0 ? (
              filteredAlbums.map((album) => (
                <motion.div key={album.id} variants={item}>
                  <Card
                    className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedAlbum(album)}
                  >
                    <div className="flex items-center">
                      <div className="w-32 h-20 sm:w-48 sm:h-28">
                        <AspectRatio ratio={16 / 9} className="h-full">
                          <img
                            src={album.preview}
                            alt={album.title}
                            className="object-cover w-full h-full"
                          />
                        </AspectRatio>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <div>
                            <h3 className="font-semibold">{album.title}</h3>
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
                              {album.price} SUI
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
                    {selectedAlbum.title}
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
                    <img
                      src={selectedAlbum.preview}
                      alt={selectedAlbum.title}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  </AspectRatio>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span className="text-lg font-semibold">
                      {selectedAlbum.price} SUI
                    </span>
                  </div>
                  <Button onClick={handlePurchase} className="gap-2">
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
