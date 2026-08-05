import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { Dashboard } from "@mui/icons-material";
import SocialMedia from "../common/SocialMedia";
/**
 * Navbar.jsx
 *
 * A compact, responsive dashboard-themed navbar with:
 * - left: small logo + main title ("Match Dashboard")
 * - center (desktop): links for Live Scores and Rankings (Rankings has a small dropdown)
 * - right: optional actions area (placeholder; can add search / profile later)
 *
 * Usage:
 * <Navbar />
 *
 * Notes:
 * - Uses Tailwind CSS utility classes (dark dashboard theme).
 * - Uses NavLink from react-router-dom so active links receive styling.
 * - Accessible mobile drawer and keyboard-friendly buttons.
 */

function MiniLogo({ className = "w-8 h-8" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="6" fill="#0f172a" />
      <path d="M9 20C12 15 20 12 23 9" stroke="#06b6d4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10.5" cy="10.5" r="2.2" fill="#7c3aed"/>
    </svg>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rankDropdownOpen, setRankDropdownOpen] = useState(false);

  const linkBase =
    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 flex items-center gap-2";

  const activeClass = "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg";
  const inactiveClass = "text-gray-200 hover:bg-gray-800/60";

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-md z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3 min-w-0">
          
            <div className="min-w-0 text-2xl font-semibold text-white">
              <Dashboard className="inline-block mr-2 -mt-1 text-teal-400 text-2xl" />
                Match Dashboard
             
            </div>
          </div>

      

          {/* Right: actions & mobile toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <a href="/live-scores" target="_blank" className="text-xs text-gray-300 px-2 py-1 rounded-md hover:bg-gray-800/60">Live Scores</a>
              <a href="/tournament" target="_blank" className="text-xs text-gray-300 px-2 py-1 rounded-md hover:bg-gray-800/60">Tournament Hub</a>
              <a href="/rankings/atp" target="_blank" className="text-xs text-gray-300 px-2 py-1 rounded-md hover:bg-gray-800/60">ATP Rankings Dashboard</a>
              <a href="/rankings/wta" target="_blank" className="text-xs text-gray-300 px-2 py-1 rounded-md hover:bg-gray-800/60">WTA Rankings Dashboard</a>
        
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                className="text-gray-200 p-2 rounded-md hover:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Open menu"
              >
                <HiMenu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-50 md:hidden ${mobileOpen ? "" : "pointer-events-none"}`}>
        {/* backdrop */}
        <div
          className={`fixed inset-0 bg-black/60 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        <aside
          className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl transform transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="rounded-md p-0.5 bg-gradient-to-br from-indigo-700 via-purple-600 to-teal-600">
                <div className="bg-gray-900 rounded-sm p-1">
                  <MiniLogo />
                </div>
              </div>
              <div>
                <div className="text-white font-semibold">Match Dashboard</div>
                <div className="text-xs text-gray-400">Live & Rankings</div>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="text-gray-300 p-2 rounded-md hover:bg-gray-800/60"
              aria-label="Close menu"
            >
              <AiOutlineClose className="h-6 w-6" />
            </button>
          </div>

          <nav className="p-4 space-y-2 overflow-y-auto">
            <NavLink
              to="/live-scores"
              className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? "bg-indigo-700 text-white" : "text-gray-200 hover:bg-gray-800/60"}`}
              onClick={() => setMobileOpen(false)}
            >
              Live Scores
            </NavLink>

            <NavLink
              to="/tournament"
              className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? "bg-indigo-700 text-white" : "text-gray-200 hover:bg-gray-800/60"}`}
              onClick={() => setMobileOpen(false)}
            >
              Tournament Hub
            </NavLink>

            <div>
              <div className="px-3 py-2 rounded-md text-gray-200 font-semibold bg-gray-800/40">Rankings</div>
              <div className="ml-2 mt-1 space-y-1">
                <NavLink
                  to="/rankings/atp"
                  className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? "bg-indigo-700 text-white" : "text-gray-200 hover:bg-gray-800/60"}`}
                  onClick={() => setMobileOpen(false)}
                >
                  ATP Ranking Dashboard
                </NavLink>
                <NavLink
                  to="/rankings/wta"
                  className={({ isActive }) => `block px-3 py-2 rounded-md ${isActive ? "bg-indigo-700 text-white" : "text-gray-200 hover:bg-gray-800/60"}`}
                  onClick={() => setMobileOpen(false)}
                >
                  WTA Ranking Dashboard
                </NavLink>
             
              </div>
            </div>

         
            <div className="pt-4 border-t border-gray-800">
              <SocialMedia/>
            </div>
          </nav>
        </aside>
      </div>
    </header>
  );
}