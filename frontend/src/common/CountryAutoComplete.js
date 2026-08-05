import React, { useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  InputAdornment,
  Box,
  Popper,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { FaGlobe } from 'react-icons/fa';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(enLocale);

// Popular tennis nations
const POPULAR = ["US", "ES", "FR", "IT", "DE", "GB", "RS", "AU", "AR", "CA", "IN"];

const countryList = countries.getNames("en", { select: "official" });
const alpha2ToAlpha3 = countries.getAlpha2Codes();

let allCountries = Object.keys(countryList).map((code) => ({
  code,
  label: countryList[code],
  alpha3: alpha2ToAlpha3[code]?.toUpperCase(),
}));

allCountries = allCountries.filter(c => c.alpha3);

const popular = allCountries.filter(c => POPULAR.includes(c.code));
const others = allCountries.filter(c => !POPULAR.includes(c.code));

const finalList = [
  { special: true, label: "POPULAR TENNIS NATIONS" },
  ...popular,
  { special: true, label: "ALL COUNTRIES" },
  ...others
];

// Preload CDN flags for faster rendering
const preloadFlags = (codes) => {
  codes.forEach(c => {
    const img = new Image();
    img.src = `https://flagcdn.com/${c.toLowerCase()}.svg`;
  });
};

// Full width dropdown
const MatchWidthPopper = (props) => (
  <Popper {...props} style={{
    width: props.anchorEl ? props.anchorEl.clientWidth : "auto",
    minWidth: props.anchorEl ? props.anchorEl.clientWidth : undefined,
    zIndex: 1600,
  }} />
);

// Dark dropdown container
const DarkPaper = (props) => (
  <Paper
    {...props}
    sx={{
      bgcolor: "#1f2937",
      color: "#e5e7eb",
      borderRadius: 1,
      border: "1px solid rgba(255,255,255,1)",
      boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
      overflowY: "auto",
    }}
  />
);

const FlagCDN = ({ code, size = 16 }) => (
  <img
    src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
    alt=""
    width={size}
    height={size}
    loading="lazy"
    style={{ objectFit: "cover", borderRadius: 3 }}
  />
);

const CountryAutocomplete = ({ selectedCountry, handleCountryChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const selected = finalList.find(
    c => !c.special && c.alpha3?.toLowerCase() === selectedCountry.toLowerCase()
  ) || null;

  useEffect(() => {
    preloadFlags(POPULAR);
  }, []);

  return (
    <Autocomplete
      size="small"
      options={finalList}
      disableClearable
      getOptionLabel={(opt) => opt.label || ""}
      value={selected?.special ? null : selected}
      isOptionEqualToValue={(opt, val) => opt.alpha3 === val.alpha3}
      onChange={(e, val) => {
        if (!val || val.special) return;
        handleCountryChange(val.alpha3, val);
      }}
      PopperComponent={MatchWidthPopper}
      PaperComponent={DarkPaper}
      sx={{
        width: isMobile ? 130 : 200,
        "& .MuiOutlinedInput-root": {
          bgcolor: "#1f2937",
          borderRadius: "8px",
          border: "1px solid rgba(34,211,238,0.25)",
          height: isMobile ? 34 : 38,
          paddingLeft: "4px",
          color: "#e5e7eb",   // <<< FIX TEXT COLOR
          "& .MuiSvgIcon-root": {
            color: "#e5e7eb", // <<< FIX ARROW ICON COLOR
          },
        },
        "& .MuiInputBase-input": {
          color: "#e5e7eb",     // <<< FIX INPUT TEXT COLOR
          fontSize: isMobile ? 12 : 14,
        }
      }}
      renderOption={(props, option) => {
        if (option.special) {
          return (
            <Box
              key={option.label}
              sx={{
                px: 1.2,
                py: isMobile ? 0.4 : 0.6,
                fontSize: isMobile ? 10 : 11,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                letterSpacing: "0.4px",
                textTransform: "uppercase",
                color: "#9ca3af",
                borderBottom: "1px solid #374151",
              }}
            >
              {option.label}
            </Box>
          );
        }

        return (
          <Box
            component="li"
            {...props}
            sx={{
              display: "flex",
              alignItems: "center",
              py: isMobile ? 0.45 : 0.6,
              px: 1,
              gap: isMobile ? "6px" : "8px",
              fontSize: isMobile ? 12 : 13,
              color: "#e5e7eb",
              "&:hover": { backgroundColor: "rgba(34,211,238,0.15)" }
            }}
          >
            <FlagCDN code={option.code} size={isMobile ? 14 : 16} />
            {option.label}
          </Box>

        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Country"
          InputProps={{
            ...params.InputProps,
            startAdornment: selected ? (
              <InputAdornment position="start">
                <FlagCDN code={selected.code} size={16} />
              </InputAdornment>
            ) : (
              <InputAdornment position="start">
                <FaGlobe size={14} color="#22d3ee" />
              </InputAdornment>
            )
          }}
        />
      )}
    />
  );
};

export default CountryAutocomplete;
