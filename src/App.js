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
import NotFound from './common/stateHandlers/NotFound';
import FixtureResultsAll from './scores/ScoresAll';
import PrivacyPolicy from './about/PrivacyPolicy';
import AboutUs from './about/AboutUs';
import ContactUs from './about/ContactUs';
import TermsOfService from './about/TermsOfService';
const App = () => {
  const date = new Date();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
        <div className="flex flex-col min-h-screen w-full border sm:w-[70%] mx-auto">
          <ResponsiveAppBar />
          <div className="flex-grow">
            <Routes>
            <Route path="/" element={<FixtureResultsAll />} />
            <Route path="/all" element={<FixtureResultsAll />} />
              <Route path="/results/:year/:month/:day" element={<FixtureResultsAll />} />
              <Route path="/results/all/:year/:month/:day" element={<FixtureResultsAll />} />
              <Route path="/rankings/live/atp" element={<ATPLiveRankings />} />
              <Route path="/rankings/current/atp" element={<ATPCurrentRankings />} />
              <Route path="/rankings/live/wta" element={<WtaLiveRankings />} />
              <Route path="/rankings/current/wta" element={<WtaCurrentRankings />} />
              <Route path="/privacypolicy" element={<PrivacyPolicy />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/contactus" element={<ContactUs />} />
              <Route path="/termsofservice" element={<TermsOfService />} />
              <Route path="*" element={<NotFound msg="Page Not Found" />}/>
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </LocalizationProvider>
  );
};

export default App;
