import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiMenu } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import SocialMedia from "../common/SocialMedia";
import Logo from "../common/Logo";

const navItems = [
  { label: "Live Scores", url: "/live-scores" },
  {
    label: "ATP Ranking",
    dropdown: [
      { label: "Singles Live", url: "/rankings/live/atp-singles" },
      { label: "Doubles Live", url: "/rankings/live/atp-doubles" },
      { label: "Singles Official", url: "/rankings/official/atp-singles" },
      { label: "Doubles Official", url: "/rankings/official/atp-doubles" },
    ],
  },
  {
    label: "WTA Ranking",
    dropdown: [
      { label: "Singles Live", url: "/rankings/live/wta-singles" },
      { label: "Doubles Live", url: "/rankings/live/wta-doubles" },
      { label: "Singles Official", url: "/rankings/official/wta-singles" },
      { label: "Doubles Official", url: "/rankings/official/wta-doubles" },
    ],
  },
  {
    label: "Players",
    dropdown: [
      { label: "ATP", url: "/players/atp" },
      { label: "WTA", url: "/players/wta" },
    ],
  },
];

const DRAWER_Z = 99999999;

function ResponsiveNavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // OPEN ALL DROPDOWNS BY DEFAULT ON MOBILE
  const allDropdowns = navItems.filter((n) => n.dropdown).map((n) => n.label);
  const [dropdownActive, setDropdownActive] = useState(allDropdowns);

  const menuButtonRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // FORCE ALL MUI POPUP SURFACES BELOW DRAWER
  useEffect(() => {
    const id = "mui-zindex-fix";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      .MuiPopper-root,
      .MuiPopover-root,
      .MuiDialog-root,
      .MuiMenu-root,
      .MuiModal-root,
      .MuiPaper-root,
      .MuiTooltip-popper {
        z-index: ${DRAWER_Z - 100} !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // CLOSE DRAWER ON ESC
  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // RETURN FOCUS TO MENU BUTTON AFTER CLOSING
  useEffect(() => {
    if (!mobileOpen && menuButtonRef.current) {
      menuButtonRef.current.focus();
    }
  }, [mobileOpen]);

  const currentPath =
    typeof window !== "undefined"
      ? window.location.pathname.toLowerCase()
      : "";

  function isActive(urlOrLabel) {
    return currentPath.includes(urlOrLabel.toLowerCase().replace("/", ""));
  }

  // MOBILE DRAWER PORTAL
  function MobileDrawerPortal({ open, onClose }) {
    if (!mounted) return null;

    return createPortal(
      <>
        {/* BACKDROP */}
        <div
          style={{ zIndex: DRAWER_Z }}
          onClick={onClose}
          className={`fixed inset-0 bg-black/70 transition-opacity ${
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />

        {/* DRAWER PANEL */}
        <aside
          style={{ zIndex: DRAWER_Z + 1 }}
          className={`fixed top-0 left-0 w-full h-full bg-[#0f1114] text-gray-200 transform transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
            <a href="/live-scores" onClick={onClose}>
              <Logo />
            </a>

            <button
              aria-label="Close menu"
              onClick={onClose}
              className="text-gray-300 hover:text-red-400 p-2 rounded"
            >
              <AiOutlineClose className="h-6 w-6" />
            </button>
          </div>

          {/* NAVIGATION */}
          <nav className="p-4 space-y-3 overflow-auto h-[calc(100%-64px)]">
            {navItems.map((item) =>
              !item.dropdown ? (
                <a
                  key={item.label}
                  href={item.url}
                  onClick={onClose}
                  className="block px-4 py-2 rounded-md text-sm bg-gray-900/40 text-gray-200 hover:bg-gray-800/60"
                >
                  {item.label}
                </a>
              ) : (
                <div
                  key={item.label}
                  className="bg-[#0c0d10] rounded-md border border-gray-800/60 p-2"
                >
                  <div className="text-gray-300 font-semibold text-sm px-2 py-1">
                    {item.label}
                  </div>

                  {/* ALWAYS EXPANDED */}
                  <div className="mt-1 space-y-1">
                    {item.dropdown.map((sub) => (
                      <a
                        key={sub.label}
                        href={sub.url}
                        onClick={onClose}
                        className="block px-4 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-md"
                      >
                        {sub.label}
                      </a>
                    ))}
                  </div>
                </div>
              )
            )}

            <div className="pt-3 border-t border-gray-800">
              <div className="flex justify-center">
                <SocialMedia />
              </div>
            </div>
          </nav>
        </aside>
      </>,
      document.body
    );
  }

  return (
    <nav className="bg-[#0f0f11] backdrop-blur-xl shadow-md h-16 border-b border-gray-800/60 relative z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <a href="/live-scores" className="flex items-center">
          <Logo />
        </a>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-5 ml-6">
          {navItems.map((item) =>
            !item.dropdown ? (
              <a
                key={item.label}
                href={item.url}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all ${
                  isActive(item.url)
                    ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                {item.label}
              </a>
            ) : (
              <div key={item.label} className="relative group">
                <button
                  onMouseEnter={() => setDropdownActive([item.label])}
                  onMouseLeave={() => setDropdownActive([])}
                  className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    isActive(item.label)
                      ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-sm"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  {item.label}
                  <svg
                    className="ml-1 h-4 w-4 text-gray-400"
                    viewBox="0 0 24 24"
                  >
                    <path strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={`absolute left-0 mt-2 min-w-[170px] bg-[#17171a] border border-gray-800/60 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible`}
                >
                  {item.dropdown.map((sub) => (
                    <a
                      key={sub.label}
                      href={sub.url}
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-md"
                    >
                      {sub.label}
                    </a>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* DESKTOP SOCIAL ICONS */}
        <div className="hidden md:flex">
          <SocialMedia />
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          ref={menuButtonRef}
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 text-gray-200 hover:bg-gray-800/50 rounded"
        >
          <HiMenu className="h-7 w-7" />
        </button>
      </div>

      {mounted && (
        <MobileDrawerPortal
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      )}
    </nav>
  );
}

export default ResponsiveNavBar;
