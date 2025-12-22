import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import CountryIcon from '../Country3Icon';
import NumberWithIcon from '../NumberWithIcon';

/* ============================
   Styled Components
============================ */

const StyledTableCell = styled(TableCell)(() => ({
  padding: '8px 12px',                 // 🔥 compact
  fontSize: 13,
  color: '#e5e7eb',
  borderBottom: '1px solid rgba(255,255,255,0.06)',

  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#020617',        // slate-950
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  backgroundColor: '#020617',
  transition: 'background 0.15s ease',

  '&:hover': {
    backgroundColor: '#0f172a',        // slate-900
  },

  '&:last-child td, &:last-child th': {
    borderBottom: 0,
  },
}));

/* ============================
   Component
============================ */

export default function CustomizedTablesJSON({ data = [] }) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: '#020617',
        border: '1px solid rgba(255,255,255,0.08)',
        overflowX: 'auto',
      }}
    >
      <Table
        aria-label="official rankings table"
        size="small"
        stickyHeader
      >
        <TableHead>
          <TableRow>
            <StyledTableCell sx={{ width: { xs: '12%', sm: '8%' } }}>
              #
            </StyledTableCell>

            <StyledTableCell sx={{ width: { xs: '45%', sm: '35%' } }}>
              Player
            </StyledTableCell>

            <StyledTableCell sx={{ width: { xs: '20%', sm: '18%' } }}>
              Country
            </StyledTableCell>

            <StyledTableCell sx={{ width: { xs: '10%', sm: '12%' } }}>
              Δ
            </StyledTableCell>

            <StyledTableCell sx={{ width: { xs: '13%', sm: '15%' } }}>
              Pts
            </StyledTableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((row, idx) => (
            <StyledTableRow key={`${row.player}-${idx}`}>
              {/* Rank */}
              <StyledTableCell>
                <span className="font-semibold text-slate-200">
                  {row.rank}
                </span>
              </StyledTableCell>

              {/* Player */}
              <StyledTableCell>
                <span className="block truncate font-medium text-slate-100">
                  {row.player}
                </span>
              </StyledTableCell>

              {/* Country */}
              <StyledTableCell>
                <div className="flex items-center gap-2">
                  <CountryIcon countryCode={row.country} size={14} />
                  <span className="text-xs uppercase text-slate-300">
                    {row.country}
                  </span>
                </div>
              </StyledTableCell>

              {/* Change */}
              <StyledTableCell>
                <NumberWithIcon number={row.change} />
              </StyledTableCell>

              {/* Points */}
              <StyledTableCell>
                <span className="font-semibold text-slate-200">
                  {row.points}
                </span>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
