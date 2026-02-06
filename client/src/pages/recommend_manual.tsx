/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { useNotification } from "../context/NotificationContext";
import { Leaf, TrendingUp, Droplet, ThermometerSun, Wind, Activity, Sparkles, Calendar } from "lucide-react";

interface Recommendation {
  _id?: string;
  recommended_crop: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  soil_data_source: string;
  weather_data_source: string;
  input_data: { N: number; P: number; K: number; ph: number };
  timestamp: string;
}

export default function RecommendManual() {
  const [form, setForm] = useState({
    N: "",
    P: "",
    K: "",
    ph: "",
    temperature: "",
    humidity: "",
    rainfall: "",
  });
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [history, setHistory] = useState<Recommendation[]>([]);
  const { addNotification } = useNotification();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitRecommendation = async () => {
    const { N, P, K, ph, temperature, humidity, rainfall } = form;
    if (!N || !P || !K || !ph || !temperature || !humidity || !rainfall) {
      toast.error("Please fill all input values");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/recommend/manual", {
        N: parseFloat(N),
        P: parseFloat(P),
        K: parseFloat(K),
        ph: parseFloat(ph),
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        rainfall: parseFloat(rainfall),
      });
      if (res.data.success) {
        setRecommendation(res.data.recommendation);
        toast.success("Manual crop recommendation generated");
        addNotification(`Crop recommended: ${res.data.recommendation.recommended_crop}`);
        loadHistory();
      } else {
        toast.error(res.data.error || "Failed to generate recommendation");
      }
    } catch {
      toast.error("Error connecting to manual recommendation service");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.get("/recommend/manual/history");
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch {
      toast.error("Failed to load manual recommendation history");
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const inputFields = [
    { name: "N", label: "Nitrogen (N)", icon: Activity, unit: "kg/ha", color: "blue" },
    { name: "P", label: "Phosphorus (P)", icon: TrendingUp, unit: "kg/ha", color: "purple" },
    { name: "K", label: "Potassium (K)", icon: Sparkles, unit: "kg/ha", color: "pink" },
    { name: "ph", label: "pH Level", icon: Droplet, unit: "pH", color: "cyan" },
    { name: "temperature", label: "Temperature", icon: ThermometerSun, unit: "°C", color: "orange" },
    { name: "humidity", label: "Humidity", icon: Wind, unit: "%", color: "teal" },
    { name: "rainfall", label: "Rainfall", icon: Droplet, unit: "mm", color: "indigo" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <Leaf className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">Manual Crop Recommendation</h2>
            <p className="text-emerald-100">Enter your soil and weather data manually</p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          Input Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inputFields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.name}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className={`h-5 w-5 text-${field.color}-500`} />
                  </div>
                  <input
                    type="number"
                    name={field.name}
                    value={(form as any)[field.name]}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                             focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200
                             text-gray-900 placeholder-gray-400"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-xs text-gray-400 font-medium">{field.unit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={submitRecommendation}
          disabled={loading}
          className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3.5 rounded-xl font-semibold 
                   hover:from-emerald-600 hover:to-green-700 focus:ring-4 focus:ring-emerald-200 
                   transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed 
                   shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Get Recommendation
            </>
          )}
        </button>
      </div>

      {/* Current Recommendation */}
      {recommendation && (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg p-6 border border-emerald-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-3 rounded-xl shadow-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-emerald-700 mb-1">Recommended Crop</h3>
                <p className="text-2xl font-bold text-gray-900">{recommendation.recommended_crop}</p>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm">
              <p className="text-xs font-medium text-gray-500">Just now</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ThermometerSun className="w-4 h-4 text-orange-500" />
                <p className="text-xs font-medium text-gray-600">Temperature</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{recommendation.temperature}°C</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-teal-500" />
                <p className="text-xs font-medium text-gray-600">Humidity</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{recommendation.humidity}%</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="w-4 h-4 text-blue-500" />
                <p className="text-xs font-medium text-gray-600">Rainfall</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{recommendation.rainfall}mm</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-200">
            <p className="text-xs text-gray-500">
              <span className="font-semibold">Data Source:</span> {recommendation.soil_data_source}, {recommendation.weather_data_source}
            </p>
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Manual Recommendation History
        </h3>
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No past recommendations found.</p>
            <p className="text-sm text-gray-400 mt-1">Your recommendation history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((rec) => (
              <div
                key={rec._id}
                className="bg-gradient-to-r from-gray-50 to-emerald-50/30 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-2 rounded-lg shadow-sm">
                      <Leaf className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">{rec.recommended_crop}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <ThermometerSun className="w-3 h-3" />
                          {rec.temperature}°C
                        </span>
                        <span className="flex items-center gap-1">
                          <Wind className="w-3 h-3" />
                          {rec.humidity}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Droplet className="w-3 h-3" />
                          {rec.rainfall}mm
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(rec.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}