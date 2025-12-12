import React, { useState } from "react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

const POPULAR = ["US", "ES", "FR", "IT", "DE", "GB", "RS", "AU", "AR", "CA", "IN"];

// Alpha-2 → Alpha-3 mapping
const alpha2ToAlpha3 = countries.getAlpha2Codes();

const Flag = ({ code }) => (
  <img
    src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
    className="w-6 h-4 rounded-sm object-cover shadow"
    loading="lazy"
    alt=""
  />
);

// ALL icon
const AllIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

export default function CountryModal({ open, onClose, onSelect }) {
  const [search, setSearch] = useState("");

  if (!open) return null;

  const list = countries.getNames("en", { select: "official" });

  const allCountries = Object.keys(list).map((code) => ({
    code,
    label: list[code],
  }));

  const popular = allCountries.filter((c) => POPULAR.includes(c.code));
  const others = allCountries.filter((c) => !POPULAR.includes(c.code));

  const filteredOthers = others.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f1114] w-[92%] max-w-md rounded-xl border border-gray-700 shadow-2xl animate-scaleIn overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-gray-200 font-semibold text-lg">Select Country</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-400 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search country..."
            className="w-full bg-[#1f2937] text-gray-200 rounded-lg px-3 py-2 text-sm
                       border border-gray-700 placeholder-gray-400
                       focus:border-[#22d3ee] focus:ring-0 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Popular Countries */}
        <div className="px-4">
          <p className="text-xs text-gray-400 mb-1">POPULAR</p>

          <div className="grid grid-cols-3 gap-3">

            {/* ALL BUTTON INSIDE POPULAR */}
            <button
              onClick={() => {
                onSelect("all", {
                  code: "all",
                  alpha3: "all",
                  label: "All Countries",
                });
                onClose();
              }}
              className="flex items-center gap-2 
                         bg-[#1f2937] hover:bg-[#243041] 
                         text-gray-200 px-2 py-2 rounded-lg transition 
                         border border-gray-700"
            >
              <span className="text-lg">🌍</span>
              <span className="text-xs">ALL</span>
            </button>

            {/* Actual Popular Countries */}
            {popular.map((c) => {
              const alpha3 = alpha2ToAlpha3[c.code]?.toUpperCase() || "";
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    onSelect(alpha3, {
                      code: c.code,
                      alpha3,
                      label: c.label,
                    });
                    onClose();
                  }}
                  className="flex items-center gap-2 bg-[#1f2937] hover:bg-[#243041]
                             text-gray-200 px-2 py-2 rounded-lg transition border border-gray-700"
                >
                  <Flag code={c.code} />
                  <span className="text-xs truncate">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* All Countries */}
        <div className="px-4 mt-4 max-h-64 overflow-y-auto custom-scroll">
          <p className="text-xs text-gray-400 mb-1">ALL COUNTRIES</p>

          {filteredOthers.map((c) => {
            const alpha3 = alpha2ToAlpha3[c.code]?.toUpperCase() || "";

            return (
              <button
                key={c.code}
                onClick={() => {
                  onSelect(alpha3, {
                    code: c.code,
                    alpha3,
                    label: c.label,
                  });
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-md 
                           hover:bg-[#243041] transition"
              >
                <Flag code={c.code} />
                <span className="text-sm text-gray-200">{c.label}</span>
              </button>
            );
          })}

          {filteredOthers.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">
              No countries found
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
