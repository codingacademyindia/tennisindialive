import React from 'react';
import { Autocomplete, TextField, InputAdornment } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { FlagIcon } from 'react-flag-kit';

countries.registerLocale(enLocale);
const excludedCountries = [
  'ATA' // Add other countries you want to exclude here
];

const countryList = countries.getNames('en', { select: 'official' });
const alpha2ToAlpha3 = countries.getAlpha2Codes();
const countryArray = Object.keys(countryList)
  .filter((key) => !excludedCountries.includes(alpha2ToAlpha3[key]))
  .map((key) => {
    const label = countryList[key];
    const alpha3 = alpha2ToAlpha3[key];

    return {
      code: key,
      label,
      abbreviatedLabel: key, // ISO 3166-1 alpha-2 country code
      name: label.toLowerCase(),
      alpha3,
    };
  });

const CountryAutocomplete = ({ selectedCountry, handleCountryChange }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const selectedCountryData = countryArray.find(
    (country) => (country.name.toLowerCase() === selectedCountry.toLowerCase() || country.alpha3.toLowerCase() === selectedCountry.toLowerCase())
  );

  let fontSizeCSS = "w-full flex flex-row text-[0.65rem] sm:text-[0.65rem] md:text-[0.7rem] lg:text-[0.8rem] xl:text-[0.8rem] border-b-[1px] m-1 items-center"


  return (
    <Autocomplete
      options={countryArray}
      getOptionLabel={(option) => option.label}  // Always use full name for searching
      value={selectedCountryData || null}
      onChange={(event, newValue) => {
        handleCountryChange(newValue ? newValue.name : '');
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.code} className={fontSizeCSS}>
          <span><FlagIcon code={option.code} size={isSmallScreen ? 12 : 16} style={{ marginRight: isSmallScreen ? '4px' : '8px' }} /></span>
          {false ? option.alpha3 : option.label}
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
