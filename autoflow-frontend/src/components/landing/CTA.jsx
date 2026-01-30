import React from 'react';
import { useNavigate } from 'react-router-dom';

const CTA = () => {
    const navigate = useNavigate();

    return (
        <section className="final-cta-section relative">
            <div className="cta-gradient-bg"></div>
            <div className="cta-content">
                <h2 className="cta-headline">Ready to stop drowning in messages?</h2>
                <p className="cta-subheadline">Join 1,000+ businesses automating support with AI.</p>

                <button className="cta-mega-button" onClick={() => navigate('/deploy-agent')}>
                    <span className="cta-btn-text">
                        Deploy Your Agent Now
                    </span>
                    <svg className="cta-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>

                <div className="cta-trust">
                    <div className="trust-badge"><span>No credit card required</span></div>
                    <div className="trust-badge"><span>Setup in 60 seconds</span></div>
                </div>
            </div>
        </section>
    );
};

export default CTA;