import React from 'react';
import { Autocomplete, TextField, InputAdornment } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { FlagIcon } from 'react-flag-kit';
import { FaGlobe } from "react-icons/fa";
countries.registerLocale(enLocale);

const excludedCountries = [
  'ATA' // Add other countries you want to exclude here
];

function mapCountryName(alpha3, label) {
  if (alpha3.toLowerCase() === 'usa') {
    return "usa"
  }
  else if (alpha3.toLowerCase() === 'rus') {
    return "russia"
  }
  else {
    return label.toLowerCase()
  }

}


function mapCountryLabel(alpha3, label) {
  if (alpha3.toLowerCase() === 'usa') {
    return "USA (America)"
  }
  else if (alpha3.toLowerCase() === 'rus') {
    return "Russia"
  }
  else {
    return label
  }

}

const countryList = countries.getNames('en', { select: 'official' });
const alpha2ToAlpha3 = countries.getAlpha2Codes();
const countryArray = Object.keys(countryList)
  .filter((key) => !excludedCountries.includes(alpha2ToAlpha3[key]))
  .map((key) => {
    let label = countryList[key];
    const alpha3 = alpha2ToAlpha3[key];
    return {
      code: key,
      label: mapCountryLabel(alpha3, label),
      abbreviatedLabel: key, // ISO 3166-1 alpha-2 country code
      name: mapCountryName(alpha3, label),
      alpha3,
    };
  });

countryArray.unshift({
  "code": "",
  "label": "All Countries",
  "abbreviatedLabel": "All",
  "name": "",
  "alpha3": "All"
})
console.log(countryArray)

const CountryAutocomplete = ({ selectedCountry, handleCountryChange }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isVerySmallScreen = useMediaQuery('(max-width:415px)');

  const selectedCountryData = countryArray.find(
    (country) => (country.name.toLowerCase() === selectedCountry.toLowerCase() || country.alpha3.toLowerCase() === selectedCountry.toLowerCase())
  );

  const fontSizeCSS = "w-full flex flex-row text-[0.65rem] sm:text-[0.65rem] md:text-[0.7rem] lg:text-[0.8rem] xl:text-[0.8rem] border-b-[1px] m-1 items-center text-left p-1 capitalize";

  return (
    <Autocomplete
      options={countryArray}
      getOptionLabel={(option) => option.label}  // Always use full name for searching
      value={selectedCountryData || null}
      onChange={(event, newValue) => {
        handleCountryChange(newValue ? newValue.name : '', newValue);
      }}
      renderOption={(props, option) => (
        <button {...props} key={option.code} className={fontSizeCSS}>
          {option.name !== '' ? <FlagIcon code={option.code} size={isVerySmallScreen ? 14 : isSmallScreen ? 16 : 20} style={{ marginRight: '8px' }} />
            : <FaGlobe style={{ marginRight: '8px', color: 'blue' }} />}
          {option.label}
        </button>
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
                {selectedCountryData.name !== '' ?
                  <FlagIcon code={selectedCountryData.code} size={isVerySmallScreen ? 14 : isSmallScreen ? 16 : 20} />
                  : <FaGlobe style={{ color: 'blue' }} />
                }
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
