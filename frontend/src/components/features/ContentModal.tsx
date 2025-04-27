import React from "react";
import {
  X,
  Lock,
  Clock,
  Users,
  Star,
  CheckCircle,
  BookOpen,
} from "lucide-react";

interface ContentModalProps {
  content: {
    id: number;
    title: string;
    category: string;
    description: string;
    price: number;
    duration: string;
    students: number;
    rating: number;
    image: string;
    author: {
      name: string;
      avatar: string;
    };
  };
  onClose: () => void;
}

const ContentModal: React.FC<ContentModalProps> = ({ content, onClose }) => {
  // Additional locked preview images
  const previewImages = [
    "https://images.pexels.com/photos/8353841/pexels-photo-8353841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/7988079/pexels-photo-7988079.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {content.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="relative rounded-xl overflow-hidden mb-4">
                <img
                  src={content.image}
                  alt={content.title}
                  className="w-full h-64 object-cover"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {previewImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative rounded-lg overflow-hidden"
                  >
                    <img
                      src={img}
                      alt="Preview"
                      className="w-full h-24 object-cover filter blur-sm"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  What you'll learn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Smart Contract Development",
                    "Security Best Practices",
                    "Gas Optimization",
                    "Testing Strategies",
                    "Deployment Techniques",
                    "Integration Patterns",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center mb-6">
                <img
                  src={content.author.avatar}
                  alt={content.author.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {content.author.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Lead Instructor
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Duration
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {content.duration}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Enrolled
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {content.students.toLocaleString()} students
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-yellow-400 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Rating
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {content.rating} out of 5
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Level
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Advanced</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {content.description}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Master the intricacies of SUI blockchain development with our
                  comprehensive course. From basic concepts to advanced
                  implementations, this course covers everything you need to
                  become a proficient SUI developer.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${content.price}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    One-time payment
                  </span>
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                  Get Access Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentModal;
