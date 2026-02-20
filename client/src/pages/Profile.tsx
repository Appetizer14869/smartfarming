/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { User, Mail, Hash, ShieldCheck, CalendarDays, Crown, Edit3, X, Check } from "lucide-react";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editField, setEditField] = useState<"email" | "username" | null>(null);
  const [form, setForm] = useState({ email: "", username: "" });
  const [saving, setSaving] = useState(false);

  // Function to load profile data after update
  const loadProfile = async () => {
    setLoading(true);
    try {
      console.log("Fetching updated profile...");  // Debugging line
      const res = await api.get("/me");
      setUser(res.data.user);  // Update the user state with the fetched data
      setForm({
        email: res.data.user.email,
        username: res.data.user.username,
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();  // Fetch the profile when the component mounts
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("Form data before update:", form);  // Debugging line
      const res = await api.put("/me/update", form);
      if (res.data.success) {
        toast.success("Profile updated successfully");
        setIsModalOpen(false);
        setEditField(null);
        loadProfile(); 
         // Reload profile data after successful update
         localStorage.removeItem("token");  // Clear the old token
      window.location.href = "/login";
      } else {
        toast.error(res.data.error || "Update failed");
      }
    } catch {
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-lg">
        <p className="text-gray-500">No profile data available.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
              <User className="w-12 h-12" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Profile</h2>
            <p className="text-emerald-100">Manage your account information</p>
          </div>
        </div>
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User ID Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Hash className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">User ID</h3>
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-gray-600">Read-only</span>
            </div>
          </div>
          <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">
            {user.id}
          </p>
          <p className="text-xs text-gray-500 mt-3">This field cannot be modified</p>
        </div>

        {/* Email Card */}
        <div
          onClick={() => {
            setEditField("email");
            setIsModalOpen(true);
          }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-emerald-500 transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-3 rounded-xl group-hover:bg-emerald-200 transition-colors">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Email</h3>
            </div>
            <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <p className="text-gray-900 font-medium mb-1">{user.email}</p>
          <p className="text-xs text-emerald-600 font-medium">Click to edit</p>
        </div>

        {/* Username Card */}
        <div
          onClick={() => {
            setEditField("username");
            setIsModalOpen(true);
          }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-purple-500 transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-xl group-hover:bg-purple-200 transition-colors">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Username</h3>
            </div>
            <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <p className="text-gray-900 font-medium mb-1">{user.username}</p>
          <p className="text-xs text-purple-600 font-medium">Click to edit</p>
        </div>
      </div>

      {/* Account Information Card */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-3 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Account Information</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-gray-900">Account Type</span>
            </div>
            <p className="text-sm text-gray-600">{user.role === "admin" ? "Administrator" : "Standard User"}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold text-gray-900">Status</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-emerald-600 font-medium">Active</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <CalendarDays className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-900">Member Since</span>
            </div>
            <p className="text-sm text-gray-600">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editField && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
              <h3 className="text-2xl font-bold">
                Edit {editField === "email" ? "Email" : "Username"}
              </h3>
              <p className="text-emerald-100 text-sm mt-1">
                Update your {editField === "email" ? "email address" : "username"}
              </p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {editField === "email" ? "Email Address" : "Username"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {editField === "email" ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <User className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type={editField === "email" ? "email" : "text"}
                  name={editField}
                  value={(form as any)[editField]}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200
                           text-gray-900 placeholder-gray-400"
                  placeholder={editField === "email" ? "you@example.com" : "Your username"}
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditField(null);
                  setForm({
                    email: user.email,
                    username: user.username,
                  });
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                disabled={saving}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
