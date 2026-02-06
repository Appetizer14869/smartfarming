import { useEffect, useState, useMemo } from "react";
import { api } from "../lib/api";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import toast from "react-hot-toast";
import SavedAnalytics from "./SavedAnalytics";
import { BarChart3, Download, Filter, Save, X, Calendar, MapPin, Leaf } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface RecommendationHistory {
  recommended_crop: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  timestamp: string;
  location?: { city?: string; country?: string };
}

export default function Analytics() {
  const [rawHistory, setRawHistory] = useState<RecommendationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const [crop, setCrop] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/combined/history");
        if (res.data.success) {
          setRawHistory(res.data.history);
        }
      } catch {
        console.error("Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const history = useMemo(() => {
    return rawHistory.filter((rec) => {
      if (crop && rec.recommended_crop !== crop) return false;
      if (city && rec.location?.city !== city) return false;
      if (country && rec.location?.country !== country) return false;
      if (startDate && new Date(rec.timestamp) < new Date(startDate)) return false;
      if (endDate && new Date(rec.timestamp) > new Date(endDate)) return false;
      return true;
    });
  }, [rawHistory, crop, city, country, startDate, endDate]);

  const resetFilters = () => {
    setCrop("");
    setCity("");
    setCountry("");
    setStartDate("");
    setEndDate("");
    setShowFilters(false);
  };

  const exportCSV = () => {
    const headers = ["Date", "Crop", "Temperature", "Humidity", "Rainfall", "City", "Country"];
    const rows = history.map((rec) => [
      new Date(rec.timestamp).toLocaleString(),
      rec.recommended_crop,
      rec.temperature,
      rec.humidity,
      rec.rainfall,
      rec.location?.city || "",
      rec.location?.country || "",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "analytics_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Analytics exported successfully");
  };

  const saveFilteredResults = async () => {
    try {
      const res = await api.post("/analytics/save", {
        filters: { crop, city, country, startDate, endDate },
        results: history,
      });
      if (res.data.success) {
        toast.success("Analytics query saved successfully");
      } else {
        toast.error(res.data.message || "Failed to save analytics query");
      }
    } catch {
      toast.error("Error saving analytics query");
    }
  };

  const applySavedFilters = (filters: {
    crop?: string;
    city?: string;
    country?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    setCrop(filters.crop || "");
    setCity(filters.city || "");
    setCountry(filters.country || "");
    setStartDate(filters.startDate || "");
    setEndDate(filters.endDate || "");
    toast.success("Saved query applied");
  };

  const pieData = {
    labels: Object.keys(
      history.reduce((acc, rec) => {
        acc[rec.recommended_crop] = (acc[rec.recommended_crop] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
    datasets: [
      {
        data: Object.values(
          history.reduce((acc, rec) => {
            acc[rec.recommended_crop] = (acc[rec.recommended_crop] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ),
        backgroundColor: [
          "#10b981",
          "#3b82f6",
          "#f59e0b",
          "#ef4444",
          "#6366f1",
          "#ec4899",
          "#14b8a6",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const lineData = {
    labels: history.map((rec) => new Date(rec.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: "Temperature (°C)",
        data: history.map((rec) => rec.temperature),
        borderColor: "#ef4444",
        backgroundColor: "#ef444420",
        tension: 0.4,
      },
      {
        label: "Humidity (%)",
        data: history.map((rec) => rec.humidity),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f620",
        tension: 0.4,
      },
      {
        label: "Rainfall (mm)",
        data: history.map((rec) => rec.rainfall),
        borderColor: "#10b981",
        backgroundColor: "#10b98120",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 via-emerald-500 to-green-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <BarChart3 className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">Analytics Dashboard</h2>
              <p className="text-blue-100">Visualize your crop recommendation data</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
            <p className="text-sm font-medium">{history.length} Records</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-gray-900">Filters</span>
            {(crop || city || country || startDate || endDate) && (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          <div
            className={`transform transition-transform ${showFilters ? "rotate-180" : ""}`}
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {showFilters && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="grid md:grid-cols-5 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Leaf className="w-4 h-4 inline mr-1" />
                  Crop
                </label>
                <input
                  type="text"
                  placeholder="e.g., Rice"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mombasa"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g., Kenya"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={exportCSV}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={saveFilteredResults}
                className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Query
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Crop Distribution</h3>
              <Pie data={pieData} options={{ maintainAspectRatio: true }} />
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Environmental Trends
              </h3>
              <Line data={lineData} options={{ maintainAspectRatio: true }} />
            </div>
          </div>

          <SavedAnalytics onApplyQuery={applySavedFilters} />
        </div>
      )}
    </div>
  );
}