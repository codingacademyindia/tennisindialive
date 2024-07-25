// CountryDropdown.js
import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(enLocale);

const countryList = countries.getNames('en', { select: 'official' });

const CountryDropdown = ({ selectedCountry, handleCountryChange }) => {
  return (
    <FormControl variant="outlined" size="small">
      <InputLabel id="country-label">Country</InputLabel>
      <Select
        labelId="country-label"
        id="country-select"
        value={selectedCountry}
        onChange={handleCountryChange}
        label="Country"
        sx={{width:200}}
      >
        {Object.entries(countryList).map(([code, name]) => (
          <MenuItem sx={{width:200}} key={code} value={name.toLowerCase()}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CountryDropdown;
