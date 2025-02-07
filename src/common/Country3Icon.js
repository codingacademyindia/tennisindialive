// CountryIcon.js
import React from 'react';
import { FlagIcon } from 'react-flag-kit';
import { Tooltip } from '@mui/material';
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json"; // Import country data
countries.registerLocale(en);


const Country3Icon = ({ countryCode, name, size = 64 }) => {

    const getAlpha2Code = (alpha3) => {
        return countries.alpha3ToAlpha2(alpha3) || "US"; // Default to "US" if not found
    };


    return (
        <div>
            <Tooltip title={name}>

                <FlagIcon code={getAlpha2Code(countryCode)} size={size} />
            </Tooltip>
        </div>

    );
};

export default Country3Icon;
