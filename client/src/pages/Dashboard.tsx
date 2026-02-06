import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Sprout, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
import heroImage from "../assets/hero_crops.png";
import techImage from "../assets/tech_farming.png";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const location = useLocation();
  const isOverview = location.pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
      <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

        <main className="flex-1 p-6 lg:p-8 space-y-16">
          {isOverview ? (
            <>
              {/* Hero Section */}
              <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-3xl shadow-2xl p-8 lg:p-12">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="max-w-2xl text-white">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        AI-Powered Agriculture Platform
                      </div>
                      <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                        Smart Farming for a{" "}
                        <span className="text-emerald-100">Sustainable Future</span>
                      </h1>
                      <p className="text-emerald-50 text-lg mb-6 leading-relaxed">
                        Unlock the potential of your farm with intelligent crop
                        recommendations. Analyze soil health, weather patterns, and get
                        actionable insights in real time.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-100" />
                            <div>
                              <p className="text-2xl font-bold">98%</p>
                              <p className="text-xs text-emerald-100">Accuracy Rate</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Sprout className="w-5 h-5 text-emerald-100" />
                            <div>
                              <p className="text-2xl font-bold">30+</p>
                              <p className="text-xs text-emerald-100">Crop Types</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 rounded-2xl blur-2xl"></div>
                      <img
                        src={heroImage}
                        alt="Crop field"
                        className="relative w-full max-w-2xl h-[300px] object-cover rounded-2xl shadow-2xl border-4 border-white/30"
                      />
                    </div>
                  </motion.div>

                </div>
              </section>

              {/* Features Section */}
              <section>
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    <Leaf className="w-4 h-4" />
                    Platform Features
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Why Choose Our Platform?
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Advanced technology meets farming expertise to deliver unprecedented insights
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: <Leaf className="w-8 h-8" />,
                      title: "Smart Analysis",
                      desc: "Personalized crop recommendations based on soil and weather data using advanced ML algorithms.",
                      gradient: "from-emerald-500 to-green-600",
                      bgGradient: "from-emerald-50 to-green-50",
                    },
                    {
                      icon: <ShieldCheck className="w-8 h-8" />,
                      title: "Disease Prevention",
                      desc: "Early warning systems to protect your crops from threats and maximize plant health.",
                      gradient: "from-blue-500 to-cyan-600",
                      bgGradient: "from-blue-50 to-cyan-50",
                    },
                    {
                      icon: <Sprout className="w-8 h-8" />,
                      title: "Yield Optimization",
                      desc: "Maximize harvests with data-driven insights and real-time monitoring of environmental conditions.",
                      gradient: "from-green-500 to-teal-600",
                      bgGradient: "from-green-50 to-teal-50",
                    },
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      className={`bg-gradient-to-br ${feature.bgGradient} rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 border border-white/50`}
                      whileHover={{ y: -5, scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} text-white mb-4 shadow-lg`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{feature.desc}</p>
                      <div className="flex items-center text-emerald-600 text-sm font-semibold cursor-pointer hover:text-emerald-700 transition-colors">
                        <span>Learn more</span>
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Tech Section */}
              <section className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-200/50">
                <div className="flex flex-col lg:flex-row items-center gap-10">
                  <div className="lg:w-1/2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-green-200 rounded-2xl blur-2xl opacity-50"></div>
                      <img
                        src={techImage}
                        alt="Smart farming technology"
                        className="relative w-full rounded-2xl shadow-2xl border-4 border-white"
                      />
                    </div>
                  </div>
                  <div className="lg:w-1/2">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                      <Sparkles className="w-4 h-4" />
                      Advanced Technology
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Precision Agriculture at Your Fingertips
                    </h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Our platform leverages cutting-edge machine learning to process
                      complex environmental data, giving you actionable insights that
                      take the guesswork out of farming.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Real-time environmental monitoring",
                        "Historical data analysis & trends",
                        "Predictive modeling for crop success",
                        "AI-powered disease detection",
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-gray-700">
                          <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}