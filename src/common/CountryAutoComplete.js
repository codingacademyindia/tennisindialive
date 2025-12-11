import React from 'react';
import { Autocomplete, TextField, InputAdornment, Box, Popper, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FlagIcon } from 'react-flag-kit';
import { FaGlobe } from 'react-icons/fa';
import useMediaQuery from '@mui/material/useMediaQuery';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(enLocale);

// Setup country array
const countryList = countries.getNames('en', { select: 'official' });
const alpha2ToAlpha3 = countries.getAlpha2Codes();

const countryArray = Object.keys(countryList).map(alpha2 => {
  const alpha3 = alpha2ToAlpha3[alpha2]?.toUpperCase();
  if (!alpha3) return null;
  const label = countryList[alpha2];
  return {
    code: alpha2,
    label,
    alpha3,
    name: label,
    group: 'All Countries'
  };
}).filter(Boolean);

countryArray.unshift({ code: '', label: 'All Countries', alpha3: 'ALL', name: '', group: 'All' });

// Custom Popper for dropdown
const DarkPopper = props => <Popper {...props} style={{ zIndex: 1300 }} />;

// Custom Paper for dropdown
const DarkPaper = props => (
  <Paper
    {...props}
    sx={{
      bgcolor: '#1f2937',
      color: '#e5e7eb',
      borderRadius: 1,
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    }}
  />
);

const CountryAutocomplete = ({ selectedCountry, handleCountryChange }) => {
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
      PopperComponent={DarkPopper}
      PaperComponent={DarkPaper}
      sx={{
        width: isSmallScreen ? 150 : 220,
        "& .MuiOutlinedInput-root": {
          bgcolor: '#1f2937',
          color: '#e5e7eb',
          border: '1px solid #374151',
          '&:hover': {
            borderColor: '#22d3ee',
            boxShadow: '0 0 10px rgba(34,211,238,0.25)',
          },
          '&.Mui-focused': {
            borderColor: '#22d3ee',
            boxShadow: '0 0 12px rgba(34,211,238,0.35)',
          },
          "& input": {
            color: '#e5e7eb',
          },
        },
      }}
      renderInput={params => (
        <TextField
          {...params}
          placeholder="Select country..."
          InputProps={{
            ...params.InputProps,
            startAdornment: selected ? (
              <InputAdornment position="start">
                {selected.name ? (
                  <FlagIcon code={selected.code} size={16} />
                ) : <FaGlobe color="#22d3ee" />}
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
            fontSize: 13,
            px: 1,
            py: 0.8,
            cursor: 'pointer',
            "&:hover": { backgroundColor: 'rgba(34,211,238,0.1)' },
            color: '#e5e7eb'
          }}
        >
          {option.name ? (
            <FlagIcon code={option.code} size={16} style={{ marginRight: 8 }} />
          ) : <FaGlobe style={{ marginRight: 8, color: '#22d3ee' }} />}
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
              color: '#e5e7eb',
              bgcolor: '#1f2937',
              borderBottom: '1px solid #374151',
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
