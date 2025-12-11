import React, { useState } from "react";
import { HiMenu } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import RequestModal from "../contactus/RequestModal";
import ContactUs from "../contactus/ContactUs";
import SocialMedia from '../common/SocialMedia';
import Logo from '../common/Logo';

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

function ResponsiveNavBar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownActive, setDropdownActive] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const currentPath = window.location.pathname.toLowerCase();

    function isActive(urlOrLabel) {
        return currentPath.includes(urlOrLabel.toLowerCase().replace("/", ""));
    }

    return (
        <nav className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 shadow-lg relative z-50 h-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center">
                {/* Logo */}
                <a href="/live-scores" className="flex items-center rounded-xl" style={{ textDecoration: "none" }}>
                    <Logo />
                </a>

                {/* Desktop Menu */}
                <div className="hidden md:flex flex-1 justify-center items-center space-x-4 lg:space-x-7 ml-4">
                    {navItems.map(item =>
                        !item.dropdown ? (
                            <a
                                key={item.label}
                                href={item.url}
                                className={`px-4 py-2 rounded-xl font-semibold shadow-sm transition duration-150
                                    ${isActive(item.url)
                                        ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white"
                                        : "text-gray-200 hover:bg-gray-700/50 focus:bg-gray-600/50"
                                    } whitespace-nowrap`}
                            >
                                {item.label}
                            </a>
                        ) : (
                            <div key={item.label} className="relative group">
                                <button
                                    className={`flex items-center px-4 py-2 rounded-xl font-semibold shadow-sm transition duration-150
                                        ${isActive(item.label)
                                            ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white"
                                            : "text-gray-200 hover:bg-gray-700/50 focus:bg-gray-600/50"
                                        } whitespace-nowrap`}
                                    onMouseEnter={() => setDropdownActive(item.label)}
                                    onMouseLeave={() => setDropdownActive("")}
                                >
                                    {item.label}
                                    <svg
                                        className="ml-2 h-4 w-4 text-gray-300"
                                        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                                    >
                                        <path d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div
                                    className={`absolute left-0 mt-2 min-w-[180px] bg-gray-800 text-gray-200 rounded-xl shadow-xl border border-gray-700 transition-all duration-150
                                        ${dropdownActive === item.label ? "opacity-100 visible" : "opacity-0 invisible"} group-hover:opacity-100 group-hover:visible`}
                                    onMouseEnter={() => setDropdownActive(item.label)}
                                    onMouseLeave={() => setDropdownActive("")}
                                >
                                    {item.dropdown.map(sub => (
                                        <a
                                            key={sub.label}
                                            href={sub.url}
                                            className="block px-5 py-2 hover:bg-gray-700 rounded transition font-medium whitespace-nowrap"
                                        >
                                            {sub.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* Social icons */}
                <SocialMedia handleOpen={() => setModalOpen(true)} />

                {/* Mobile Hamburger */}
                <div className="md:hidden flex items-center ml-auto">
                    <button
                        className="text-gray-200 p-2 rounded hover:bg-gray-700/50 focus:outline-none"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open Menu"
                    >
                        <HiMenu className="h-7 w-7" />
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 z-50 transition-all md:hidden ${mobileOpen ? "" : "pointer-events-none"}`}>
                <div
                    className={`fixed inset-0 bg-black/70 transition-opacity duration-200 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
                    onClick={() => setMobileOpen(false)}
                />
                <aside
                    className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-gray-200 shadow-xl transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
                >
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
                        <a href="/live-scores" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
                            <Logo />
                        </a>
                        <button
                            className="text-gray-200 hover:text-red-400 p-2"
                            onClick={() => setMobileOpen(false)}
                            aria-label="Close Menu"
                        >
                            <AiOutlineClose className="h-6 w-6" />
                        </button>
                    </div>

                    <nav className="p-3">
                        {navItems.map(item =>
                            !item.dropdown ? (
                                <a
                                    key={item.label}
                                    href={item.url}
                                    className={`block px-4 py-2 rounded font-semibold mb-1 transition
                                        ${isActive(item.url) ? "bg-purple-700 text-white" : "hover:bg-gray-700/50"}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <div key={item.label} className="mb-2">
                                    <div className="px-4 py-2 rounded font-bold text-gray-200 bg-gray-800 mt-2">{item.label}</div>
                                    <div className="ml-2">
                                        {item.dropdown.map(sub => (
                                            <a
                                                key={sub.label}
                                                href={sub.url}
                                                className="block px-4 py-2 text-gray-300 text-sm rounded hover:bg-gray-700/50"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                {sub.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                    </nav>

                    <div className="flex items-center justify-center mt-7 gap-6">
                        <SocialMedia handleOpen={() => setModalOpen(true)} />
                    </div>
                </aside>
            </div>
        </nav>
    );
}

export default ResponsiveNavBar;
