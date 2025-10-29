import React, { useState, useEffect } from 'react';
import { CgClose } from 'react-icons/cg';
const KEY = 'supportUsHidden';

export default function SupportUs() {
    const [hidden, setHidden] = useState(false);

    // useEffect(() => {
    //     try {
    //         setHidden(localStorage.getItem(KEY) === '1');
    //     } catch {
    //         setHidden(false);
    //     }
    // }, []);

    // if (hidden) return null;

    const dismiss = () => {
        // try { localStorage.setItem(KEY, '1'); } catch { }
        setHidden(true);
    };

    return (
        <div
            role="region"
            aria-label="Support Tennis India Live"
            className="inset-x-4 top-4 z-50 flex justify-center pointer-events-auto"
        >
            <div className="max-w-5xl w-full bg-yellow-100/95 dark:bg-gray-800/75 border border-yellow-200 dark:border-gray-700 px-3 py-3 sm:px-4 sm:py-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm shadow-sm backdrop-blur-sm rounded-lg">
                {/* <span className="text-lg" aria-hidden>❤️</span> */}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <strong className="text-gray-900 dark:text-gray-100 truncate">Support TennisIndiaLive</strong>
                        <button
                            onClick={dismiss}
                            aria-label="Dismiss support banner"
                            className="fixed right-0 p-1 rounded-md text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition self-start sm:self-auto flex sm:hidden"
                        >
                            <CgClose />
                        </button>
                        <span className="text-xs text-gray-600 dark:text-gray-300 hidden lg:inline">- tracking Indian players worldwide</span>
                    </div>

                    <div className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                        Help cover hosting and domain costs - any contribution keeps the site running.
                        <span className="hidden sm:inline"> Thank you!</span>
                    </div>

                    {/* <a
              href="https://ko-fi.com/your-kofi-or-paypal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 bg-white text-xs rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition"
            >
              <span className="text-sm">🌍</span>
              <span>Support (Ko‑fi / PayPal)</span>
            </a>*/}

                </div>

                <div className="flex flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                    <a
                        href="https://razorpay.me/@codingacademyindia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-yellow-600 text-white text-xs rounded-md hover:bg-yellow-700 transition  sm:w-auto text-center"
                    >
                        <span>Make a Contribution</span>
                    </a>

                    <a
                        href="/contactus"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-3 py-1 border border-gray-300 bg-white text-xs rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition  sm:w-auto text-center"
                        aria-label="Feature request or suggestion"
                    >
                        <span className="text-sm" aria-hidden>📧</span>
                        <span>Feature Request / Suggestion</span>
                    </a>
                    <button
                        onClick={dismiss}
                        aria-label="Dismiss support banner"
                        className="p-1 rounded-md text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition self-start sm:self-auto hidden sm:flex"
                    >
                        <CgClose />
                    </button>
                </div>


            </div>
        </div>
    );
}