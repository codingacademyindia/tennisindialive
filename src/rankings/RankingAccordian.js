import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaginatedTablesJSON from '../common/grids/PaginatedTablesJSON';
import { FaChevronDown } from 'react-icons/fa';

function AccordionItem({ id, title, subtitle, isOpen, onToggle, children }) {
    return (
        <div className="mb-4">
            <button
                aria-controls={id}
                aria-expanded={isOpen}
                onClick={onToggle}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg
                    bg-gradient-to-r from-gray-800 to-gray-700
                    border border-gray-700
                    text-left text-blue-100 font-semibold text-lg
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                    transition-shadow duration-150
                    ${isOpen ? 'shadow-lg' : 'hover:shadow-md'}`}
            >
                <div className="flex items-center gap-3">
                    {/* <FaTrophy className="text-yellow-400 w-5 h-5" /> */}
                    <div>
                        <div className="leading-tight">{title}</div>
                        {subtitle && <div className="text-xs text-gray-300 mt-0.5">{subtitle}</div>}
                    </div>
                </div>

                <span
                    className={`flex items-center transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    aria-hidden="true"
                >
                    <FaChevronDown className="w-4 h-4" />
                </span>
            </button>

            <div
                id={id}
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px] mt-3' : 'max-h-0'}`}
            // If you want to control accessibility more, consider adding role="region" and aria-labelledby
            >
                <div className="p-4 bg-gray-800 border border-t-0 border-gray-700 rounded-b-lg">
                    {children}
                </div>
            </div>
        </div>
    );
}
const RankingAccordion = ({
    rankingsData,
    rankingType,
    selectedCountry,
    rankingHeader,
    rankingDesc,
}) => {
    const [expanded, setExpanded] = useState(null);
    const [openAccordion, setOpenAccordion] = useState('point');
    const handleChange = (key) => (event, isExpanded) => {
        setExpanded(isExpanded ? key : null);
    };

    return (
        <div>
            <AccordionItem
                id="acc-match-stats"
                title={rankingHeader}
                // subtitle={`${periods.length} periods`}
                isOpen={openAccordion === rankingType}
                onToggle={() => setOpenAccordion(openAccordion === rankingType ? '' : rankingType)}
            >
                <PaginatedTablesJSON data={rankingsData || []} countryName={selectedCountry} />
            </AccordionItem>


        </div>
    );
};

export default RankingAccordion;
