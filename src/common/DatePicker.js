import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";

export default function DatePickerValue({ selectedDate, handleSelectDate }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 600;

  const formatValue = selectedDate
    ? dayjs(selectedDate).format(isMobile ? "MM/DD" : "MM/DD/YYYY")
    : "";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label=""
        value={selectedDate}
        onChange={handleSelectDate}
        inputFormat={isMobile ? "MM/DD" : "MM/DD/YYYY"}
        slotProps={{
          textField: {
            size: "small",
            variant: "outlined",
            sx: {
              width: 160,
              height: 38,
              "& .MuiInputBase-root": {
                backgroundColor: "#1f2937", // dark background
                color: "#e2e8f0", // light text
                borderRadius: "10px",
                border: "1px solid rgba(148,163,184,0.3)",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#22d3ee",
                  boxShadow: "0 0 10px rgba(34,211,238,0.25)",
                },
                "&.Mui-focused": {
                  borderColor: "#22d3ee",
                  boxShadow: "0 0 12px rgba(34,211,238,0.35)",
                },
              },
              "& .MuiInputBase-input": {
                textAlign: "center",
                padding: "8px 10px",
              },
              "& .MuiSvgIcon-root": {
                color: "#22d3ee",
              },
              "& .MuiFormLabel-root": {
                color: "rgba(148,163,184,0.7)",
                fontSize: "0.75rem",
              },
              "& .MuiFormLabel-root.Mui-focused": {
                color: "#22d3ee",
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
