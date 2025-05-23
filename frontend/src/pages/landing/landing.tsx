import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { Svg3DAnimation } from "@/components/ui/svg-3d-animation";
import { Lock } from "lucide-react";

const stats = [
  { label: "Content Created", value: "15,890+" },
  { label: "Users", value: "32,159+" },
  { label: "Revenue Generated", value: "1,259 SUI" },
  { label: "Unique Content Creators", value: "4,127+" },
];

// Themed images for the 3D marquee showcase
const mockImages = [
  // Digital art & NFT themed images
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&q=80", // NFT art
  "https://images.unsplash.com/photo-1645936041965-ef7ec254954e?w=600&h=400&q=80", // Digital artwork
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=400&q=80", // Crypto art
  "https://images.unsplash.com/photo-1646548851235-0321e69f812f?w=600&h=400&q=80", // Blockchain art
  "https://images.unsplash.com/photo-1629734553618-8627fd538351?w=600&h=400&q=80", // Digital painting

  // Blockchain & technology themed
  "https://images.unsplash.com/photo-1639152201720-5e536d254d81?w=600&h=400&q=80", // Blockchain concept
  "https://images.unsplash.com/photo-1620808335012-0db2093bd970?w=600&h=400&q=80", // Technology data
  "https://images.unsplash.com/photo-1642005508584-4383b0a8226c?w=600&h=400&q=80", // Digital finance
  "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&h=400&q=80", // Futuristic tech
  "https://images.unsplash.com/photo-1638913662180-afc4334cf422?w=600&h=400&q=80", // Crypto mining

  // Premium/exclusive content themed
  "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&h=400&q=80", // Luxury digital
  "https://images.unsplash.com/photo-1618005198919-177e9dd3b230?w=600&h=400&q=80", // Premium experience
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&q=80", // Exclusive visualization
  "https://images.unsplash.com/photo-1556742205-e10c9486e506?w=600&h=400&q=80", // Creative digital
  "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600&h=400&q=80", // Virtual gallery

  // Creator economy & community
  "https://images.unsplash.com/photo-1595561458968-fb29ee2a46a0?w=600&h=400&q=80", // Digital community
  "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=600&h=400&q=80", // Creator space
  "https://images.unsplash.com/photo-1559650656-5d1d361ad10e?w=600&h=400&q=80", // Digital collaboration
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&h=400&q=80", // Community concept
  "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=600&h=400&q=80", // Digital economy
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.5, 0.8],
    [1, 0.8, 0.6, 0.4]
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Hero Section with Animated Background */}
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Added Svg3DAnimation component with improved positioning */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
          <Svg3DAnimation />
        </div>

        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-background to-background/80 z-0">
          {/* Enhanced central glow effect */}
          <motion.div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at center, rgba(97, 179, 220, 0.4), transparent 70%)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.4, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Repositioned and resized left blob for better balance */}
          <motion.div
            className="absolute left-1/5 top-1/3 w-72 h-72 rounded-full blur-3xl"
            style={{ background: "rgba(97, 220, 163, 0.25)" }}
            animate={{
              x: [0, 40, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Repositioned and enhanced right blob */}
          <motion.div
            className="absolute right-1/5 bottom-1/3 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "rgba(97, 179, 220, 0.2)" }}
            animate={{
              x: [0, -50, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        {/* Content with improved spacing and visual hierarchy */}
        <motion.div
          className="relative z-10 text-center max-w-5xl px-6 mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div style={{ y, opacity }} className="mb-10 sm:mb-14">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tighter"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <span className="flex flex-col items-center gap-4">
                  <motion.div
                    className="inline-block p-5 bg-gradient-to-br from-primary/20 to-blue-500/10 rounded-full shadow-lg"
                    animate={{
                      boxShadow: [
                        "0 0 10px rgba(97, 179, 220, 0.3)",
                        "0 0 25px rgba(97, 179, 220, 0.5)",
                        "0 0 10px rgba(97, 179, 220, 0.3)",
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Lock className="h-18 w-18 text-primary" />
                  </motion.div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-primary w-full">
                    Silvy
                  </span>
                </span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-10 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <span className="block">
                  Discover and collect
                  <span className="text-primary font-semibold px-2">
                    Exclusive Content
                  </span>
                  <br/>
                  on the Sui blockchain
                </span>
              </motion.p>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-5 sm:gap-8 justify-center items-center mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <Link to="/home" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-14 sm:h-16 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20"
              >
                Explore App
              </Button>
            </Link>
          </motion.div>

          {/* Enhanced floating circles with better positioning and effects */}
          <motion.div
            className="absolute left-0 sm:left-16 top-20 sm:top-24 w-20 h-20 sm:w-28 sm:h-28 rounded-full hidden sm:block"
            style={{
              background:
                "linear-gradient(45deg, rgba(97, 220, 163, 0.4), rgba(97, 179, 220, 0.4))",
              filter: "blur(12px)",
              zIndex: -1,
            }}
            animate={{
              y: [0, 20, 0],
              rotate: [0, 15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute right-4 sm:right-24 bottom-36 sm:bottom-48 w-28 h-28 sm:w-36 sm:h-36 rounded-full hidden sm:block"
            style={{
              background:
                "linear-gradient(225deg, rgba(97, 179, 220, 0.3), rgba(43, 69, 57, 0.3))",
              filter: "blur(20px)",
              zIndex: -1,
            }}
            animate={{
              y: [0, -25, 0],
              x: [0, 15, 0],
              rotate: [0, -15, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          {/* Added extra floating element to balance the composition */}
          <motion.div
            className="absolute left-1/4 bottom-32 w-16 h-16 sm:w-24 sm:h-24 rounded-full hidden sm:block"
            style={{
              background:
                "linear-gradient(135deg, rgba(120, 200, 255, 0.25), rgba(97, 220, 163, 0.25))",
              filter: "blur(15px)",
              zIndex: -1,
            }}
            animate={{
              y: [0, 15, 0],
              x: [0, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </motion.div>

        {/* Enhanced scroll indicator with gradient effect */}
        <motion.div
          className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          whileHover={{ scale: 1.1 }}
        >
          <motion.div
            className="w-9 h-14 rounded-full border-2 border-primary/20 bg-card/20 backdrop-blur-sm flex justify-center items-start p-2 shadow-lg"
            style={{
              boxShadow: "0 0 15px rgba(97, 179, 220, 0.15)",
            }}
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="w-1.5 h-3 bg-gradient-to-b from-primary to-blue-500 rounded-full"
              animate={{
                y: [0, 5, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Content showcase section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                Build value accruing communities
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Create, share, and monetize your exclusive content on a
              decentralized platform
            </p>
          </motion.div>

          {/* 3D Marquee showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 sm:mb-20 rounded-xl overflow-hidden"
          >
            <ThreeDMarquee
              images={mockImages}
              className="h-[250px] sm:h-[300px] md:h-[400px]"
            />
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center py-8 sm:py-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="p-4 sm:p-6 bg-card/30 backdrop-blur-sm rounded-xl border border-border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.p
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2"
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    delay: index * 0.1 + 0.3,
                  }}
                  viewport={{ once: true }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 bg-gradient-to-b from-background/80 to-background relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 px-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                The Silvy Stack
              </span>
            </h2>
          </motion.div>

          {/* Towns-inspired feature grid with central image */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 md:gap-20 lg:gap-32 mb-16 sm:mb-20 md:mb-24">
            {/* Central image/element - Hidden on mobile */}
            <div className="absolute inset-0 items-center justify-center z-0 hidden lg:block">
              <motion.div
                className="relative w-[250px] h-[250px] lg:w-[350px] lg:h-[350px] xl:w-[400px] xl:h-[400px] mx-auto mt-[60px] lg:mt-[80px] xl:mt-[100px]"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {/* Glass cube effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/5 backdrop-blur-sm border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center"
                  animate={{
                    rotateY: [0, 30, 0, -30, 0],
                    rotateX: [0, 30, 0, -30, 0],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Lock className="h-40 w-40 text-primary" />
                </motion.div>

                {/* Floating inner elements */}
                <motion.div
                  className="absolute top-1/2 left-1/2 w-24 h-24 -ml-12 -mt-12 rounded-full bg-gradient-to-r from-primary/40 to-blue-500/40 blur-md"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.7, 0.5],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </div>

            {/* Feature 1: Top Left */}
            <motion.div
              className="relative z-10 text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 text-primary">
                End-to-end
                <br />
                encryption
              </h3>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xs mx-auto md:mx-0">
                Advanced encryption protects content between creator and
                intended recipients.
              </p>
            </motion.div>

            {/* Feature 2: Top Right */}
            <motion.div
              className="relative z-10 text-center md:text-right"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 text-blue-500">
                Programmable
                <br />
                spaces
              </h3>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xs mx-auto md:ml-auto md:mr-0">
                Smart contracts allow content creators to customize pricing,
                gating, and permissions.
              </p>
            </motion.div>

            {/* Feature 3: Bottom Left */}
            <motion.div
              className="relative z-10 text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 text-primary">
                Decentralized
                <br />
                content
              </h3>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xs mx-auto md:mx-0">
                Content is stored on a network of distributed nodes, ensuring
                censorship resistance.
              </p>
            </motion.div>

            {/* Feature 4: Bottom Right */}
            <motion.div
              className="relative z-10 text-center md:text-right"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 text-blue-500">
                Ownable
                <br />
                communication
              </h3>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xs mx-auto md:ml-auto md:mr-0">
                Content creators have complete control over their data, privacy,
                and engagement policies.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Background decorations */}
        <motion.div
          className="absolute top-1/3 left-10 w-72 h-72 rounded-full blur-3xl opacity-10 bg-primary"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-10 w-96 h-96 rounded-full blur-3xl opacity-10 bg-blue-500"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />
      </section>

      {/* Parallax section with floating elements - towns.com inspired */}
      <section className="py-20 sm:py-24 md:py-32 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                Join the community
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Connect with creators and collectors in a decentralized ecosystem
            </p>
          </motion.div>

          {/* Floating cards with parallax effect */}
          <div className="relative h-[400px] sm:h-[500px] md:h-[600px] my-12 sm:my-16 md:my-20">
            {/* Background gradient blob */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] rounded-full blur-3xl opacity-10"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(97, 220, 163, 0.4), rgba(97, 179, 220, 0.2) 70%)",
              }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Card 1 - Mobile friendly positioning */}
            <motion.div
              className="absolute left-[5%] sm:left-[10%] top-[10%] sm:top-[20%] w-56 sm:w-64 md:w-80 bg-card/70 backdrop-blur-md rounded-xl border border-border shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, 1, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                y: {
                  duration: 0.8,
                  delay: 0.1,
                },
              }}
            >
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-medium mb-2 text-primary">
                  Create
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Share your unique content and monetize directly with your
                  audience
                </p>
              </div>
              <div className="h-24 sm:h-32 bg-gradient-to-br from-primary/20 to-blue-500/20 relative">
                <motion.div
                  className="absolute inset-0 bg-black/10"
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            {/* Card 2 - Center positioned */}
            <motion.div
              className="absolute left-[50%] top-[5%] sm:top-[10%] transform -translate-x-1/2 w-56 sm:w-64 md:w-80 bg-card/70 backdrop-blur-md rounded-xl border border-border shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, -1, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
                y: {
                  duration: 0.8,
                  delay: 0.2,
                },
              }}
            >
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-medium mb-2 text-blue-500">
                  Collect
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Build your collection of exclusive content with verifiable
                  ownership
                </p>
              </div>
              <div className="h-24 sm:h-32 bg-gradient-to-br from-blue-500/20 to-primary/20 relative">
                <motion.div
                  className="absolute inset-0 bg-black/10"
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </div>
            </motion.div>

            {/* Card 3 - Right positioned */}
            <motion.div
              className="absolute right-[5%] sm:right-[10%] top-[50%] sm:top-[30%] w-56 sm:w-64 md:w-80 bg-card/70 backdrop-blur-md rounded-xl border border-border shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 2, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
                y: {
                  duration: 0.8,
                  delay: 0.3,
                },
              }}
            >
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-medium mb-2 text-primary">
                  Trade
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Buy, sell, and trade exclusive content in a secure marketplace
                </p>
              </div>
              <div className="h-24 sm:h-32 bg-gradient-to-br from-primary/20 to-blue-500/20 relative">
                <motion.div
                  className="absolute inset-0 bg-black/10"
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                  }}
                />
              </div>
            </motion.div>

            {/* Floating elements - Hidden on small screens for performance */}
            <motion.div
              className="absolute left-[30%] bottom-[20%] w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/30 to-blue-500/30 backdrop-blur-sm border border-white/10 shadow-lg hidden sm:block"
              animate={{
                y: [0, -30, 0],
                x: [0, 20, 0],
                rotate: [0, 360, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute right-[30%] bottom-[30%] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500/30 to-primary/30 backdrop-blur-sm border border-white/10 shadow-lg hidden sm:block"
              animate={{
                y: [0, -20, 0],
                x: [0, -15, 0],
                rotate: [0, -360, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            <motion.div
              className="absolute left-[60%] bottom-[40%] w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary/30 to-blue-500/30 backdrop-blur-sm border border-white/10 shadow-lg hidden sm:block"
              animate={{
                y: [0, -10, 0],
                x: [0, 10, 0],
                rotate: [0, 180, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </div>
        </div>
      </section>

      {/* App Preview Section - Inspired by towns.com */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 relative overflow-hidden bg-gradient-to-t from-background/50 to-background">
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                Your exclusive content, reimagined
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Beautiful, secure, and decentralized content management on the Sui
              blockchain
            </p>
          </motion.div>

          <div className="relative mt-12 sm:mt-16 md:mt-20">
            {/* Decorative elements */}
            <motion.div
              className="absolute -top-20 -left-20 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-full blur-3xl opacity-10 bg-primary/50 hidden sm:block"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-40 -right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full blur-3xl opacity-10 bg-blue-500/50 hidden sm:block"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* App Preview */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-10">
              {/* Desktop App */}
              <motion.div
                className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:w-3/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="bg-card/70 backdrop-blur-sm rounded-xl border border-border shadow-2xl overflow-hidden">
                  <div className="h-6 sm:h-8 bg-card/80 border-b border-border flex items-center px-3 sm:px-4">
                    <div className="flex space-x-1 sm:space-x-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500/70"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500/70"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500/70"></div>
                    </div>
                  </div>
                  <div className="aspect-[16/9] bg-black/20 relative overflow-hidden">
                    {/* Placeholder for app screenshot - in production replace with actual app screenshot */}
                    <img
                      src="https://source.unsplash.com/random/1200x800?digital+art"
                      alt="App Preview"
                      className="w-full h-full object-cover opacity-90"
                    />
                    {/* Overlay with glowing effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-60"></div>
                  </div>
                </div>
                {/* Floating elements */}
                <motion.div
                  className="absolute -right-6 sm:-right-10 -bottom-6 sm:-bottom-10 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-card/60 backdrop-blur-sm rounded-lg border border-border shadow-lg items-center justify-center hidden sm:flex"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-blue-500 opacity-80"></div>
                </motion.div>
                <motion.div
                  className="absolute -left-3 sm:-left-5 top-1/4 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-card/60 backdrop-blur-sm rounded-lg border border-border shadow-lg items-center justify-center hidden sm:flex"
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, -5, 0],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-primary opacity-80"></div>
                </motion.div>
              </motion.div>

              {/* Mobile App */}
              <motion.div
                className="relative w-full max-w-[200px] sm:max-w-xs lg:w-2/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="bg-card/70 backdrop-blur-sm rounded-3xl border border-border shadow-2xl overflow-hidden">
                  <div className="h-4 sm:h-6 bg-card/80 border-b border-border flex items-center justify-center">
                    <div className="w-16 sm:w-24 h-0.5 sm:h-1 rounded-full bg-muted-foreground/30"></div>
                  </div>
                  <div className="aspect-[9/16] bg-black/20 relative overflow-hidden">
                    {/* Placeholder for mobile app screenshot */}
                    <img
                      src="https://source.unsplash.com/random/800x1600?digital+art"
                      alt="Mobile App Preview"
                      className="w-full h-full object-cover opacity-90"
                    />
                    {/* Overlay with glowing effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent opacity-60"></div>
                  </div>
                </div>
                {/* Floating elements */}
                <motion.div
                  className="absolute -left-6 sm:-left-10 -bottom-3 sm:-bottom-5 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-card/60 backdrop-blur-sm rounded-lg border border-border shadow-lg items-center justify-center hidden sm:flex"
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, -5, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-primary opacity-80"></div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-8 sm:mb-10"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 px-4">
              Ready to join the{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                revolution
              </span>
              ?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
              Connect your wallet and start exploring the future of exclusive
              content today
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Link to="/home" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 sm:h-14 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Explore App
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Background decorations */}
        <motion.div
          className="absolute inset-0 opacity-20 sm:opacity-30"
          style={{
            background:
              "radial-gradient(circle at center, rgba(97, 220, 163, 0.2), transparent 70%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </section>

      {/* Footer Section */}
      <footer className="relative bg-gradient-to-t from-black/5 to-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          {/* Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-primary">
                Product
              </h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <Link
                    to="/home"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Explore Albums
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Create Content
                  </Link>
                </li>
                <li>
                  <Link
                    to="/my-purchase"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    My Collection
                  </Link>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Features
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-primary">
                Developers
              </h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    API Reference
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Smart Contracts
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-primary">
                Community
              </h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Forum
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-primary">
                Company
              </h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Social Media & Bottom Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between pt-6 sm:pt-8 border-t border-border gap-4"
          >
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="inline-block p-2 bg-primary/10 rounded-full">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <span className="text-lg sm:text-xl font-bold">Silvy</span>
              </div>
              <span className="text-muted-foreground text-xs sm:text-sm text-center sm:text-left">
                © 2025 Silvy. All rights reserved.
              </span>
            </div>

            <div className="flex items-center space-x-4 sm:space-x-6">
              {/* Social Media Icons */}
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors duration-200 p-1"
                aria-label="Twitter"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>

              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors duration-200 p-1"
                aria-label="Discord"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.942 4.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3A17.392 17.392 0 0 0 .182 13.218a15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.277.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-8.662zM6.678 10.813a1.941 1.941 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045z" />
                </svg>
              </a>

              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors duration-200 p-1"
                aria-label="GitHub"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>

              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors duration-200 p-1"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Built on Sui Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex justify-center mt-6 sm:mt-8"
          >
            <div className="flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Powered by
              </span>
              <div className="flex items-center space-x-1">
                <img
                  src="/Sui_Symbol_Sea.svg"
                  alt="Sui"
                  className="w-3 h-3 sm:w-4 sm:h-4"
                />
                <span className="text-xs sm:text-sm font-medium text-primary">
                  Sui
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute bottom-0 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-full blur-3xl opacity-3 sm:opacity-5 bg-primary hidden sm:block"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full blur-3xl opacity-3 sm:opacity-5 bg-blue-500 hidden sm:block"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5,
            }}
          />
        </div>
      </footer>
    </div>
  );
}
