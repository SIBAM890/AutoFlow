import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    // Add a background blur effect when scrolling down
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                <Link to="/" className="nav-brand">
                    {/* Ensure logo.png is in your public/ folder */}
                    <img src="/logo.png" alt="AutoFlow Logo" className="logo-img" />
                    <span className="logo-text">AutoFlow</span>
                </Link>

                <div className="nav-links">
                    {/* Use standard anchors for page sections */}
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#how-it-works" className="nav-link">How it Works</a>

                    {/* Use React Router Link for internal page navigation */}
                    <Link to="/dashboard">
                        <button className="nav-btn">Login</button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;