import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="border bg-slate-100 p-1">
            <h1 className='text-lg bg-indigo-800 text-white'>Privacy Policy</h1>
            <p><strong>1. Data Collection</strong></p>
            <p>We do not collect personal data from users of our website.</p>
            
            <p><strong>2. Cookies</strong></p>
            <p>We use cookies to serve ads on our site. These cookies help us serve relevant ads based on your interests.</p>

            <p><strong>3. Third-Party Ad Providers</strong></p>
            <p>Our website uses Google AdSense to serve ads. Google AdSense may use cookies to serve ads based on your visit to our site and other sites. For more information about Google's data practices, please visit the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.</p>
            
            <p><strong>4. Changes to This Policy</strong></p>
            <p>We may update this policy from time to time. Any changes will be posted on this page.</p>
            
            <p><strong>Contact Information</strong></p>
            <p>If you have any questions about this privacy policy, please contact us at <a href="mailto:tennisofindia@gmail.com">tennisofindia@gmail.com</a>.</p>
            
            <style jsx>{`
                .privacy-policy {
                    padding: 20px;
                    max-width: 800px;
                    margin: auto;
                    line-height: 1.6;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 20px;
                }
                a {
                    color: #1a73e8;
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};

export default PrivacyPolicy;
