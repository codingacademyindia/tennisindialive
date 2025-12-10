import React from "react";
import { NoDrinks } from "@mui/icons-material";

export default function NotFound({
  msg = "Page not found",
  subMsg = "The page you're looking for doesn't exist.",
}) {
  return (
    <div className="w-full flex justify-center items-center py-5 px-4 bg-transparent">
      <div className="max-w-sm w-full bg-[#0f172a] border border-white/10 rounded-xl p-4 shadow-lg text-center">
        
        <div className="flex justify-center mb-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-md bg-white/5 border border-white/10">
            <NoDrinks className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <h2 className="text-sm font-semibold text-white">{msg}</h2>

        {subMsg && (
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            {subMsg}
          </p>
        )}
      </div>
    </div>
  );
}
