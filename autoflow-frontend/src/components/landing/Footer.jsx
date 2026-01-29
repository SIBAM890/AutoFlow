import React from 'react';

const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            {/* Ensure logo is in public folder */}
                            <img src="/logo.png" alt="AutoFlow" className="logo-img" />
                            <span className="logo-text">AutoFlow</span>
                        </div>
                        <p className="footer-tagline">Automating the future of business communications.</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Product</h4>
                            <a href="#">Features</a>
                            <a href="#">Pricing</a>
                        </div>
                        <div className="footer-column">
                            <h4>Company</h4>
                            <a href="#">About</a>
                            <a href="#">Contact</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="footer-copyright">
                        &copy; 2026 AutoFlow Inc. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;