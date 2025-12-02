import React from 'react';

const TermsOfService = () => {
    return (
        <div className="klwb-main-content">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="klwb-card p-5">
                            <h1 className="klwb-page-title mb-4">Terms of Service</h1>
                            <p className="text-muted mb-5">Last Updated: November 27, 2025</p>

                            <div className="mb-4">
                                <h4>1. Acceptance of Terms</h4>
                                <p>
                                    By accessing or using the Karnataka Wool Monitoring System, you agree to be bound by these Terms of Service.
                                    If you do not agree to these terms, please do not use our services.
                                </p>
                            </div>

                            <div className="mb-4">
                                <h4>2. User Accounts</h4>
                                <p>
                                    You are responsible for maintaining the confidentiality of your account credentials and for all activities
                                    that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                                </p>
                            </div>

                            <div className="mb-4">
                                <h4>3. Usage Guidelines</h4>
                                <p>
                                    You agree not to:
                                </p>
                                <ul>
                                    <li>Use the service for any illegal purpose.</li>
                                    <li>Enter false or misleading information about wool batches.</li>
                                    <li>Attempt to interfere with the proper working of the system.</li>
                                    <li>Reverse engineer or attempt to extract the source code of the software.</li>
                                </ul>
                            </div>

                            <div className="mb-4">
                                <h4>4. Intellectual Property</h4>
                                <p>
                                    All content and materials available on this website are the property of the Government of Karnataka
                                    or its licensors and are protected by applicable intellectual property laws.
                                </p>
                            </div>

                            <div className="mb-4">
                                <h4>5. Limitation of Liability</h4>
                                <p>
                                    The Government of Karnataka shall not be liable for any indirect, incidental, special, consequential,
                                    or punitive damages resulting from your access to or use of, or inability to access or use, the services.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
