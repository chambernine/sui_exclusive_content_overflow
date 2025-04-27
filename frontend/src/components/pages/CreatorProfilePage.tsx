import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronsUpDown,
  CreditCard,
  Eye,
  FileImage,
  Fingerprint,
  Heart,
  Lock,
  MessageSquare,
  Share2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Creator } from "@/lib/types";

// Mock data for a specific creator
const mockCreator: Creator = {
  id: 1,
  name: "CryptoArtist",
  address: "0x8fc410db4e606ae2185d6fef10df5b8bfe47ae0b3dc48989a0f92aec2eb442a4",
  price: "2.5 SUI",
  profileImage:
    "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=800&auto=format&fit=crop&q=60",
  bio: "Digital artist sharing exclusive photography collections and visual art. Based in San Francisco, exploring the intersection of blockchain and creative expression.",
  subscribers: 234,
  contentType: "Photography",
  createdAt: new Date("2023-10-15"),
  contentCount: 48,
  engagementRate: 92,
  totalViews: 12580,
  rank: 1,
  rankChange: 0,
  verified: true,
};

// Mock content data
const mockContent = [
  {
    id: 1,
    title: "Urban Reflections",
    description:
      "A collection of city photography with reflections in glass and water",
    coverImage:
      "https://images.unsplash.com/photo-1612005332925-6ee53736b1ed?w=800&auto=format&fit=crop&q=60",
    previewImage:
      "https://images.unsplash.com/photo-1612005332925-6ee53736b1ed?w=800&auto=format&fit=crop&q=60&blur=20",
    createdAt: new Date("2024-02-15"),
    isPremium: true,
    likes: 124,
    comments: 18,
    views: 1450,
  },
  {
    id: 2,
    title: "Digital Dreams",
    description: "AI-assisted artworks depicting futuristic landscapes",
    coverImage:
      "https://images.unsplash.com/photo-1617791160588-241658c0f566?w=800&auto=format&fit=crop&q=60",
    previewImage:
      "https://images.unsplash.com/photo-1617791160588-241658c0f566?w=800&auto=format&fit=crop&q=60&blur=20",
    createdAt: new Date("2024-01-28"),
    isPremium: true,
    likes: 87,
    comments: 12,
    views: 920,
  },
  {
    id: 3,
    title: "Abstract Architecture",
    description: "Modern architecture from a unique perspective",
    coverImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    previewImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60&blur=20",
    createdAt: new Date("2024-03-05"),
    isPremium: false,
    likes: 56,
    comments: 7,
    views: 680,
  },
  {
    id: 4,
    title: "Neon Nights",
    description: "Urban photography with neon lights and night scenes",
    coverImage:
      "https://images.unsplash.com/photo-1647163927406-56e868e8bb80?w=800&auto=format&fit=crop&q=60",
    previewImage:
      "https://images.unsplash.com/photo-1647163927406-56e868e8bb80?w=800&auto=format&fit=crop&q=60&blur=20",
    createdAt: new Date("2023-12-12"),
    isPremium: true,
    likes: 145,
    comments: 23,
    views: 1780,
  },
];

// Mock earnings data
const mockEarnings = {
  total: "1,245.50 SUI",
  thisMonth: "218.75 SUI",
  lastMonth: "186.25 SUI",
  monthlyGrowth: 17.45,
  earnings: [
    { month: "Jan", amount: 145.25 },
    { month: "Feb", amount: 186.25 },
    { month: "Mar", amount: 218.75 },
  ],
  subscribers: [
    { month: "Jan", count: 187 },
    { month: "Feb", count: 212 },
    { month: "Mar", count: 234 },
  ],
  topContent: [
    { title: "Neon Nights", earnings: "142.50 SUI" },
    { title: "Urban Reflections", earnings: "127.80 SUI" },
    { title: "Digital Dreams", earnings: "98.50 SUI" },
  ],
};

