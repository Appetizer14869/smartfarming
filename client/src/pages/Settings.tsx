import { useState } from "react";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { Settings as SettingsIcon, AlertTriangle, Trash2, FileX, Shield, Info } from "lucide-react";

export default function Settings() {
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const clearSavedQueries = async () => {
    try {
      const res = await api.delete("/analytics/saved/all");
      if (res.data.success) {
        toast.success("All saved queries cleared");
      } else {
        toast.error(res.data.message || "Failed to clear queries");
      }
    } catch {
      toast.error("Error clearing queries");
    } finally {
      setShowClearModal(false);
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await api.delete("/user/account");
      if (res.data.success) {
        toast.success("Account deleted");
        window.location.href = "/login";
      } else {
        toast.error(res.data.message || "Failed to delete account");
      }
    } catch {
      toast.error("Error deleting account");
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <SettingsIcon className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">Settings</h2>
            <p className="text-gray-300">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      {/* Privacy Policy */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Data Usage & Privacy
            </h3>
            <div className="prose prose-sm max-w-none text-gray-600 space-y-3">
              <p>
                By using AgriPredict, you agree to our data usage and privacy policies.
                Your saved queries, crop recommendations, and account information are
                stored securely and used only to improve your experience within the
                platform.
              </p>
              <p>
                We are committed to protecting your privacy and ensuring the security of
                your data. All information is encrypted and stored in compliance with
                industry standards.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">Important Notice</p>
                    <p className="text-sm text-blue-700">
                      Clearing saved queries or deleting your account are permanent
                      actions and cannot be undone. Please review our privacy statement
                      for more details on how your data is handled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white">Danger Zone</h3>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>
                These actions are <strong>permanent and irreversible</strong>. Please
                proceed with caution and ensure you understand the consequences before
                continuing.
              </span>
            </p>
          </div>

          {/* Clear Queries */}
          <div className="border border-gray-200 rounded-xl p-5 hover:border-yellow-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <FileX className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Clear All Saved Queries
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Permanently delete all your saved analytics queries. This will remove
                    all filters and results you've saved.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1 ml-4 list-disc">
                    <li>All saved analytics queries will be deleted</li>
                    <li>Filters and results cannot be recovered</li>
                    <li>Your raw data remains unaffected</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowClearModal(true)}
                className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 flex-shrink-0"
              >
                <FileX className="w-4 h-4" />
                Clear Queries
              </button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="border border-red-200 rounded-xl p-5 hover:border-red-400 transition-colors bg-red-50/50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-red-100 p-3 rounded-xl">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Delete Account Permanently
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Permanently delete your account and all associated data. This action
                    cannot be undone.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1 ml-4 list-disc">
                    <li>Your account will be immediately deactivated</li>
                    <li>All data, including history and saved queries, will be deleted</li>
                    <li>You will be logged out and redirected to login</li>
                    <li>This action is permanent and irreversible</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Queries Modal */}
      {showClearModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <FileX className="w-8 h-8" />
                <div>
                  <h3 className="text-2xl font-bold">Clear All Queries</h3>
                  <p className="text-yellow-100 text-sm mt-1">Confirm deletion</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to clear all saved analytics queries? This action
                will permanently delete all your saved filters and results.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>This action cannot be undone.</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={clearSavedQueries}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <Trash2 className="w-8 h-8" />
                <div>
                  <h3 className="text-2xl font-bold">Delete Account</h3>
                  <p className="text-red-100 text-sm mt-1">This cannot be undone</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you absolutely sure you want to delete your account? This will
                permanently erase all your data, including:
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Profile information",
                  "Recommendation history",
                  "Saved analytics queries",
                  "All personal settings",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Warning:</strong> This action is permanent and cannot be
                    reversed. You will lose all your data forever.
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}