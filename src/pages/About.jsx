import React from 'react';

const About = () => {
    return (
        <div className="klwb-main-content">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="klwb-card p-5">
                            <h1 className="klwb-page-title text-center mb-4">About the Initiative</h1>

                            <div className="row align-items-center mb-5">
                                <div className="col-md-8">
                                    <h3 className="text-primary mb-3">Empowering Wool Farmers</h3>
                                    <p className="lead">
                                        The Karnataka Wool Monitoring System is a visionary project by the Karnataka Labour Welfare Board
                                        aimed at revolutionizing the wool industry in the state.
                                    </p>
                                    <p>
                                        Our mission is to provide a transparent, efficient, and fair ecosystem for wool farmers,
                                        processing units, and buyers. By leveraging modern technology, we ensure that every batch of wool
                                        is traceable from the farm to the final fabric, guaranteeing quality and authenticity.
                                    </p>
                                </div>
                                <div className="col-md-4 text-center">
                                    <img src="/karnataka_emblem.png" alt="Karnataka Emblem" className="img-fluid" style={{ maxHeight: '200px' }} />
                                </div>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-4">
                                    <div className="text-center p-4 bg-light rounded h-100">
                                        <i className="fas fa-hand-holding-heart fa-3x text-success mb-3"></i>
                                        <h4>Fair Trade</h4>
                                        <p>Ensuring farmers get the best price for their produce through direct market access.</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="text-center p-4 bg-light rounded h-100">
                                        <i className="fas fa-qrcode fa-3x text-primary mb-3"></i>
                                        <h4>Traceability</h4>
                                        <p>End-to-end tracking of wool batches using QR code technology and blockchain.</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="text-center p-4 bg-light rounded h-100">
                                        <i className="fas fa-award fa-3x text-warning mb-3"></i>
                                        <h4>Quality Assurance</h4>
                                        <p>Rigorous quality checks at every stage to maintain international standards.</p>
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

export default About;
