import React, { useState } from "react";
import { Search, Filter, Lock, Clock, Users, Star, Coins } from "lucide-react";
import ContentModal from "./ContentModal";

const ExclusiveContentList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const categories = [
    { id: "all", name: "All Content" },
    { id: "courses", name: "Courses" },
    { id: "tutorials", name: "Tutorials" },
    { id: "articles", name: "Articles" },
    { id: "workshops", name: "Workshops" },
  ];

  const content = [
    {
      id: 1,
      title: "Advanced SUI Smart Contract Development",
      category: "courses",
      description:
        "Master the art of writing secure and efficient smart contracts on the SUI blockchain.",
      price: 199.99,
      duration: "12 hours",
      students: 1234,
      rating: 4.8,
      image:
        "https://images.pexels.com/photos/7988079/pexels-photo-7988079.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      author: {
        name: "Alex Morgan",
        avatar:
          "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
    },
    {
      id: 2,
      title: "SUI DeFi Protocol Implementation",
      category: "workshops",
      description:
        "Build a complete DeFi protocol from scratch using SUI smart contracts.",
      price: 299.99,
      duration: "8 hours",
      students: 856,
      rating: 4.9,
      image:
        "https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      author: {
        name: "Sarah Wilson",
        avatar:
          "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
    },
    {
      id: 3,
      title: "Building Scalable dApps on SUI",
      category: "tutorials",
      description:
        "Learn best practices for building high-performance decentralized applications.",
      price: 149.99,
      duration: "6 hours",
      students: 2156,
      rating: 4.7,
      image:
        "https://images.pexels.com/photos/8353841/pexels-photo-8353841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      author: {
        name: "Michael Chen",
        avatar:
          "https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
    },
    {
      id: 4,
      title: "SUI Tokenomics Deep Dive",
      category: "articles",
      description:
        "Comprehensive analysis of token economics in the SUI ecosystem.",
      price: 79.99,
      duration: "2 hours",
      students: 3421,
      rating: 4.6,
      image:
        "https://images.pexels.com/photos/7567557/pexels-photo-7567557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      author: {
        name: "Emma Davis",
        avatar:
          "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
    },
  ];

  const filteredContent = content.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
            Exclusive Content
          </h1>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-card-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-48 pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-card-foreground focus:ring-2 focus:ring-ring focus:border-transparent appearance-none"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-xl shadow-sm overflow-hidden"
            >
              <div
                className="relative h-48 cursor-pointer"
                onClick={() => setSelectedContent(item)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2">
                  <Lock className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={item.author.avatar}
                    alt={item.author.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground">
                      {item.author.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.category.charAt(0).toUpperCase() +
                        item.category.slice(1)}
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">
                      {item.duration}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">
                      {item.students.toLocaleString()} subscribers
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-warning mr-2" />
                    <span className="text-sm text-muted-foreground">
                      {item.rating} rating
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Coins className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">
                      {item.price} SUI
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedContent(item)}
                    className="w-full bg-card text-primary border border-primary font-medium py-2 px-4 rounded-lg hover:bg-muted transition-colors duration-200"
                  >
                    View Details
                  </button>
                  <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                    Get Access
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedContent && (
        <ContentModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}
    </div>
  );
};

export default ExclusiveContentList;
