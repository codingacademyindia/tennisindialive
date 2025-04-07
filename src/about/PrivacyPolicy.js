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
                    <p>We do not collect personally identifiable information from users directly on this website.</p>
                </div>

                <div>
                    <p className="font-semibold">2. Cookies</p>
                    <p>
                        We use cookies to improve user experience and deliver personalized ads. These cookies
                        may be used by third-party networks to understand your preferences.
                    </p>
                </div>

                <div>
                    <p className="font-semibold">3. Advertising & Third Parties</p>
                    <p>
                        This website may work with third-party ad providers such as <strong>Ezoic</strong>,{' '}
                        <strong>Google AdSense</strong>, or others to serve advertisements. These providers may use cookies or other tracking technologies to serve relevant ads based on your browsing behavior.
                    </p>
                    <p>
                        You can learn more about how Ezoic handles user data by visiting their{' '}
                        <a
                            href="https://www.ezoic.com/privacy-policy/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            Privacy Policy
                        </a>.
                    </p>
                </div>

                <div>
                    <p className="font-semibold">4. Changes to This Policy</p>
                    <p>
                        We may update this policy from time to time. Any changes will be posted on this page.
                    </p>
                </div>

                <div>
                    <p className="font-semibold">5. Contact Us</p>
                    <p>
                        If you have any questions or concerns about our privacy practices, feel free to contact us at{' '}
                        <a
                            href="mailto:tennisofindia@gmail.com"
                            className="text-blue-600 hover:underline"
                        >
                            info@tennisindialive.com
                        </a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
