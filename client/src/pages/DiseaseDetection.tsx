import { motion } from "framer-motion";
import { Leaf, AlertCircle } from "lucide-react";

export default function DiseaseDetection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
      <div className="flex justify-center items-center h-full p-6 lg:p-12">
        <motion.div
          className="max-w-lg text-center bg-white rounded-xl shadow-lg p-8 border border-gray-100"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center items-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Disease Detection Feature
          </h2>
          <p className="text-gray-600 mb-4">
            This feature is currently under development and will be available soon. Stay tuned for updates!
          </p>
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2 px-4 rounded-xl">
            <Leaf className="w-5 h-5 inline-block mr-2" />
            Coming Soon
          </div>
        </motion.div>
      </div>
    </div>
  );
}