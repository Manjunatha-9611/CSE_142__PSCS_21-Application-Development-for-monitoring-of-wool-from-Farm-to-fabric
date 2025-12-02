import React from 'react';

const FAQ = () => {
    return (
        <div className="klwb-main-content">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="klwb-card p-5">
                            <h1 className="klwb-page-title text-center mb-5">Frequently Asked Questions</h1>

                            <div className="accordion" id="faqAccordion">

                                <div className="accordion-item mb-3 border rounded">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                                            What is the Wool Monitoring System?
                                        </button>
                                    </h2>
                                    <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                                        <div className="accordion-body">
                                            The Wool Monitoring System is a digital platform designed to track the journey of wool from the farm
                                            to the final product. It ensures transparency, quality control, and fair pricing for farmers.
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item mb-3 border rounded">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                                            How do I register as a farmer?
                                        </button>
                                    </h2>
                                    <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                        <div className="accordion-body">
                                            You can register by clicking on the "Login/Register" button on the homepage and selecting the
                                            "Farmer Registration" option. You will need to provide your basic details and farm information.
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item mb-3 border rounded">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                                            How does the QR code tracking work?
                                        </button>
                                    </h2>
                                    <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                        <div className="accordion-body">
                                            Each batch of wool is assigned a unique QR code. As the batch moves through processing stages
                                            (shearing, grading, processing, etc.), the QR code is scanned to update its status and location
                                            in real-time.
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item mb-3 border rounded">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                                            Is my data secure?
                                        </button>
                                    </h2>
                                    <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                        <div className="accordion-body">
                                            Yes, we use advanced security measures including blockchain technology to ensure that all data
                                            is secure, immutable, and tamper-proof.
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item mb-3 border rounded">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq5">
                                            Who can I contact for technical support?
                                        </button>
                                    </h2>
                                    <div id="faq5" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                        <div className="accordion-body">
                                            You can reach our support team via the Contact Us page, or email us directly at support@klwb.karnataka.gov.in.
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
