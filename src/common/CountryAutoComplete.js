import React from 'react';
import { Autocomplete, TextField, InputAdornment } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { FlagIcon } from 'react-flag-kit';

countries.registerLocale(enLocale);

const countryList = countries.getNames('en', { select: 'official' });
const alpha2ToAlpha3 = countries.getAlpha2Codes();
const countryArray = Object.keys(countryList).map((key) => {
  const label = countryList[key];
  const abbreviatedLabel = key; // Use ISO 3166-1 alpha-3 country code as the abbreviation
  return {
    code: key,
    label,
    abbreviatedLabel,  // Three-letter code
    name: label.toLowerCase(),
    alpha3: alpha2ToAlpha3[key]
  };
});

const CountryAutocomplete = ({ selectedCountry, handleCountryChange }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const selectedCountryData = countryArray.find(
    (country) => country.name.toLowerCase() === selectedCountry.toLowerCase()
  );

  return (
    <Autocomplete
      options={countryArray}
      getOptionLabel={(option) => option.label}  // Always use full name for searching
      value={selectedCountryData || null}
      onChange={(event, newValue) => {
        handleCountryChange(newValue ? newValue.name : '');
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.code} style={{ fontSize: isSmallScreen ? '12px' : '14px' }}>
          <FlagIcon code={option.code} size={isSmallScreen ? 12 : 16} style={{ marginRight: isSmallScreen ? '4px' : '8px' }} />
          {isSmallScreen ? option.alpha3 : option.label}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Country"
          variant="outlined"
          size="small"
          InputProps={{
            ...params.InputProps,
            style: { fontSize: isSmallScreen ? '12px' : '14px' },
            startAdornment: selectedCountryData ? (
              <InputAdornment position="start">
                <FlagIcon code={selectedCountryData.code} size={isSmallScreen ? 12 : 16} />
              </InputAdornment>
            ) : null,
          }}
        />
      )}
      sx={{ width: isSmallScreen ? 150 : 200 }}
    />
  );
};

export default CountryAutocomplete;
