import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="klwb-footer">
            <div className="container">
                <div className="row">
                    {/* Column 1: About */}
                    <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
                        <h5 className="klwb-footer-title">Karnataka Wool Monitoring</h5>
                        <p className="klwb-footer-text">
                            An initiative by the Karnataka Labour Welfare Board to streamline wool tracking
                            from farm to fabric, ensuring quality and fair trade for farmers.
                        </p>
                        <div className="klwb-social-links">
                            <a href="#" className="klwb-social-link"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="klwb-social-link"><i className="fab fa-twitter"></i></a>
                            <a href="#" className="klwb-social-link"><i className="fab fa-instagram"></i></a>
                            <a href="#" className="klwb-social-link"><i className="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
                        <h5 className="klwb-footer-title">Quick Links</h5>
                        <ul className="klwb-footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/products">Products</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Support */}
                    <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
                        <h5 className="klwb-footer-title">Support</h5>
                        <ul className="klwb-footer-links">
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service">Terms of Service</Link></li>
                            <li><Link to="/education">Training</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact Info */}
                    <div className="col-lg-4 col-md-6">
                        <h5 className="klwb-footer-title">Contact Us</h5>
                        <ul className="klwb-footer-contact">
                            <li>
                                <i className="fas fa-map-marker-alt"></i>
                                <span>
                                    Karnataka Labour Welfare Board,<br />
                                    Karmika Bhavana, Bannerghatta Road,<br />
                                    Bengaluru - 560029
                                </span>
                            </li>
                            <li>
                                <i className="fas fa-phone-alt"></i>
                                <span>+91 80 1234 5678</span>
                            </li>
                            <li>
                                <i className="fas fa-envelope"></i>
                                <span>support@klwb.karnataka.gov.in</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="klwb-footer-divider" />

                <div className="row align-items-center">
                    <div className="col-md-6 text-center text-md-start">
                        <p className="klwb-copyright mb-0">
                            &copy; {currentYear} Government of Karnataka. All Rights Reserved.
                        </p>
                    </div>
                    <div className="col-md-6 text-center text-md-end">
                        <p className="klwb-developed-by mb-0">
                            Designed & Developed for KLWB
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
