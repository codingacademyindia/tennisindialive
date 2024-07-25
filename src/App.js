import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FixtureResults from './scores/Scores';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ATPLiveRankings from './rankings/ATP/LiveRankings';
import ATPCurrentRankings from './rankings/ATP/CurrentRanking';
import WtaCurrentRankings from './rankings/WTA/CurrentRanking';
import WtaLiveRankings from './rankings/WTA/LiveRankings';
import ResponsiveAppBar from './header/Header';
import Footer from './common/Footer';

const App = () => {
  const date = new Date();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <ResponsiveAppBar />
          <div className="flex-grow">
            <Routes>
              <Route path="/results/:year/:month/:day" element={<FixtureResults />} />
              <Route path="/rankings/live/atp" element={<ATPLiveRankings />} />
              <Route path="/rankings/current/atp" element={<ATPCurrentRankings />} />
              <Route path="/rankings/live/wta" element={<WtaLiveRankings />} />
              <Route path="/rankings/current/wta" element={<WtaCurrentRankings />} />
              <Route path="*" element={<p>Path not resolved</p>} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </LocalizationProvider>
  );
};

export default App;
