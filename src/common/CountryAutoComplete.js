// CountryAutocomplete.js
import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { FlagIcon } from 'react-flag-kit';

countries.registerLocale(enLocale);

const countryList = countries.getNames('en', { select: 'official' });
const countryArray = Object.keys(countryList).map((key) => ({
  code: key,
  label: countryList[key],
  name: countryList[key].toLowerCase()
}));

const CountryAutocomplete = ({ selectedCountry, handleCountryChange }) => {
  return (
    <Autocomplete
      options={countryArray}
      getOptionLabel={(option) => option.label}
      value={countryArray.find((country) => country.name.toLowerCase() === selectedCountry.toLowerCase()) || null}
      onChange={(event, newValue) => {
        handleCountryChange(newValue ? newValue.name : '');
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.code}>
          <FlagIcon code={option.code} size={16} style={{ marginRight: '8px' }} />
          {option.label}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label="Country" variant="outlined" />}
      size="small"
      sx={{
        '& .MuiOutlinedInput-root': {
          color: 'white',
        },
        '& .MuiInputLabel-root': {
          color: 'white',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'white',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'white',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'white',
        },
        width:200
      }}
    />
  );
};

export default CountryAutocomplete;
