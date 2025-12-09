import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { styled, useTheme } from "@mui/material/styles";
import dayjs from "dayjs";

const CustomDatePicker = styled(DatePicker)(({ theme }) => ({
  "& .MuiInputBase-root": {
    width: "160px",
    height: "38px",
    borderRadius: "10px",
    background: theme.palette.mode === "dark" ? "#1f2937" : "#ffffff",
    border: `1px solid ${theme.palette.divider}`,
    transition: "0.25s all ease-in-out",

    "&:hover": {
      borderColor:
        theme.palette.mode === "dark" ? "#38bdf8" : theme.palette.primary.main,
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 0 8px rgba(56,189,248,.3)"
          : "0 0 8px rgba(25,118,210,.25)",
    },

    [theme.breakpoints.down("sm")]: {
      width: "115px",
      height: "34px",
    },
  },

  "& .MuiInputBase-input": {
    padding: "8px 10px",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    textAlign: "center",

    [theme.breakpoints.down("sm")]: {
      fontSize: "0.7rem",
      padding: "6px",
    },
  },

  "& .MuiIconButton-root": {
    color: theme.palette.primary.main,
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },

  // 🎯 Text label styling
  "& .MuiFormLabel-root": {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  "& .MuiFormLabel-root.Mui-focused": {
    color: theme.palette.primary.main,
  },
}));

export default function DatePickerValue({ selectedDate, handleSelectDate }) {
  const theme = useTheme();

  const isMobile = window.innerWidth < 600;
  const formatValue = selectedDate
    ? dayjs(selectedDate).format(isMobile ? "MM/DD" : "MM/DD/YYYY")
    : "";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CustomDatePicker
        label="Select Date"
        value={selectedDate}
        size="small"
        onChange={handleSelectDate}
        format={formatValue}
        slotProps={{
          textField: {
            variant: "outlined",
          },
        }}
      />
    </LocalizationProvider>
  );
}
