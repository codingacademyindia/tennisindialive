import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FixtureResults from './scores/Scores';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ATPLiveRankings from './rankings/ATP/LiveRankings';
import ATPLiveRankingsJSON from './rankings/ATP/LiveRankingsJSON';
import ATPCurrentRankings from './rankings/ATP/CurrentRanking';
import WtaCurrentRankings from './rankings/WTA/CurrentRanking';
import WtaLiveRankings from './rankings/WTA/LiveRankings';
import ResponsiveAppBar from './header/Header';
import Footer from './common/Footer';
import NotFound from './common/stateHandlers/NotFound';
import FixtureResultsAll from './scores/ScoresAll';
import PrivacyPolicy from './about/PrivacyPolicy';
import AboutUs from './about/AboutUs';
import ContactUs from './contactus/ContactUs';
import TermsOfService from './about/TermsOfService';
import OfficialRankings from './rankings/ATP/OfficialRankingsJSON';
import RSSFeed from './news/RSSFeed';
import PlayerInfo from './common/dialogs/PlayerInfo';
import PlayerProfileWTA from './players/wta/PlayerProfile';
import PlayerProfileATP from './players/atp/PlayerProfile';
import PlayersListWTA from './players/wta/PlayerWTA';
import PlayersListATP from './players/atp/PlayerATP';
import RequestPlayerInfo from './contactus/RequestPlayerInfo';
import SupportRibbon from './common/SupportUs';
import AdUnit from './ads/AdUnit';
import AdUnitTop from './ads/AdBannerTop';
import AdRelaxedAd from './ads/AdBannerBottom';
import FluidAd from './ads/FluidAd';
import FixtureResultsCountry from './scores/ScoresAllCountry';
import WelcomeModal from './common/WelcomeModal';
import { useEffect } from 'react';
import { registerPush } from './pushSubscription';



const App = () => {
  const [subscribed, setSubscribed] = React.useState(false);


    // Step 1: Register for push once
    // useEffect(() => {
    //   const setup = async () => {
    //     try {
    //       await registerPush();
    //       setSubscribed(true);
    //     } catch (err) {
    //       console.error("Push registration failed:", err);
    //     }
    //   };
    //   setup();
    // }, []);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
        <div className='flex flex-col w-full'>
          <div className="flex flex-col min-h-screen w-full border sm:w-[70%] mx-auto">
            {/* <AdUnitTop /> */}
            <FluidAd />
            <ResponsiveAppBar />
            <WelcomeModal />

            {/* Ethical Monetag Direct Link Ad */}
            {/* <div className="w-full text-center py-2 bg-yellow-100 text-black text-sm">
              <a
                href="https://phoampor.top/4/9219647"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                🎾 Check today's exclusive tennis partner offers!
              </a>
            </div> */}

            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<FixtureResultsCountry />} />
                <Route path="/live-scores" element={<FixtureResultsCountry />} />
                <Route path="/live-scores/:country" element={<FixtureResultsCountry />} />
                <Route path="/all" element={<FixtureResultsAll />} />
                <Route path="/results/:year/:month/:day" element={<FixtureResultsAll />} />
                <Route path="/results/all/:year/:month/:day" element={<FixtureResultsAll />} />
                <Route path="/rankings/live/:type" element={<ATPLiveRankingsJSON />} />
                <Route path="/rankings/official/:type" element={<OfficialRankings />} />

                <Route path="/rankings/live/:type/:countryAlpha3" element={<ATPLiveRankingsJSON />} />
                <Route path="/rankings/official/:type/:countryAlpha3" element={<OfficialRankings />} />
                <Route path="/privacypolicy" element={<PrivacyPolicy />} />
                <Route path="/aboutus" element={<AboutUs />} />
                <Route path="/contactus" element={<ContactUs />} />
                <Route path="/termsofservice" element={<TermsOfService />} />
                <Route path="/player/atp/:player" element={<PlayerProfileATP />} />
                <Route path="/player/wta/:player" element={<PlayerProfileWTA />} />
                <Route path="/players/atp" element={<PlayersListATP />} />
                <Route path="/players/wta" element={<PlayersListWTA />} />
                <Route path="/contactus" element={<ContactUs />} />
                <Route path="/playerinforequest" element={<RequestPlayerInfo />} />
                <Route path="/news" element={<RSSFeed feedUrl="https://www.espn.com/espn/rss/tennis/news" />} />
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