export function CreatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [content, setContent] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch creator data
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call to fetch creator data
    const timer = setTimeout(() => {
      // In a real app, you would fetch the creator by ID
      setCreator(mockCreator);
      setContent(mockContent);
      setEarnings(mockEarnings);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold">Creator not found</h2>
        <p className="text-muted-foreground">
          The creator profile you're looking for doesn't exist or has been
          removed
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-16"
    >
      {/* Hero section with creator info */}
      <div className="relative">
        {/* Cover background */}
        <div className="h-48 md:h-64 lg:h-80 w-full overflow-hidden rounded-lg border border-border/60 bg-background/50 backdrop-blur-sm">
          <div className="w-full h-full bg-gradient-to-b from-primary/10 to-background/20"></div>
        </div>

        {/* Profile content positioned relative to the cover */}
        <div className="container max-w-6xl mx-auto px-4">
          <div className="relative -mt-24 md:-mt-28">
            {/* Profile image and basic info */}
            <div className="flex flex-col md:flex-row gap-6 md:items-end">
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={creator.profileImage}
                    alt={creator.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background object-cover shadow-md"
                  />
                  {creator.verified && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1.5">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-grow flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{creator.name}</h1>
                    {creator.rank && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      >
                        #{creator.rank} Ranked
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {creator.subscribers.toLocaleString()} subscribers
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileImage className="h-4 w-4 text-muted-foreground" />
                      <span>{creator.contentCount} content pieces</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span>{creator.engagementRate}% engagement</span>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-muted-foreground max-w-2xl">
                    {creator.bio}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                  <Button
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    className={
                      isSubscribed ? "bg-red-500 hover:bg-red-600" : ""
                    }
                  >
                    {isSubscribed
                      ? "Unsubscribe"
                      : `Subscribe • ${creator.price}`}
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container max-w-6xl mx-auto px-4">
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-grid">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  <Card className="overflow-hidden h-full border-border/60 bg-background/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                    <div className="relative aspect-video">
                      {/* Use blur preview for premium content if not subscribed */}
                      <img
                        src={
                          item.isPremium && !isSubscribed
                            ? item.previewImage
                            : item.coverImage
                        }
                        alt={item.title}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      {/* Premium content badge */}
                      {item.isPremium && (
                        <Badge
                          variant="secondary"
                          className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm"
                        >
                          {isSubscribed ? "Premium" : "Locked"}
                        </Badge>
                      )}

                      {/* Lock overlay for premium content */}
                      {item.isPremium && !isSubscribed && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]">
                          <Lock className="h-8 w-8 text-white mb-2" />
                          <p className="text-white font-semibold">
                            Subscribe to unlock
                          </p> 
                          <Button size="sm" className="mt-3">
                            Subscribe • {creator.price}
                          </Button>
                        </div>
                      )}

                      {/* Content title */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-bold text-white text-lg">
                          {item.title}
                        </h3>
                        <p className="text-white/80 text-sm line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                        <span>
                          {item.createdAt.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">{item.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">{item.comments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">{item.views}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Earnings */}
              <Card className="bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    Total Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{earnings?.total}</div>
                  <p className="text-muted-foreground text-sm mt-1">
                    Lifetime earnings
                  </p>
                </CardContent>
              </Card>

              {/* Monthly Earnings */}
              <Card className="bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    Monthly Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {earnings?.thisMonth}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      vs {earnings?.lastMonth} last month
                    </span>
                    <span className="flex items-center text-xs text-green-500">
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                      {earnings?.monthlyGrowth}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Subscriber Count */}
              <Card className="bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Subscribers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {creator.subscribers}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      Active subscriptions
                    </span>
                    <Badge variant="outline" className="text-xs">
                      @ {creator.price} each
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings breakdown */}
            <Card className="bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Earnings Breakdown</CardTitle>
                <CardDescription>
                  Your top performing content and earnings overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top earning content */}
                  <div>
                    <h3 className="font-medium mb-3 text-sm">
                      Top earning content
                    </h3>
                    <ul className="space-y-3">
                      {earnings?.topContent.map((item: any, index: number) => (
                        <li
                          key={index}
                          className="flex items-center justify-between border-b border-border/40 pb-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <span className="font-mono">{item.earnings}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Monthly growth stats */}
                  <div>
                    <h3 className="font-medium mb-3 text-sm">Monthly growth</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        {earnings?.earnings.map((item: any, index: number) => (
                          <div
                            key={index}
                            className="border border-border rounded-md p-3"
                          >
                            <div className="text-xs text-muted-foreground">
                              {item.month}
                            </div>
                            <div className="text-md font-medium mt-1">
                              {item.amount} SUI
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {earnings?.subscribers.map(
                          (item: any, index: number) => (
                            <div
                              key={index}
                              className="border border-border rounded-md p-3"
                            >
                              <div className="text-xs text-muted-foreground">
                                {item.month} Subs
                              </div>
                              <div className="text-md font-medium mt-1">
                                {item.count}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payout history */}
            <Card className="bg-background/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Payout History</CardTitle>
                  <CardDescription>
                    Recent payouts to your connected wallet
                  </CardDescription>
                </div>
                <Button size="sm">Request Payout</Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-accent/50">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                          >
                            Transaction
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-background/30 divide-y divide-border">
                        <tr className="hover:bg-accent/30 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            Mar 25, 2025
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            176.50 SUI
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                            <div className="flex items-center gap-1">
                              <Fingerprint className="h-3.5 w-3.5" />
                              0x8fc4...442a
                              <ArrowUpRight className="h-3.5 w-3.5 text-primary cursor-pointer" />
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-500 border-green-500/20"
                            >
                              Completed
                            </Badge>
                          </td>
                        </tr>
                        <tr className="hover:bg-accent/30 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            Feb 28, 2025
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            143.25 SUI
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                            <div className="flex items-center gap-1">
                              <Fingerprint className="h-3.5 w-3.5" />
                              0x7bc3...128f
                              <ArrowUpRight className="h-3.5 w-3.5 text-primary cursor-pointer" />
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-500 border-green-500/20"
                            >
                              Completed
                            </Badge>
                          </td>
                        </tr>
                        <tr className="hover:bg-accent/30 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            Jan 30, 2025
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            112.75 SUI
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                            <div className="flex items-center gap-1">
                              <Fingerprint className="h-3.5 w-3.5" />
                              0x5fe1...982c
                              <ArrowUpRight className="h-3.5 w-3.5 text-primary cursor-pointer" />
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-500 border-green-500/20"
                            >
                              Completed
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Bio and Details */}
                <Card className="bg-background/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>About {creator.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Bio</h3>
                      <p className="text-muted-foreground">{creator.bio}</p>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Content Focus</h3>
                      <p className="text-muted-foreground">
                        Specializing in {creator.contentType} with a unique
                        approach to visual storytelling and digital
                        experimentation. Each collection is crafted with
                        attention to detail and artistic expression.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Creator Since</h3>
                      <p className="text-muted-foreground">
                        {creator.createdAt.toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Subscription Details */}
                <Card className="bg-background/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Subscription Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                      <span className="font-medium">Subscription Price</span>
                      <span className="font-mono">{creator.price}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                      <span className="font-medium">Billing Frequency</span>
                      <span>Monthly</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                      <span className="font-medium">Content Access</span>
                      <span>{creator.contentCount} premium items</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Exclusive Benefits</span>
                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="pt-2">
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-sm">
                            Access to all premium content
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-sm">
                            Early access to new releases
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-sm">
                            Exclusive subscriber-only content
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-sm">
                            Direct messaging with the creator
                          </span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Wallet Address */}
                <Card className="bg-background/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Wallet Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2 font-mono text-sm break-all">
                      <Fingerprint className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      {creator.address}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Copy Address
                    </Button>
                  </CardContent>
                </Card>

                {/* Stats */}
                <Card className="bg-background/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Creator Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rank</span>
                      <span className="font-medium">#{creator.rank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Content</span>
                      <span className="font-medium">
                        {creator.contentCount} pieces
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Views</span>
                      <span className="font-medium">
                        {creator.totalViews.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subscribers</span>
                      <span className="font-medium">
                        {creator.subscribers.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Engagement</span>
                      <span className="font-medium">
                        {creator.engagementRate}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="space-y-3">
                  <Button className="w-full">
                    {isSubscribed
                      ? "Manage Subscription"
                      : `Subscribe • ${creator.price}`}
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Creator
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
