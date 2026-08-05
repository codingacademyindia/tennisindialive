import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import CountryIcon from '../Country3Icon';
import NumberWithIcon from '../NumberWithIcon';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#1f2937', // dark gray
    color: '#facc15', // yellowish
    fontSize: '0.8rem',
    padding: '4px 8px',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.75rem',
    padding: '4px 8px',
    color: '#e5e7eb', // light gray
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#111827', // slightly darker row
  },
  '&:nth-of-type(even)': {
    backgroundColor: '#1f2937', // lighter row
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function PaginatedTablesJSON({ data }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData =
    data.length > 100
      ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : data;

  return (
    <Paper sx={{ width: '100%', overflowX: 'auto', backgroundColor: '#111827', color: '#f9fafb' }}>
      <TableContainer>
        <Table aria-label="compact dark table" size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell>Ranking</StyledTableCell>
              <StyledTableCell align="left">Player</StyledTableCell>
              <StyledTableCell align="left">Country</StyledTableCell>
              <StyledTableCell align="left">Change</StyledTableCell>
              <StyledTableCell align="left">Points</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => (
              <StyledTableRow key={row.player}>
                <StyledTableCell component="th" scope="row">{row.rank}</StyledTableCell>
                <StyledTableCell>{row.player}</StyledTableCell>
                <StyledTableCell align="left">
                  <div className="flex items-center space-x-1">
                    <CountryIcon countryCode={row.country} size={14} />
                    <span>{row.country}</span>
                  </div>
                </StyledTableCell>
                <StyledTableCell align="left"><NumberWithIcon number={row.change} /></StyledTableCell>
                <StyledTableCell align="left">{row.points}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {data.length > 100 && (
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            color: '#f9fafb',
            backgroundColor: '#1f2937',
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { color: '#f9fafb' },
            '.MuiTablePagination-select': { color: '#f9fafb' },
            '.MuiSvgIcon-root': { color: '#f9fafb' },
          }}
        />
      )}
    </Paper>
  );
}
