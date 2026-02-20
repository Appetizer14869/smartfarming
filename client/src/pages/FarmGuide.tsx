/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { getAllFarmingGuides, getFarmingGuideByCrop } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Leaf,
  BookOpen,
  Package,
  Wrench,
  Sprout,
  TrendingUp,
  Scissors,
  Archive,
  AlertTriangle,
  X,
  ChevronRight,
  Loader,
  Info,
} from "lucide-react";

interface FarmingGuide {
  _id?: string;
  Crop: string;
  Introduction?: string;
  "Materials Required"?: string;
  "Preparation Steps"?: string;
  "Planting Procedure"?: string;
  "Growth Stages and Care"?: string;
  "Special Care During Growth Stages"?: string;
  "Harvesting Process"?: string;
  "Post-Harvest Management and Storage"?: string;
  "Challenges and Solutions"?: string;
}

export default function FarmGuide() {
  const [guides, setGuides] = useState<FarmingGuide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<FarmingGuide[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<FarmingGuide | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch all farming guides on mount
  useEffect(() => {
    fetchAllGuides();
  }, []);

  // Filter guides based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGuides(guides);
    } else {
      const filtered = guides.filter((guide) =>
        guide.Crop.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGuides(filtered);
    }
  }, [searchQuery, guides]);

  const fetchAllGuides = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllFarmingGuides();
      
      if (response.success && response.farm_guides) {
        setGuides(response.farm_guides);
        setFilteredGuides(response.farm_guides);
      } else {
        setError(response.error || "Failed to fetch farming guides");
      }
    } catch (err: any) {
      console.error("Error fetching guides:", err);
      setError(err.response?.data?.error || "An error occurred while fetching guides");
    } finally {
      setLoading(false);
    }
  };

  const fetchCropDetail = async (cropName: string) => {
    try {
      setDetailLoading(true);
      const response = await getFarmingGuideByCrop(cropName);
      
      if (response.success && response.farming_guide) {
        setSelectedCrop(response.farming_guide);
      } else {
        setError(response.error || "Failed to fetch crop details");
      }
    } catch (err: any) {
      console.error("Error fetching crop detail:", err);
      setError(err.response?.data?.error || "An error occurred while fetching crop details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCropClick = (guide: FarmingGuide) => {
    fetchCropDetail(guide.Crop);
  };

  const closeModal = () => {
    setSelectedCrop(null);
  };

  // Get first 150 characters of introduction for preview
  const getIntroPreview = (intro?: string) => {
    if (!intro) return "Click to view comprehensive farming guide";
    return intro.length > 150 ? intro.substring(0, 150) + "..." : intro;
  };

  // Info sections for the detail modal
  const getInfoSections = (crop: FarmingGuide) => [
    {
      title: "Introduction",
      icon: <Info className="w-5 h-5" />,
      gradient: "from-blue-500 to-cyan-600",
      content: crop.Introduction,
      fullWidth: true,
    },
    {
      title: "Materials Required",
      icon: <Package className="w-5 h-5" />,
      gradient: "from-purple-500 to-pink-600",
      content: crop["Materials Required"],
      fullWidth: false,
    },
    {
      title: "Preparation Steps",
      icon: <Wrench className="w-5 h-5" />,
      gradient: "from-amber-500 to-orange-600",
      content: crop["Preparation Steps"],
      fullWidth: false,
    },
    {
      title: "Planting Procedure",
      icon: <Sprout className="w-5 h-5" />,
      gradient: "from-emerald-500 to-green-600",
      content: crop["Planting Procedure"],
      fullWidth: true,
    },
    {
      title: "Growth Stages and Care",
      icon: <TrendingUp className="w-5 h-5" />,
      gradient: "from-green-500 to-teal-600",
      content: crop["Growth Stages and Care"],
      fullWidth: false,
    },
    {
      title: "Special Care During Growth Stages",
      icon: <Leaf className="w-5 h-5" />,
      gradient: "from-teal-500 to-cyan-600",
      content: crop["Special Care During Growth Stages"],
      fullWidth: false,
    },
    {
      title: "Harvesting Process",
      icon: <Scissors className="w-5 h-5" />,
      gradient: "from-yellow-500 to-amber-600",
      content: crop["Harvesting Process"],
      fullWidth: false,
    },
    {
      title: "Post-Harvest Management and Storage",
      icon: <Archive className="w-5 h-5" />,
      gradient: "from-indigo-500 to-purple-600",
      content: crop["Post-Harvest Management and Storage"],
      fullWidth: false,
    },
    {
      title: "Challenges and Solutions",
      icon: <AlertTriangle className="w-5 h-5" />,
      gradient: "from-red-500 to-pink-600",
      content: crop["Challenges and Solutions"],
      fullWidth: true,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Crop Farming Guide
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Comprehensive farming information for {guides.length} crops
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for crops (e.g., Rice, Wheat, Cotton)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm text-gray-900 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
          role="alert"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading farming guides...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Results Count */}
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 text-sm text-gray-600"
            >
              Found {filteredGuides.length} crop{filteredGuides.length !== 1 ? "s" : ""} matching "{searchQuery}"
            </motion.div>
          )}

          {/* Crop Cards Grid */}
          {filteredGuides.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200"
            >
              <div className="inline-flex p-6 bg-gray-100 rounded-full mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No crops found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Try adjusting your search query or browse all available farming guides
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredGuides.map((guide, index) => (
                <motion.div
                  key={guide._id || guide.Crop}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => handleCropClick(guide)}
                  className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl border-2 border-gray-100 hover:border-emerald-500 p-6 cursor-pointer transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/5 group-hover:to-green-500/5 transition-all duration-300"></div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <Leaf className="w-6 h-6" />
                    </div>

                    {/* Crop Name */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors capitalize">
                      {guide.Crop}
                    </h3>

                    {/* Introduction Preview */}
                    <p className="text-xs text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {getIntroPreview(guide.Introduction)}
                    </p>

                    {/* View Details Link */}
                    <div className="flex items-center text-emerald-600 text-sm font-semibold group-hover:gap-3 gap-2 transition-all">
                      <span>View Full Guide</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Crop Detail Modal */}
      <AnimatePresence>
        {selectedCrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
            >
              {detailLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader className="w-12 h-12 text-emerald-500 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Modal Header */}
                  <div className="relative bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 p-8">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

                    <button
                      onClick={closeModal}
                      className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors z-10"
                      aria-label="Close modal"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    <div className="relative flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                        <Leaf className="w-12 h-12 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2 capitalize">
                          {selectedCrop.Crop}
                        </h2>
                        <p className="text-emerald-50">Complete Farming Guide</p>
                      </div>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 lg:p-8 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
                    <div className="space-y-6">
                      {getInfoSections(selectedCrop).map((section, idx) => (
                        section.content && (
                          <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 ${
                              section.fullWidth ? 'col-span-full' : ''
                            }`}
                          >
                            {/* Section Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`p-2.5 rounded-xl bg-gradient-to-r ${section.gradient} text-white shadow-lg`}>
                                {section.icon}
                              </div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {section.title}
                              </h3>
                            </div>

                            {/* Section Content */}
                            <div className="bg-white rounded-xl p-5 border border-gray-200">
                              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {section.content}
                              </p>
                            </div>
                          </motion.div>
                        )
                      ))}

                      {/* Footer note */}
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                          This guide provides general farming recommendations. Always consult with local agricultural experts for region-specific advice.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}