import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FixtureResults from './scores/Scores';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
        <div>
          <Routes>
            <Route path="/results" element={<FixtureResults />} />

          </Routes>
        </div>
      </Router>
    </LocalizationProvider>
  );
};

export default App;
