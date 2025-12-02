import React from 'react';
import { Route, BrowserRouter as Router, Routes, Navigate, useParams } from 'react-router-dom';

import FixtureResultsAll from './scores/ScoresAll';
import FixtureResultsCountry from './scores/ScoresAllCountry';
import FixtureResultsCountrySEO from './scores/ScoresAllCountrySEO';
import FixtureResultsAdmin from './admin/ScoresAdmin';
import ATPLiveRankingsJSON from './rankings/ATP/LiveRankingsJSON';
import OfficialRankings from './rankings/ATP/OfficialRankingsJSON';

import AboutUs from './about/AboutUs';
import PrivacyPolicy from './about/PrivacyPolicy';
import TermsOfService from './about/TermsOfService';
import ContactUs from './contactus/ContactUs';

import RSSFeed from './news/RSSFeed';

import PlayersListATP from './players/atp/PlayerATP';
import PlayerProfileATP from './players/atp/PlayerProfile';
import PlayerProfileWTA from './players/wta/PlayerProfile';
import PlayersListWTA from './players/wta/PlayerWTA';

import RequestPlayerInfo from './contactus/RequestPlayerInfo';

import Footer from './common/Footer';
import NotFound from './common/stateHandlers/NotFound';
import WelcomeModal from './common/WelcomeModal';
import ResponsiveAppBar from './header/Header';

import AdUnitTop from './ads/AdBannerTop';
import FluidAd from './ads/FluidAd';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// ----------------------------
// Redirect legacy dash URLs
// /tennis-india/scores  → /tennis/india/scores
// /tennis-ind/scores    → /tennis/ind/scores
// ----------------------------
function RedirectLegacyCountry() {
  const { legacy } = useParams(); // "india" from "tennis-india"
  const country = legacy.replace(/^tennis-/, '').toLowerCase();
  return <Navigate to={`/tennis/${country}/scores`} replace />;
}

const App = () => {
  console.log('MATCHED ROUTE', window.location.pathname);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
        <div className="flex flex-col w-full">
          <div className="flex flex-col min-h-screen w-full border sm:w-[80%] mx-auto">

            <FluidAd />
            <ResponsiveAppBar />
            <WelcomeModal />

            <div className="flex-grow">
              <Routes>

                {/* ================================ */}
                {/* HIGH-PRIORITY SEO / LEGACY ROUTES */}
                {/* ================================ */}
                <Route path="/tennis-:legacy/scores" element={<RedirectLegacyCountry />} />
                <Route path="/tennis/:country/scores" element={<FixtureResultsCountrySEO />} />
                <Route path="/live-tennis-score/:country" element={<FixtureResultsCountrySEO />} />

                {/* ================================ */}
                {/* PRIMARY ROUTES */}
                {/* ================================ */}
                <Route path="/" element={<FixtureResultsCountrySEO />} />
                <Route path="/tennisadmin" element={<FixtureResultsAdmin />} />

                <Route path="/live-scores" element={<FixtureResultsCountrySEO />} />
                <Route path="/live-scores/:country" element={<FixtureResultsCountrySEO />} />
                <Route path="/tennis-score-live" element={<FixtureResultsCountrySEO />} />
                <Route path="/tennis-score-live/:country" element={<FixtureResultsCountrySEO />} />
                <Route path="/live-tennis" element={<FixtureResultsCountrySEO />} />
                <Route path="/tennis-live" element={<FixtureResultsCountrySEO />} />
                 <Route path="/tennis-live/:country" element={<FixtureResultsCountrySEO />} />
                <Route path="/live-tennis/:country" element={<FixtureResultsCountrySEO />} />

                {/* All matches & date-based */}
                <Route path="/all" element={<FixtureResultsAll />} />
                <Route path="/results/:year/:month/:day" element={<FixtureResultsAll />} />
                <Route path="/results/all/:year/:month/:day" element={<FixtureResultsAll />} />

                {/* ================================ */}
                {/* RANKINGS ROUTES */}
                {/* ================================ */}
                <Route path="/rankings/live/:type" element={<ATPLiveRankingsJSON />} />
                <Route path="/rankings/live/:type/:country" element={<ATPLiveRankingsJSON />} />
                <Route path="/rankings/official/:type" element={<OfficialRankings />} />
                <Route path="/rankings/official/:type/:country" element={<OfficialRankings />} />

                {/* ================================ */}
                {/* PLAYER ROUTES */}
                {/* ================================ */}
                <Route path="/player/atp/:player" element={<PlayerProfileATP />} />
                <Route path="/player/wta/:player" element={<PlayerProfileWTA />} />
                <Route path="/players/atp" element={<PlayersListATP />} />
                <Route path="/players/wta" element={<PlayersListWTA />} />

                {/* ================================ */}
                {/* STATIC PAGES */}
                {/* ================================ */}
                <Route path="/privacypolicy" element={<PrivacyPolicy />} />
                <Route path="/aboutus" element={<AboutUs />} />
                <Route path="/contactus" element={<ContactUs />} />
                <Route path="/termsofservice" element={<TermsOfService />} />
                <Route path="/playerinforequest" element={<RequestPlayerInfo />} />

                {/* ================================ */}
                {/* NEWS FEED */}
                {/* ================================ */}
                <Route path="/news" element={<RSSFeed feedUrl="https://www.espn.com/espn/rss/tennis/news" />} />

                {/* ================================ */}
                {/* FALLBACK */}
                {/* ================================ */}
                <Route path="*" element={<NotFound msg="Page Not Found" />} />

              </Routes>
            </div>

            <AdUnitTop />
            <Footer />

          </div>
        </div>
      </Router>
    </LocalizationProvider>
  );
};

export default App;
