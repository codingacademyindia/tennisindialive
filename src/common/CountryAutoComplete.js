import React from 'react';
import { Autocomplete, TextField, InputAdornment, Box } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { FlagIcon } from 'react-flag-kit';
import { FaGlobe } from "react-icons/fa";

countries.registerLocale(enLocale);

// Map country names for display
function mapCountryName(alpha3, label) {
  if (alpha3 === 'USA') return 'USA';
  if (alpha3 === 'RUS') return 'RUSSIA';
  return label.toUpperCase();
}

function mapCountryLabel(alpha3, label) {
  if (alpha3 === 'USA') return "USA (America)";
  if (alpha3 === 'RUS') return "Russia";
  return label;
}

// Country data setup
const countryList = countries.getNames('en', { select: 'official' });
const alpha2ToAlpha3 = countries.getAlpha2Codes();

const topTennisCountries = [
  'ESP', 'USA', 'FRA', 'SRB', 'ITA', 'GER', 'AUS', 'ARG',
  'GBR', 'RUS', 'CRO', 'CAN', 'SUI', 'CZE', 'POL', 'JPN', 'IND'
];

const tennisAlpha3 = new Set([...Object.values(alpha2ToAlpha3).map(v => v.toUpperCase())]);

const countryArray = Object.keys(countryList)
  .map(alpha2 => {
    const alpha3 = alpha2ToAlpha3[alpha2]?.toUpperCase();
    if (!alpha3 || !tennisAlpha3.has(alpha3)) return null;
    const label = countryList[alpha2];
    const name = mapCountryName(alpha3, label);
    return {
      code: alpha2,
      label: mapCountryLabel(alpha3, label),
      name,
      alpha3,
      group: topTennisCountries.includes(alpha3) ? 'Popular Nations' : 'More Nations'
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.group === b.group ? a.label.localeCompare(b.label) : a.group === 'Popular Nations' ? -1 : 1);

// Add "All Countries" at the top
countryArray.unshift({
  code: '',
  label: 'All Countries',
  alpha3: 'ALL',
  name: '',
  group: 'All'
});

const CountryAutocomplete = ({ selectedCountry, handleCountryChange }) => {
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isVerySmallScreen = useMediaQuery('(max-width:415px)');

  const selected = countryArray.find(
    c => c.alpha3.toLowerCase() === selectedCountry.toLowerCase()
  ) || null;

  return (
    <Autocomplete
      size="small"
      options={countryArray}
      groupBy={opt => opt.group}
      getOptionLabel={opt => opt.label}
      value={selected}
      isOptionEqualToValue={(opt, val) => opt.alpha3 === val.alpha3}
      onChange={(e, val) => handleCountryChange(val?.alpha3 ?? '', val)}
      sx={{
        width: isSmallScreen ? 150 : 220,
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          backgroundColor: darkMode ? theme.palette.grey[900] : theme.palette.common.white
        },
        "& .MuiAutocomplete-paper": {
          borderRadius: 2,
          boxShadow: theme.shadows[4],
          bgcolor: darkMode ? theme.palette.grey[900] : theme.palette.background.paper
        }
      }}
      renderInput={params => (
        <TextField
          {...params}
          label=""
          placeholder="Select country..."
          InputProps={{
            ...params.InputProps,
            startAdornment: selected ? (
              <InputAdornment position="start">
                {selected.name ? (
                  <FlagIcon
                    code={selected.code}
                    size={isVerySmallScreen ? 14 : isSmallScreen ? 16 : 20}
                  />
                ) : <FaGlobe color={theme.palette.primary.main} />}
              </InputAdornment>
            ) : null
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{
            display: 'flex',
            alignItems: 'center',
            fontSize: isVerySmallScreen ? 11 : isSmallScreen ? 12 : 13,
            px: 1,
            py: 0.8,
            cursor: 'pointer',
            "&:hover": {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          {option.name ? (
            <FlagIcon
              code={option.code}
              size={isVerySmallScreen ? 14 : isSmallScreen ? 16 : 20}
              style={{ marginRight: 8 }}
            />
          ) : <FaGlobe style={{ marginRight: 8 }} />}
          {option.label}
        </Box>
      )}
      renderGroup={params => (
        <li key={params.key}>
          <Box
            sx={{
              px: 1.5,
              py: 0.8,
              fontWeight: 600,
              fontSize: 11,
              color: theme.palette.text.primary,
              bgcolor: darkMode ? theme.palette.grey[800] : theme.palette.grey[200],
              borderBottom: `1px solid ${darkMode ? theme.palette.grey[700] : theme.palette.grey[300]}`,
              textTransform: 'uppercase',
            }}
          >
            {params.group}
          </Box>
          <ul style={{ padding: 0, margin: 0 }}>{params.children}</ul>
        </li>
      )}
    />
  );
};

export default CountryAutocomplete;
