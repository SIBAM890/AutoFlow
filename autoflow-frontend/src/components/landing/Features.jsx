import React, { useState, useEffect, useRef } from 'react';

const Features = () => {
    const [activeTab, setActiveTab] = useState('intelligent');
    const canvasRef = useRef(null);

    useEffect(() => {
        // Only run canvas logic if on the 'intelligent' tab (Particles)
        if (activeTab === 'intelligent' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            let particles = [];
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Simple particle logic just for visual compatibility
                particles.forEach((p, i) => {
                    p.x += p.speed;
                    ctx.fillStyle = `rgba(0, 217, 255, ${1 - p.x / 200})`;
                    ctx.fillRect(p.x, p.y, 2, 2);
                    if (p.x > 200) particles.splice(i, 1);
                });
                if (Math.random() > 0.9) particles.push({ x: 0, y: Math.random() * canvas.height, speed: 2 });
                requestAnimationFrame(animate);
            };
            animate();
        }
    }, [activeTab]);

    return (
        <section className="features-section" id="features">
            <div className="features-container">
                <h2 className="features-headline">The magic behind AgentFlow</h2>

                <div className="feature-tabs">
                    <button className={`feature-tab ${activeTab === 'intelligent' ? 'active' : ''}`} onClick={() => setActiveTab('intelligent')}>
                        <span className="tab-label">Intelligent Responses</span>
                    </button>
                    <button className={`feature-tab ${activeTab === 'workflow' ? 'active' : ''}`} onClick={() => setActiveTab('workflow')}>
                        <span className="tab-label">Workflow Builder</span>
                    </button>
                    <button className={`feature-tab ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('monitoring')}>
                        <span className="tab-label">Real-time Monitoring</span>
                    </button>
                </div>

                <div className="feature-content-wrapper">
                    {activeTab === 'intelligent' && (
                        <div className="feature-content active">
                            <div className="feature-text">
                                <h3 className="feature-title">Real understanding.</h3>
                                <p className="feature-description">Context, intent, and nuance—just like a human.</p>
                            </div>
                            <div className="feature-demo">
                                <div className="intent-demo">
                                    <div className="intent-result">
                                        <div className="result-text"><div className="result-value">ORDER_TRACKING</div></div>
                                        <div className="result-confidence">98% confidence</div>
                                    </div>
                                    <canvas ref={canvasRef} className="intent-particles" style={{ width: '100%', height: '200px' }}></canvas>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'workflow' && (
                        <div className="feature-content active">
                            <div className="feature-text">
                                <h3 className="feature-title">Visual workflow editor</h3>
                                <p className="feature-description">Drag, drop, connect. No code needed.</p>
                            </div>
                            <div className="feature-demo">
                                <div className="workflow-demo">
                                    {/* SVG Demo placeholders */}
                                    <div style={{ textAlign: 'center', color: '#fff', paddingTop: '100px' }}>Workflow Editor Preview</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'monitoring' && (
                        <div className="feature-content active">
                            <div className="feature-text">
                                <h3 className="feature-title">Complete control</h3>
                                <p className="feature-description">Real-time analytics and monitoring.</p>
                            </div>
                            <div className="feature-demo">
                                <div className="monitoring-demo">
                                    <div className="monitor-stats">
                                        <div className="monitor-stat"><div className="stat-value">47</div><div className="stat-label">Active Chats</div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Features;