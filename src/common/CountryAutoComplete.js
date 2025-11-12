import React from 'react';
import { Autocomplete, TextField, InputAdornment } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { FlagIcon } from 'react-flag-kit';
import { FaGlobe } from "react-icons/fa";

countries.registerLocale(enLocale);

function mapCountryName(alpha3, label) {
  if (alpha3.toLowerCase() === 'usa') return "usa";
  if (alpha3.toLowerCase() === 'rus') return "russia";
  return label.toLowerCase();
}

function mapCountryLabel(alpha3, label) {
  if (alpha3.toLowerCase() === 'usa') return "USA (America)";
  if (alpha3.toLowerCase() === 'rus') return "Russia";
  return label;
}

const countryList = countries.getNames('en', { select: 'official' });
const alpha2ToAlpha3 = countries.getAlpha2Codes();

// Define top tennis-playing countries
const topTennisCountries = [
  'ESP', 'USA', 'FRA', 'SRB', 'ITA', 'GER', 'AUS', 'ARG',
  'GBR', 'RUS', 'CRO', 'CAN', 'SUI', 'CZE', 'POL', 'JPN', 'IND'
];

const tennisAlpha3 = new Set([
  'AFG', 'ALB', 'DZA', 'AND', 'AGO', 'ATG', 'ARG', 'ARM', 'AUS', 'AUT', 'AZE',
  'BHS', 'BHR', 'BGD', 'BRB', 'BLR', 'BEL', 'BLZ', 'BEN', 'BTN', 'BOL', 'BIH', 'BWA',
  'BRA', 'BRN', 'BGR', 'BFA', 'BDI', 'CPV', 'KHM', 'CMR', 'CAN', 'CAF', 'TCD', 'CHL', 'CHN',
  'COL', 'COM', 'COG', 'COD', 'CRI', 'CIV', 'HRV', 'CUB', 'CYP', 'CZE', 'DNK', 'DJI', 'DMA',
  'DOM', 'ECU', 'EGY', 'SLV', 'GNQ', 'ERI', 'EST', 'SWZ', 'ETH', 'FJI', 'FIN', 'FRA', 'GAB',
  'GMB', 'GEO', 'DEU', 'GHA', 'GRC', 'GRD', 'GTM', 'GIN', 'GNB', 'GUY', 'HTI', 'HND', 'HKG',
  'HUN', 'ISL', 'IND', 'IDN', 'IRN', 'IRQ', 'IRL', 'ISR', 'ITA', 'JAM', 'JPN', 'JOR', 'KAZ',
  'KEN', 'KIR', 'KWT', 'KGZ', 'LAO', 'LVA', 'LBN', 'LSO', 'LBR', 'LBY', 'LIE', 'LTU', 'LUX',
  'MAC', 'MDG', 'MWI', 'MYS', 'MDV', 'MLI', 'MLT', 'MHL', 'MRT', 'MUS', 'MEX', 'FSM', 'MDA',
  'MCO', 'MNG', 'MNE', 'MAR', 'MOZ', 'MMR', 'NAM', 'NRU', 'NPL', 'NLD', 'NZL', 'NIC', 'NER',
  'NGA', 'PRK', 'MKD', 'NOR', 'OMN', 'PAK', 'PLW', 'PAN', 'PNG', 'PRY', 'PER', 'PHL', 'POL',
  'PRT', 'QAT', 'ROU', 'RUS', 'RWA', 'KNA', 'LCA', 'VCT', 'WSM', 'STP', 'SAU', 'SEN', 'SRB',
  'SYC', 'SLE', 'SGP', 'SVK', 'SVN', 'SLB', 'SOM', 'ZAF', 'KOR', 'SSD', 'ESP', 'LKA', 'SDN',
  'SUR', 'SWE', 'CHE', 'SYR', 'TJK', 'TZA', 'THA', 'TLS', 'TGO', 'TON', 'TTO', 'TUN', 'TUR',
  'TKM', 'TUV', 'UGA', 'UKR', 'ARE', 'GBR', 'USA', 'URY', 'UZB', 'VUT', 'VAT', 'VEN', 'VNM',
  'YEM', 'ZMB', 'ZWE', 'TWN', 'LBR', 'LBN'
]);

const countryArray = Object.keys(countryList)
  .map((alpha2) => {
    const alpha3 = alpha2ToAlpha3[alpha2];
    if (!alpha3 || !tennisAlpha3.has(alpha3.toUpperCase())) return null;
    const label = countryList[alpha2];
    const alpha3Upper = alpha3.toUpperCase();

    return {
      code: alpha2,
      label: mapCountryLabel(alpha3Upper, label),
      abbreviatedLabel: alpha2,
      name: mapCountryName(alpha3Upper, label),
      alpha3: alpha3Upper,
      group: topTennisCountries.includes(alpha3Upper)
        ? 'Popular Nations'
        : 'More Nations'
    };
  })
  .filter(Boolean)
  .sort((a, b) => {
    // Group first by category
    if (a.group !== b.group) {
      return a.group === 'Popular Nations' ? -1 : 1;
    }
    // Alphabetical within group
    return a.label.localeCompare(b.label);
  });

// Add "All Countries" at the very top
countryArray.unshift({
  code: '',
  label: 'All Countries',
  abbreviatedLabel: 'All',
  name: '',
  alpha3: 'All',
  group: 'All'
});

const CountryAutocomplete = ({ selectedCountry, handleCountryChange }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isVerySmallScreen = useMediaQuery('(max-width:415px)');

  const selectedCountryData = countryArray.find(
    (country) =>
      country.name.toLowerCase() === selectedCountry.toLowerCase() ||
      country.alpha3.toLowerCase() === selectedCountry.toLowerCase()
  );

  const fontSizeCSS =
    "w-full flex flex-row text-[0.65rem] sm:text-[0.65rem] md:text-[0.7rem] lg:text-[0.8rem] xl:text-[0.8rem] border-b-[1px] m-1 items-center text-left p-1 capitalize";

  return (
    <Autocomplete
      options={countryArray}
      groupBy={(option) => option.group}
      getOptionLabel={(option) => option.label}
      value={selectedCountryData || null}
      onChange={(event, newValue) => {
        handleCountryChange(newValue ? newValue.name : '', newValue);
      }}
      renderOption={(props, option) => (
        <button {...props} key={option.code} className={fontSizeCSS}>
          {option.name !== '' ? (
            <FlagIcon
              code={option.code}
              size={isVerySmallScreen ? 14 : isSmallScreen ? 16 : 20}
              style={{ marginRight: '8px' }}
            />
          ) : (
            <FaGlobe style={{ marginRight: '8px', color: 'blue' }} />
          )}
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
                {selectedCountryData.name !== '' ? (
                  <FlagIcon
                    code={selectedCountryData.code}
                    size={isVerySmallScreen ? 14 : isSmallScreen ? 16 : 20}
                  />
                ) : (
                  <FaGlobe style={{ color: 'blue' }} />
                )}
              </InputAdornment>
            ) : null,
          }}
        />
      )}
      renderGroup={(param) => (
        <li key={param.key}>
          {/* Custom Group Header */}
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#333',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            {param.group}
          </div>
          <ul style={{ padding: 0, margin: 0 }}>{param.children}</ul>
        </li>
      )}
      sx={{ width: isSmallScreen ? 150 : 200 }}
    />
  );
};

export default CountryAutocomplete;
