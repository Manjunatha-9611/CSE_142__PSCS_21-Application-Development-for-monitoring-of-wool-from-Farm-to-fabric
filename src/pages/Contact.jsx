import React from 'react';

const Contact = () => {
    return (
        <div className="klwb-main-content">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="klwb-card p-5">
                            <h1 className="klwb-page-title text-center mb-5">Contact Us</h1>

                            <div className="row mb-5">
                                <div className="col-md-4 text-center mb-4 mb-md-0">
                                    <div className="mb-3">
                                        <i className="fas fa-map-marker-alt fa-2x text-primary"></i>
                                    </div>
                                    <h5>Visit Us</h5>
                                    <p className="text-muted">
                                        Karnataka Labour Welfare Board<br />
                                        Karmika Bhavana, Bannerghatta Road<br />
                                        Bengaluru - 560029
                                    </p>
                                </div>
                                <div className="col-md-4 text-center mb-4 mb-md-0">
                                    <div className="mb-3">
                                        <i className="fas fa-phone-alt fa-2x text-primary"></i>
                                    </div>
                                    <h5>Call Us</h5>
                                    <p className="text-muted">
                                        +91 80 1234 5678<br />
                                        Mon-Fri, 9:00 AM - 5:00 PM
                                    </p>
                                </div>
                                <div className="col-md-4 text-center">
                                    <div className="mb-3">
                                        <i className="fas fa-envelope fa-2x text-primary"></i>
                                    </div>
                                    <h5>Email Us</h5>
                                    <p className="text-muted">
                                        support@klwb.karnataka.gov.in<br />
                                        info@klwb.karnataka.gov.in
                                    </p>
                                </div>
                            </div>

                            <hr className="my-5" />

                            <h3 className="text-center mb-4">Send us a Message</h3>
                            <form>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Name</label>
                                        <input type="text" className="form-control" placeholder="Your Name" />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" placeholder="Your Email" />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Subject</label>
                                    <input type="text" className="form-control" placeholder="Subject" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Message</label>
                                    <textarea className="form-control" rows="5" placeholder="How can we help you?"></textarea>
                                </div>
                                <div className="text-center">
                                    <button type="button" className="btn btn-primary px-5">Send Message</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
