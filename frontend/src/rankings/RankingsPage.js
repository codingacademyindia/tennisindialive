import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import CustomizedTables from '../../common/grids/CustomizedTablesJSON';
import Loader from '../../common/stateHandlers/LoaderState';
import CountryAutocomplete from '../../common/CountryAutoComplete';
import SEO from '../../common/seo/SEO';
import { setItem, getItem } from '../../indexDb/indexedDB';
import { toast } from 'react-toastify';
import { getAlpha3 } from '../../utils/utils';

const RankingPage = ({ category }) => {
  const { type } = useParams(); // e.g. atp-singles, wta-doubles
  const { country } = useParams();
  const [rankingsData, setRankingsData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshScore, setRefreshScore] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(country || 'india');
  const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
  const [selectedCountryAlpha3, setSelectedCountryAlpha3] = useState(getAlpha3(country) || 'ind');
  const [rankingTimestamp, setRankingTimestamp] = useState('');
  const [pageHeader, setPageHeader] = useState('');
  const [pageDesc, setPageDesc] = useState('');
  const [expanded, setExpanded] = useState(true);

  const rankingConfig = {
    'atp-singles': {
      url: '/ranking/live/atp/atp-live-ranking.json',
      timestampKey: 'atp-live-ranking',
      header: 'ATP Live Ranking - Singles',
      desc: 'Real-time ATP Singles rankings. Filter by country to focus on India or view all global players.',
    },
    'atp-doubles': {
      url: '/ranking/live/atp/atp-doubles-live-ranking.json',
      timestampKey: 'atp-doubles-live-ranking',
      header: 'ATP Live Ranking - Doubles',
      desc: 'Real-time ATP Doubles rankings. Filter by country to focus on India or view all global players.',
    },
    'wta-singles': {
      url: '/ranking/live/wta/wta-live-ranking.json',
      timestampKey: 'wta-live-ranking',
      header: 'WTA Live Ranking - Singles',
      desc: 'Real-time WTA Singles rankings. Filter by country to focus on India or view all global players.',
    },
    'wta-doubles': {
      url: '/ranking/live/wta/wta-doubles-live-ranking.json',
      timestampKey: 'wta-doubles-live-ranking',
      header: 'WTA Live Ranking - Doubles',
      desc: 'Real-time WTA Doubles rankings. Filter by country to focus on India or view all global players.',
    },
  };

  const handleCountryChange = async (newCountryCode, newValue) => {
    setSelectedCountry(newCountryCode);
    setSelectedCountryCode(newValue ? newValue.code : null);
    setSelectedCountryAlpha3(newValue ? newValue.alpha3.toLowerCase() : null);

    await setItem('country', newCountryCode);
    await setItem('countryCode', newValue ? newValue.code : null);
    await setItem('countryAlpha3', newValue ? newValue.alpha3.toLowerCase() : null);

    toast.success('Loading rankings...', { autoClose: 2000 });
    setTimeout(() => {
      window.location.href = `/rankings/live/${type}/${newCountryCode.toLowerCase()}`;
    }, 800);
  };

  const getFilteredData = (data) => {
    if (!data) return;
    let copy = JSON.parse(JSON.stringify(data));
    if (selectedCountryAlpha3.toLowerCase() !== 'all') {
      copy = copy.filter(item => item.country.toLowerCase() === selectedCountryAlpha3.toLowerCase());
    }
    setFilteredData(copy);
    return copy;
  };

  useEffect(() => {
    const fetchStoredCountry = async () => {
      const storedValue = await getItem('country');
      const storedCode = await getItem('countryCode');
      const storedAlpha3 = await getItem('countryAlpha3');
      setSelectedCountry(storedValue || 'india');
      setSelectedCountryCode(storedCode || 'IN');
      setSelectedCountryAlpha3(getAlpha3(storedValue) || storedAlpha3 || 'ind');
    };
    fetchStoredCountry();
  }, []);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const timestampRes = await fetch('/ranking/live/live_ranking_timestamp.json');
        const timeStampData = await timestampRes.json();

        const config = rankingConfig[type];
        if (!config) throw new Error('Invalid ranking type');

        const res = await fetch(config.url);
        const data = await res.json();

        setRankingsData(data);
        setRankingTimestamp(timeStampData[config.timestampKey]);
        setPageHeader(config.header);
        setPageDesc(config.desc);
        getFilteredData(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load rankings data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [type, refreshScore]);

  useEffect(() => {
    setLoading(true);
    getFilteredData(rankingsData);
    setLoading(false);
  }, [selectedCountry, selectedCountryAlpha3]);

  return (
    <div>
      <SEO
        title={`Tennis ${selectedCountry.toUpperCase()} Live - ${type.toUpperCase()} Rankings | Countrywise Rankings & Live Scores`}
        description={`Real-time tennis rankings, live scores and updates for ${selectedCountry}. Follow ATP, WTA, and local tournaments.`}
        keywords={`tennis rankings, ${selectedCountry} tennis, live rankings, ATP, WTA, live scores, country wise rankings`}
        url={`https://tennisindialive.com/rankings/live/${type}/${selectedCountry}`}
      />

      <div className="flex flex-row space-x-4 w-full bg-slate-200 items-center p-2">
        <div className="text-xl font-bold">{pageHeader}</div>
        <CountryAutocomplete selectedCountry={selectedCountry} handleCountryChange={handleCountryChange} />
        <div className="flex flex-row space-x-1 text-xs">
          <span className="font-bold">Updated At:</span>
          <span>{rankingTimestamp}</span>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 text-gray-800 p-3 rounded-md m-1 text-sm">
        {pageDesc}
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading ? <Loader /> : (
        rankingsData && (
          <div className="w-full mx-auto border">
            <CustomizedTables data={getFilteredData(rankingsData)} countryName={selectedCountry} />
          </div>
        )
      )}

      <div className="px-4 py-4">
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} className="bg-slate-100">
            <Typography className="font-medium">FAQs - Live Rankings</Typography>
          </AccordionSummary>
          <AccordionDetails className="text-sm">
            <p><strong>Q1:</strong> How frequently are these rankings updated?</p>
            <p><strong>A:</strong> Rankings are updated live based on official ATP and WTA data feeds.</p>

            <p className="mt-2"><strong>Q2:</strong> What does the 'Updated At' timestamp indicate?</p>
            <p><strong>A:</strong> It shows the latest timestamp when the ranking data was refreshed.</p>

            <p className="mt-2"><strong>Q3:</strong> Why do I see only Indian players sometimes?</p>
            <p><strong>A:</strong> If 'India' is selected in the country filter, only Indian players are shown.</p>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
};

export default RankingPage;
