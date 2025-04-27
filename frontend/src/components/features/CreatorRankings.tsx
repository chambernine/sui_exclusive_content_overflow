import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Award,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileImage,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Creator } from "@/lib/types";

import { Link } from "react-router-dom";

// Mock data for creator rankings
const mockCreators: Creator[] = [
  {
    id: 1,
    name: "CryptoArtist",
    address:
      "0x8fc410db4e606ae2185d6fef10df5b8bfe47ae0b3dc48989a0f92aec2eb442a4",
    price: "2.5 SUI",
    profileImage:
      "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=800&auto=format&fit=crop&q=60",
    bio: "Digital artist sharing exclusive photography collections",
    subscribers: 234,
    contentType: "Photography",
    createdAt: new Date("2023-10-15"),
    contentCount: 48,
    engagementRate: 92,
    totalViews: 12580,
    rankChange: 0,
    verified: true,
  },
  {
    id: 2,
    name: "PixelMaster",
    address:
      "0x1fc410db4e606ae2185d6fef10df5b8bfe47ae0b3dc48989a0f92aec2eb442a4",
    price: "1.8 SUI",
    profileImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    bio: "Creating unique AI-generated art and photo collections",
    subscribers: 189,
    contentType: "Digital Art",
    createdAt: new Date("2023-12-05"),
    contentCount: 31,
    engagementRate: 85,
    totalViews: 8760,
    rankChange: 2,
    verified: true,
  },
  {
    id: 3,
    name: "AbstractMinds",
    address:
      "0x2fc410db4e606ae2185d6fef10df5b8bfe47ae0b3dc48989a0f92aec2eb442a4",
    price: "3.2 SUI",
    profileImage:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=60",
    bio: "Experimental photography and artistic collections",
    subscribers: 456,
    contentType: "Mixed Media",
    createdAt: new Date("2023-08-22"),
    contentCount: 87,
    engagementRate: 91,
    totalViews: 25460,
    rankChange: -1,
    verified: false,
  },
  {
    id: 4,
    name: "FutureVisions",
    address:
      "0x3fc410db4e606ae2185d6fef10df5b8bfe47ae0b3dc48989a0f92aec2eb442a4",
    price: "1.5 SUI",
    profileImage:
      "https://images.unsplash.com/photo-1633101585272-9512182e107b?w=800&auto=format&fit=crop&q=60",
    bio: "Sci-fi and futuristic themed photo albums",
    subscribers: 321,
    contentType: "Photography",
    createdAt: new Date("2024-01-30"),
    contentCount: 42,
    engagementRate: 88,
    totalViews: 14230,
    rankChange: 3,
    verified: false,
  },
  {
    id: 5,
    name: "NeonDreams",
    address:
      "0x4fc410db4e606ae2185d6fef10df5b8bfe47ae0b3dc48989a0f92aec2eb442a4",
    price: "2.7 SUI",
    profileImage:
      "https://images.unsplash.com/photo-1647163927406-56e868e8bb80?w=800&auto=format&fit=crop&q=60",
    bio: "Urban photography with neon aesthetics",
    subscribers: 278,
    contentType: "Photography",
    createdAt: new Date("2023-11-12"),
    contentCount: 36,
    engagementRate: 79,
    totalViews: 9870,
    rankChange: -2,
    verified: true,
  },
  {
    id: 6,
    name: "QuantumFragments",
    address:
      "0x5fc410db4e606ae2185d6fef10df5b8bfe47ae0b3dc48989a0f92aec2eb442a4",
    price: "4.2 SUI",
    profileImage:
      "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=800&auto=format&fit=crop&q=60",
    bio: "Abstract art and experimental photography",
    subscribers: 512,
    contentType: "Mixed Media",
    createdAt: new Date("2023-07-04"),
    contentCount: 103,
    engagementRate: 94,
    totalViews: 32480,
    rankChange: 1,
    verified: true,
  },
  {
    id: 7,
    name: "EtherealSpaces",
    address:
      "0x6fc410db4e606ae2185d6fef10df5b8bfe47ae0b3dc48989a0f92aec2eb442a4",
    price: "1.9 SUI",
    profileImage:
      "https://images.unsplash.com/photo-1617791160588-241658c0f566?w=800&auto=format&fit=crop&q=60",
    bio: "Nature and landscape photography collections",
    subscribers: 189,
    contentType: "Photography",
    createdAt: new Date("2024-02-28"),
    contentCount: 24,
    engagementRate: 81,
    totalViews: 6420,
    rankChange: 5,
    verified: false,
  },
  {
    id: 8,
    name: "BlockchainVisions",
    address:
      "0x7fc410db4e606ae2185d6fef10df5b8bfe47ae0b3dc48989a0f92aec2eb442a4",
    price: "3.5 SUI",
    profileImage:
      "https://images.unsplash.com/photo-1633186726100-3e86214e00e3?w=800&auto=format&fit=crop&q=60",
    bio: "Crypto-themed art and photography",
    subscribers: 345,
    contentType: "Digital Art",
    createdAt: new Date("2023-09-18"),
    contentCount: 58,
    engagementRate: 87,
    totalViews: 19350,
    rankChange: -3,
    verified: true,
  },
  {
    id: 9,
    name: "DigitalDreamscapes",
    address:
      "0x8cc410db4e606ae2185d6fef10df5b8bfe47ae0b3dc48989a0f92aec2eb442a4",
    price: "2.3 SUI",
    profileImage:
      "https://images.unsplash.com/photo-1618172193622-ae2d025f2c85?w=800&auto=format&fit=crop&q=60",
    bio: "Creating surreal digital landscapes and portraits",
    subscribers: 267,
    contentType: "Digital Art",
    createdAt: new Date("2024-01-05"),
    contentCount: 29,
    engagementRate: 83,
    totalViews: 8120,
    rankChange: 2,
    verified: false,
  },
  {
    id: 10,
    name: "VirtualExplorers",
    address:
      "0x9fc410db4e606ae2185d6fef10df5b8bfe47ae0b3dc48989a0f92aec2eb442a4",
    price: "2.8 SUI",
    profileImage:
      "https://images.unsplash.com/photo-1634973443912-84a1ab0ab3cd?w=800&auto=format&fit=crop&q=60",
    bio: "VR experiences and 360° photography",
    subscribers: 312,
    contentType: "Mixed Media",
    createdAt: new Date("2023-10-30"),
    contentCount: 45,
    engagementRate: 89,
    totalViews: 16980,
    rankChange: 0,
    verified: true,
  },
];

