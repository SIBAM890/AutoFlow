import React from 'react';
import { Link } from 'react-router-dom';

const CTA = () => {
    return (
        <section className="final-cta-section">
            <div className="cta-gradient-bg"></div>
            <div className="cta-content">
                <h2 className="cta-headline">Ready to stop drowning in messages?</h2>
                <p className="cta-subheadline">Join 1,000+ businesses automating support with AI.</p>

                <Link to="/builder">
                    <button className="cta-mega-button">
                        <span className="cta-btn-text">Build Your First Agent - Free</span>
                        <svg className="cta-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </Link>

                <div className="cta-trust">
                    <div className="trust-badge"><span>No credit card required</span></div>
                    <div className="trust-badge"><span>Setup in 60 seconds</span></div>
                </div>
            </div>
        </section>
    );
};

export default CTA;