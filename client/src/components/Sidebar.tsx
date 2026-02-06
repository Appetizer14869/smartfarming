import { useNavigate, useLocation } from "react-router-dom";
import { Home, User, Settings, BarChart3, LogOut, Leaf, Activity } from "lucide-react";
//logout
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

export default function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: Home },
    { label: "Profile", href: "/dashboard/profile", icon: User },
    { label: "Manual Recommendation", href: "/dashboard/recommend-manual", icon: Leaf },
    { label: "Live Recommendations", href: "/dashboard/recommend-live", icon: Activity },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Saved Analytics", href: "/dashboard/saved-analytics", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl z-40
          transform transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:sticky lg:top-16
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.href);
                    closeSidebar();
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-all duration-200 group text-left relative overflow-hidden
                    ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30"
                        : "text-gray-700 hover:bg-gray-100/80"
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                  )}
                  
                  <div className={`
                    p-2 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-white/20"
                        : "bg-gray-100 group-hover:bg-emerald-100"
                    }
                  `}>
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? "text-white"
                          : "text-gray-600 group-hover:text-emerald-600"
                      }`}
                    />
                  </div>
                  <span className={`font-medium text-sm ${
                    isActive ? "font-semibold" : ""
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
                  <div  className="p-4 border-t border-gray-200/50 bg-gray-50/50">
                   <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group mt-1"
                    >
                      <div className="p-1.5 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                        <LogOut className="w-4 h-4 text-red-700" />
                      </div>
                      <span className="text-sm font-medium text-red-700 group-hover:text-red-800">Sign Out</span>
                    </button>
                  </div>

          {/* Sign Out Button at Bottom
          <div className="p-4 border-t border-gray-200/50 bg-gray-50/50">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                bg-gradient-to-r from-red-200 to-red-300 text-white
                hover:from-Honeydew-60 hover:to-Honeydew-70
                transition-all duration-200 shadow-lg hover:shadow-xl
                transform hover:-translate-y-0.5
                font-medium group"
            >
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all duration-200">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-sm text-black">Sign Out</span>
            </button>
          </div> */}
        </div>
      </aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </>
  );
}