import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CountryIcon from '../Country';
import NumberWithIcon from '../NumberWithIcon';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  // '&:nth-of-type(odd)': {
  //   backgroundColor: theme.palette.action.hover,
  // },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function CustomizedTables(props) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell sx={{ width: '10%' }}>Ranking</StyledTableCell>
            <StyledTableCell sx={{ width: '40%' }} align="left">Player</StyledTableCell>
            <StyledTableCell sx={{ width: '25%' }} align="left">Change</StyledTableCell>
            <StyledTableCell sx={{ width: '25%' }} align="left">Points</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((row) => (
            <StyledTableRow
              key={row.name}
              sx={(theme) => ({
                background: row.team.country.name === "India" ? "#CCC" : "inherit",
              })}
            >

              <StyledTableCell sx={{ width: '10%' }} component="th" scope="row">
                {row.ranking}
              </StyledTableCell>
              <StyledTableCell sx={{ width: '40%' }} align="left">
                <div className='flex flex-row items-center space-x-2'>
                  <CountryIcon countryCode={row.team.country.alpha2} size={15} />
                  <span>{row.rowName}</span>
                </div>
              </StyledTableCell>
              <StyledTableCell sx={{ width: '25%' }} align="left"><NumberWithIcon number={row.previousRanking - row.ranking}/></StyledTableCell>
              <StyledTableCell sx={{ width: '25%' }} align="left">{row.points}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
