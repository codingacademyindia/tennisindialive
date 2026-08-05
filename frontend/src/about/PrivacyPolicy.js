import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="privacy-policy bg-slate-50 border border-slate-200 p-1 rounded-md max-w-3xl mx-auto my-1 text-gray-800">
            <h1 className="text-xl sm:text-2xl font-semibold bg-indigo-800 text-white p-3 rounded mb-4 text-center">
                Privacy Policy
            </h1>

            <div className="space-y-4 text-sm sm:text-base leading-relaxed">
                <div>
                    <p className="font-semibold">1. Data Collection</p>
                    <p>We do not collect personally identifiable information directly from users of this website.</p>
                </div>

                <div>
                    <p className="font-semibold">2. Cookies</p>
                    <p>
                        We use cookies and similar technologies to improve user experience and serve personalized ads.
                        These may be managed by third-party services such as Ezoic, Google AdSense, or others.
                    </p>
                </div>

                <div>
                    <p className="font-semibold">3. Ezoic & Third-Party Advertising</p>
                    <p>
                        This site uses <strong>Ezoic</strong> to manage all third-party advertising on the website. Ezoic
                        serves content and advertisements when you visit the site, which may use cookies. You can review
                        Ezoic’s privacy policy and how they handle data here:{" "}
                        <a
                            href="http://g.ezoic.net/privacy/tennisindialive.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            Ezoic Privacy Policy
                        </a>.
                    </p>

                    {/* Required Ezoic Embed Snippet */}
                    <span id="ezoic-privacy-policy-embed"></span>
                </div>

                <div>
                    <p className="font-semibold">4. Changes to This Policy</p>
                    <p>
                        We may update this policy periodically. Any major changes will be reflected here with the updated date.
                    </p>
                </div>

                <div>
                    <p className="font-semibold">5. Contact</p>
                    <p>
                        If you have any questions regarding this privacy policy, you can contact us at:{" "}
                        <a
                            href="mailto:tennisofindia@gmail.com"
                            className="text-blue-600 hover:underline"
                        >
                            tennisofindia@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