type SortField =
  | "rank"
  | "subscribers"
  | "engagementRate"
  | "contentCount"
  | "totalViews"
  | "createdAt";
type SortOrder = "asc" | "desc";

export function CreatorRankings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rankedCreators, setRankedCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Fetch and rank creators
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call with a delay
    const timer = setTimeout(() => {
      const ranked = [...mockCreators];
      setRankedCreators(ranked);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Sort creators based on the selected field and order
  const sortedCreators = [...rankedCreators].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "rank":
        comparison = (a.rank || 999) - (b.rank || 999);
        break;
      case "subscribers":
        comparison = a.subscribers - b.subscribers;
        break;
      case "engagementRate":
        comparison = a.engagementRate - b.engagementRate;
        break;
      case "contentCount":
        comparison = a.contentCount - b.contentCount;
        break;
      case "totalViews":
        comparison = a.totalViews - b.totalViews;
        break;
      case "createdAt":
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      default:
        comparison = (a.rank || 999) - (b.rank || 999);
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Filter creators by search term
  const filteredCreators = sortedCreators.filter((creator) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      creator.name.toLowerCase().includes(searchLower) ||
      creator.bio.toLowerCase().includes(searchLower) ||
      creator.contentType?.toLowerCase().includes(searchLower)
    );
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field and reset to ascending
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;

    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            Creator Rankings
          </h1>
        </div>
        <p className="text-muted-foreground">
          Discover our top creators based on subscriber count, engagement, and
          content quality
        </p>
      </motion.div>

      <Card className="overflow-hidden border-border/60 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Top Creator Leaderboard</CardTitle>
          <CardDescription>
            Ranked by engagement rate, subscribers, views, and content count
          </CardDescription>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              className="w-full rounded-md border bg-transparent pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
              placeholder="Search creators by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-accent/50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("rank")}
                        >
                          <div className="flex items-center gap-1">
                            Rank {getSortIcon("rank")}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Creator
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hidden md:table-cell"
                          onClick={() => handleSort("subscribers")}
                        >
                          <div className="flex items-center gap-1">
                            Subscribers {getSortIcon("subscribers")}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hidden lg:table-cell"
                          onClick={() => handleSort("engagementRate")}
                        >
                          <div className="flex items-center gap-1">
                            Engagement {getSortIcon("engagementRate")}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hidden lg:table-cell"
                          onClick={() => handleSort("contentCount")}
                        >
                          <div className="flex items-center gap-1">
                            Content {getSortIcon("contentCount")}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hidden md:table-cell"
                          onClick={() => handleSort("totalViews")}
                        >
                          <div className="flex items-center gap-1">
                            Views {getSortIcon("totalViews")}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background/30 divide-y divide-border">
                      {filteredCreators.length > 0 ? (
                        filteredCreators.map((creator) => (
                          <tr
                            key={creator.id}
                            className="hover:bg-accent/30 transition-colors"
                          >
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 flex items-center justify-center rounded-full 
                                  ${
                                    creator.rank === 1
                                      ? "bg-yellow-500/20 text-yellow-500"
                                      : creator.rank === 2
                                      ? "bg-gray-400/20 text-gray-400"
                                      : creator.rank === 3
                                      ? "bg-amber-700/20 text-amber-700"
                                      : "bg-primary/10 text-primary/80"
                                  }`}
                                >
                                  {creator.rank || "-"}
                                </div>

                                {creator.rankChange !== 0 && (
                                  <div
                                    className={`flex items-center text-xs 
                                    ${
                                      creator.rankChange > 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {creator.rankChange > 0 ? (
                                      <ArrowUp className="h-3 w-3 mr-0.5" />
                                    ) : (
                                      <ArrowDown className="h-3 w-3 mr-0.5" />
                                    )}
                                    {Math.abs(creator.rankChange)}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <Link to={`/creator-profile/${creator.id}`}>
                                  <img
                                    src={creator.profileImage}
                                    alt={creator.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                </Link>
                                <div>
                                  <div className="flex items-center gap-1">
                                    <Link
                                      to={`/creator-profile/${creator.id}`}
                                      className="font-medium text-sm hover:text-primary transition-colors"
                                    >
                                      {creator.name}
                                    </Link>
                                    {creator.verified && (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground font-mono truncate max-w-[120px] sm:max-w-none">
                                    {creator.address.substring(0, 6)}...
                                    {creator.address.substring(
                                      creator.address.length - 4
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                              <div className="flex items-center gap-1 text-sm">
                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>
                                  {creator.subscribers.toLocaleString()}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                              <div className="flex items-center gap-1">
                                <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                                <span
                                  className={`text-sm ${
                                    creator.engagementRate > 90
                                      ? "text-green-500"
                                      : creator.engagementRate > 80
                                      ? "text-green-400"
                                      : creator.engagementRate > 70
                                      ? "text-amber-500"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {creator.engagementRate}%
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                              <div className="flex items-center gap-1 text-sm">
                                <FileImage className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{creator.contentCount}</span>
                              </div>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                              <div className="text-sm">
                                {creator.totalViews.toLocaleString()}
                              </div>
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap text-right">
                              <Link to={`/creator-profile/${creator.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-primary/20 hover:border-primary/40"
                                >
                                  View Profile
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Search className="h-5 w-5" />
                              <p>No creators found matching your search</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>
                    Rankings are updated daily based on activity and engagement
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-background/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Top Creator
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCreators.length > 0 && (
              <div className="flex items-center gap-3">
                <img
                  src={filteredCreators[0].profileImage}
                  alt={filteredCreators[0].name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium flex items-center gap-1">
                    {filteredCreators[0].name}
                    {filteredCreators[0].verified && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {filteredCreators[0].subscribers.toLocaleString()}{" "}
                    subscribers
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              Highest Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCreators.length > 0 && (
              <div className="flex items-center gap-3">
                <img
                  src={
                    [...filteredCreators].sort(
                      (a, b) => b.engagementRate - a.engagementRate
                    )[0].profileImage
                  }
                  alt={
                    [...filteredCreators].sort(
                      (a, b) => b.engagementRate - a.engagementRate
                    )[0].name
                  }
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium">
                    {
                      [...filteredCreators].sort(
                        (a, b) => b.engagementRate - a.engagementRate
                      )[0].name
                    }
                  </div>
                  <div className="text-sm text-green-500">
                    {
                      [...filteredCreators].sort(
                        (a, b) => b.engagementRate - a.engagementRate
                      )[0].engagementRate
                    }
                    % engagement rate
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-primary" />
              Fastest Rising
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCreators.length > 0 && (
              <div className="flex items-center gap-3">
                <img
                  src={
                    [...filteredCreators].sort(
                      (a, b) => (b.rankChange || 0) - (a.rankChange || 0)
                    )[0].profileImage
                  }
                  alt={
                    [...filteredCreators].sort(
                      (a, b) => (b.rankChange || 0) - (a.rankChange || 0)
                    )[0].name
                  }
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium">
                    {
                      [...filteredCreators].sort(
                        (a, b) => (b.rankChange || 0) - (a.rankChange || 0)
                      )[0].name
                    }
                  </div>
                  <div className="flex items-center text-sm text-primary">
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                    Up{" "}
                    {
                      [...filteredCreators].sort(
                        (a, b) => (b.rankChange || 0) - (a.rankChange || 0)
                      )[0].rankChange
                    }{" "}
                    positions
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
