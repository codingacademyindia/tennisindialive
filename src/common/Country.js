// CountryIcon.js
import React from 'react';
import { FlagIcon } from 'react-flag-kit';
import { Tooltip } from '@mui/material';

const CountryIcon = ({ countryCode, name, size = 64 }) => {
    return (
        <div>
            {/* <Tooltip title={name}> */}

                <FlagIcon code={countryCode} size={size} />
            {/* </Tooltip> */}
        </div>

    );
};

export default CountryIcon;
