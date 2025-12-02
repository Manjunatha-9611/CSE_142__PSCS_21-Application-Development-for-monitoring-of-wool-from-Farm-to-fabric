import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="klwb-main-content">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="klwb-card p-5">
                            <h1 className="klwb-page-title mb-4">Privacy Policy</h1>
                            <p className="text-muted mb-5">Last Updated: November 27, 2025</p>

                            <div className="mb-4">
                                <h4>1. Information We Collect</h4>
                                <p>
                                    We collect information that you provide directly to us, such as when you create an account,
                                    register a batch of wool, or contact us for support. This may include your name, contact details,
                                    farm location, and transaction history.
                                </p>
                            </div>

                            <div className="mb-4">
                                <h4>2. How We Use Your Information</h4>
                                <p>
                                    We use the information we collect to:
                                </p>
                                <ul>
                                    <li>Provide, maintain, and improve our services.</li>
                                    <li>Process transactions and track wool batches.</li>
                                    <li>Send you technical notices, updates, and support messages.</li>
                                    <li>Comply with legal obligations and government regulations.</li>
                                </ul>
                            </div>

                            <div className="mb-4">
                                <h4>3. Data Security</h4>
                                <p>
                                    We implement appropriate technical and organizational measures to protect your personal data
                                    against unauthorized access, alteration, disclosure, or destruction. We use blockchain technology
                                    to ensure the integrity and immutability of transaction records.
                                </p>
                            </div>

                            <div className="mb-4">
                                <h4>4. Sharing of Information</h4>
                                <p>
                                    We do not share your personal information with third parties except as described in this policy
                                    or with your consent. We may share data with other government departments for regulatory purposes.
                                </p>
                            </div>

                            <div className="mb-4">
                                <h4>5. Contact Us</h4>
                                <p>
                                    If you have any questions about this Privacy Policy, please contact us at support@klwb.karnataka.gov.in.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
