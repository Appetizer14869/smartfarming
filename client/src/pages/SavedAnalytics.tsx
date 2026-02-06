/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { useAnalytics } from "../context/AnalyticsContext";
import { useNavigate } from "react-router-dom";
import { Save, Trash2, Eye, ArrowRight, Calendar, Filter } from "lucide-react";

interface SavedQuery {
  _id: string;
  filters: {
    crop?: string;
    city?: string;
    country?: string;
    startDate?: string;
    endDate?: string;
  };
  results: any[];
  timestamp: string;
}

interface SavedAnalyticsProps {
  onApplyQuery: (filters: SavedQuery["filters"]) => void;
}

export default function SavedAnalytics({ onApplyQuery }: SavedAnalyticsProps) {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<SavedQuery | null>(null);
  const { setFilters } = useAnalytics();
  const navigate = useNavigate();

  const loadSavedQueries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/analytics/saved");
      if (res.data.success) {
        setSavedQueries(res.data.queries);
      }
    } catch {
      toast.error("Failed to load saved analytics queries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedQueries();
  }, []);

  const reApplyQuery = (filters: SavedQuery["filters"]) => {
    setFilters(filters);
    onApplyQuery(filters);
    toast.success("Saved query applied");
  };

  const confirmDelete = async () => {
    if (!selectedQuery) return;
    try {
      const res = await api.delete(`/analytics/saved/${selectedQuery._id}`);
      if (res.data.success) {
        toast.success("Query deleted");
        setSavedQueries(savedQueries.filter((q) => q._id !== selectedQuery._id));
      } else {
        toast.error(res.data.message || "Failed to delete query");
      }
    } catch {
      toast.error("Error deleting query");
    } finally {
      setShowModal(false);
      setSelectedQuery(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Save className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Saved Analytics Queries</h2>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading saved queries...</p>
        </div>
      ) : savedQueries.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Save className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No saved queries yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Save your filtered analytics to access them later
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Date Saved
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Filters Applied
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Results
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {savedQueries.map((query) => (
                <tr
                  key={query._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(query.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(query.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {Object.entries(query.filters)
                      .filter(([_, v]) => v)
                      .map(([k, v]) => (
                        <span
                          key={k}
                          className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium mr-2 mb-1"
                        >
                          <Filter className="w-3 h-3" />
                          {k}: {v}
                        </span>
                      ))}
                    {Object.entries(query.filters).filter(([_, v]) => v).length === 0 && (
                      <span className="text-gray-400 italic">No filters</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className="inline-flex items-center bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {query.results.length} records
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => reApplyQuery(query.filters)}
                        className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
                      >
                        <ArrowRight className="w-3 h-3" />
                        Apply
                      </button>
                      <button
                        onClick={() => {
                          setSelectedQuery(query);
                          setShowModal(true);
                        }}
                        className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View/Delete Modal */}
      {showModal && selectedQuery && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-6 text-white">
              <h3 className="text-2xl font-bold">Query Details</h3>
              <p className="text-blue-100 text-sm mt-1">
                Review and manage your saved analytics query
              </p>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Applied Filters
                </h4>
                <div className="space-y-2">
                  {Object.entries(selectedQuery.filters)
                    .filter(([_, v]) => v)
                    .map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 capitalize">{k}:</span>
                        <span className="font-medium text-gray-900">{v}</span>
                      </div>
                    ))}
                  {Object.entries(selectedQuery.filters).filter(([_, v]) => v).length ===
                    0 && (
                    <p className="text-sm text-gray-400 italic">No filters applied</p>
                  )}
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  Results Preview
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Total Records: {selectedQuery.results.length}
                </p>
                <div className="space-y-2">
                  {selectedQuery.results.slice(0, 3).map((r, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg p-2 text-xs text-gray-700"
                    >
                      <span className="font-medium">{r.recommended_crop}</span>
                      <span className="text-gray-400 ml-2">
                        ({new Date(r.timestamp).toLocaleDateString()})
                      </span>
                    </div>
                  ))}
                  {selectedQuery.results.length > 3 && (
                    <p className="text-xs text-gray-500 italic">
                      +{selectedQuery.results.length - 3} more records...
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>Warning:</strong> Deleting this query is permanent and cannot
                  be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedQuery(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Query
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}