import { useState, useRef, useEffect } from "react";
import {
  Leaf,
  Menu,
  X,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Bell,
  BellDot,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

interface NavbarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Navbar({ isSidebarOpen, toggleSidebar }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { notifications, clearNotifications } = useNotification();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleNotif = () => setIsNotifOpen(!isNotifOpen);

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo + Hamburger */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>

            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                  AgriPredict
                </h1>
                <p className="text-[10px] text-gray-500 font-medium">Smart Farming AI</p>
              </div>
            </Link>
          </div>

          {/* Right side - Notifications + User */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={toggleNotif}
                className="relative p-2.5 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group"
                aria-label="Notifications"
              >
                {notifications.length > 0 ? (
                  <BellDot className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                )}
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 shadow-lg animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-green-50">
                    <span className="font-semibold text-gray-800 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      Notifications
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">No new notifications</p>
                    </div>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto">
                      {notifications.map((note, idx) => (
                        <li
                          key={idx}
                          className="px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50/50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0"></div>
                            <p className="flex-1">{note}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group"
                aria-label="User menu"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-full shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
                <span className="hidden sm:block text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                  {user?.username ?? "User"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
                    <p className="text-xs font-medium text-gray-500 mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user?.email ?? "N/A"}
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors group"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="p-1.5 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                        <User className="w-4 h-4 text-emerald-700" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Profile</span>
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                        <Settings className="w-4 h-4 text-gray-700" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Settings</span>
                    </Link>
                    <button
                      onClick={signOut}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group mt-1"
                    >
                      <div className="p-1.5 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                        <LogOut className="w-4 h-4 text-red-700" />
                      </div>
                      <span className="text-sm font-medium text-red-700 group-hover:text-red-800">Sign Out</span>
                    </button>
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100 bg-emerald-50/50 flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-emerald-700">
                      Active Session
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}