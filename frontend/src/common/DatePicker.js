import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import dayjs from "dayjs";

// Custom popper for dark dropdown
const DarkPopper = (props) => (
  <Popper
    {...props}
    placement="bottom-start"
    modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
    sx={{ zIndex: 1500 }}
  />
);

const DarkPaper = (props) => (
  <Paper
    {...props}
    sx={{
      bgcolor: "#1f2937",
      color: "#e5e7eb",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.10)",
      boxShadow: "0 8px 20px rgba(0,0,0,0.55)",
      "& .MuiPickersDay-root": {
        color: "#e5e7eb",
      },
      "& .MuiPickersDay-root.Mui-selected": {
        backgroundColor: "#22d3ee !important",
        color: "#000 !important",
      },
      "& .MuiPickersCalendarHeader-label": { color: "#e5e7eb" },
      "& .MuiIconButton-root": { color: "#22d3ee" },
    }}
  />
);

export default function DatePickerValue({ selectedDate, handleSelectDate }) {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 600;

  const formatValue = selectedDate
    ? dayjs(selectedDate).format(isMobile ? "MM/DD" : "MM/DD/YYYY")
    : "";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={selectedDate}
        onChange={handleSelectDate}
        format={isMobile ? "MM/DD" : "MM/DD/YYYY"}
        slots={{
          popper: DarkPopper,
          paperContent: DarkPaper,
        }}
        slotProps={{
          textField: {
            size: "small",
            placeholder: "Date",
            sx: {
              width: isMobile ? 110 : 150,
              "& .MuiOutlinedInput-root": {
                height: isMobile ? 34 : 38,
                backgroundColor: "#1f2937",
                color: "#e2e8f0",
                borderRadius: "10px",
                border: "1px solid rgba(148,163,184,0.35)",
                fontSize: isMobile ? "12px" : "13px",
                fontWeight: 600,
                paddingLeft: "4px",

                "& .MuiSvgIcon-root": {
                  color: "#22d3ee",
                },

                "& input": {
                  padding: isMobile ? "8px 2px" : "8px 6px",
                  textAlign: "center",
                  fontSize: isMobile ? "12px" : "13px",
                },

                "&:hover": {
                  borderColor: "#22d3ee",
                  boxShadow: "0 0 10px rgba(34,211,238,0.25)",
                },
                "&.Mui-focused": {
                  borderColor: "#22d3ee",
                  boxShadow: "0 0 14px rgba(34,211,238,0.45)",
                },
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
