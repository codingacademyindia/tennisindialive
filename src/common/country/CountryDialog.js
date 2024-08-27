import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { FlagIcon } from 'react-flag-kit';

// Sample mapping (you can get a complete list from ISO standards or an API)
const alpha2ToAlpha3 = {
  US: 'USA', // United States
  GB: 'GBR', // United Kingdom
  DE: 'DEU', // Germany
  FR: 'FRA', // France
  // Add more mappings as needed
};

const CountryDialog = ({ open, onClose }) => {
  const [countryData, setCountryData] = useState([]);

  useEffect(() => {
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

    setCountryData(countryArray);
  }, []);

  console.log(countryData)
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        Country Details
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Flag</TableCell>
                <TableCell>Country Name</TableCell>
                <TableCell>Abbreviation</TableCell>

              </TableRow>
            </TableHead>
            <TableBody>
              {countryData.map(item => (
                <TableRow key={item.code}>
                  <TableCell><FlagIcon code={item.code}/></TableCell>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>{item.alpha3}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default CountryDialog;
