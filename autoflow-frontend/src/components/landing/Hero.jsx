import React, { useEffect } from 'react';

const Hero = () => {
    useEffect(() => {
        // --- Animation Sequence Logic ---
        const sequence = [
            { time: 500, id: 'msg1', action: 'showMsg' },
            { time: 600, id: 'node-trigger', action: 'activateNode' },
            { time: 800, id: 'stat-query', action: 'showBadge' },

            // Processing...
            {
                time: 1200, action: () => {
                    deactivateNode('node-trigger');
                    activateNode('node-intent');
                    activateLine('line-1');
                }
            },
            { time: 1400, id: 'stat-confidence', action: 'showBadge' },

            // Database...
            {
                time: 1800, action: () => {
                    deactivateNode('node-intent');
                    activateNode('node-database');
                    activateLine('line-2');
                }
            },

            // Formatting...
            {
                time: 2200, action: () => {
                    deactivateNode('node-database');
                    activateNode('node-format');
                    activateLine('line-3');
                }
            },

            // Sending...
            {
                time: 2600, action: () => {
                    deactivateNode('node-format');
                    activateNode('node-send');
                    activateLine('line-4');
                }
            },
            { time: 2800, id: 'stat-response', action: 'showBadge' },

            // Response Arrives
            {
                time: 3000, action: () => {
                    showMessage('msg2');
                    deactivateNode('node-send');
                    showBadge('stat-automated');
                }
            },

            // Cleanup first batch
            {
                time: 3500, action: () => {
                    hideBadge('stat-query');
                    hideBadge('stat-confidence');
                }
            },

            // Second Message (Refund)
            { time: 4000, id: 'msg3', action: 'showMsg' },
            { time: 4100, id: 'node-trigger', action: 'activateNode' },

            // Fast process for second msg
            {
                time: 4500, action: () => {
                    deactivateNode('node-trigger');
                    activateNode('node-intent');
                }
            },
            {
                time: 4900, action: () => {
                    deactivateNode('node-intent');
                    activateNode('node-database');
                }
            },
            {
                time: 5300, action: () => {
                    deactivateNode('node-database');
                    activateNode('node-format');
                }
            },

            // Typing indicator
            {
                time: 5500, action: () => {
                    showTyping();
                    deactivateNode('node-format');
                    activateNode('node-send');
                }
            },

            // Final Response
            {
                time: 7000, action: () => {
                    hideTyping();
                    showMessage('msg4');
                    deactivateNode('node-send');
                }
            },

            // Final Cleanup
            {
                time: 7500, action: () => {
                    hideBadge('stat-response');
                    hideBadge('stat-automated');
                }
            },

            // Loop
            { time: 10000, action: 'reset' }
        ];

        let timeouts = [];

        const runSequence = () => {
            sequence.forEach(step => {
                const t = setTimeout(() => {
                    if (step.action === 'showMsg') showMessage(step.id);
                    else if (step.action === 'activateNode') activateNode(step.id);
                    else if (step.action === 'showBadge') showBadge(step.id);
                    else if (step.action === 'reset') resetSequence();
                    else if (typeof step.action === 'function') step.action();
                }, step.time);
                timeouts.push(t);
            });
        };

        // --- Helper Functions ---
        const showMessage = (id) => {
            const el = document.getElementById(id);
            if (el) el.style.animation = 'messageAppear 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        };

        const showTyping = () => {
            const el = document.getElementById('typing');
            if (el) {
                el.style.opacity = '1';
                el.style.animation = 'messageAppear 0.3s ease forwards';
            }
        };

        const hideTyping = () => {
            const el = document.getElementById('typing');
            if (el) el.style.opacity = '0';
        };

        const activateNode = (id) => document.getElementById(id)?.classList.add('active');
        const deactivateNode = (id) => document.getElementById(id)?.classList.remove('active');

        const activateLine = (id) => {
            const line = document.getElementById(id);
            if (line) {
                line.classList.add('active');
                setTimeout(() => line.classList.remove('active'), 800);
            }
        };

        const showBadge = (id) => {
            const el = document.getElementById(id);
            if (el) { el.classList.remove('hide'); el.classList.add('show'); }
        };

        const hideBadge = (id) => {
            const el = document.getElementById(id);
            if (el) { el.classList.remove('show'); el.classList.add('hide'); }
        };

        const resetSequence = () => {
            ['msg1', 'msg2', 'msg3', 'msg4'].forEach(id => {
                const el = document.getElementById(id);
                if (el) { el.style.opacity = '0'; el.style.animation = 'none'; }
            });
            hideTyping();
            document.querySelectorAll('.workflow-node').forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.stat-badge').forEach(b => {
                b.classList.remove('show', 'hide');
                b.style.opacity = '0';
            });
            timeouts.push(setTimeout(runSequence, 100));
        };

        // Start
        runSequence();

        // Cleanup on unmount
        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <section className="hero relative z-10">
            <div className="hero-container">
                {/* Left Side: Content */}
                <div className="hero-content">
                    <h1 className="hero-headline font-bold text-6xl mb-6 leading-tight">
                        Deploy <span className="gradient-text">AI agents</span> that actually understand your customers
                    </h1>
                    <p className="hero-subheadline text-xl text-gray-400 mb-10 leading-relaxed">
                        From prompt to live WhatsApp agent in 60 seconds. No code, no setup, no bullshit.
                    </p>

                    {/* CTA Button */}
                    <div className="cta-container mb-10">
                        <button className="cta-button">
                            <span className="cta-text">Build Your First Agent</span>
                            <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                        <p className="cta-subtext mt-3 text-sm text-gray-500">Free • No credit card required</p>
                    </div>

                    {/* Trust Indicators (With Green Checkmarks) */}
                    <div className="trust-indicators flex flex-wrap gap-6">
                        <div className="trust-item flex items-center gap-2 text-sm text-gray-300">
                            <svg className="trust-check text-emerald-400 w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                            </svg>
                            <span>1000+ queries automated daily</span>
                        </div>
                        <div className="trust-item flex items-center gap-2 text-sm text-gray-300">
                            <svg className="trust-check text-emerald-400 w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                            </svg>
                            <span>2.3s avg response time</span>
                        </div>
                        <div className="trust-item flex items-center gap-2 text-sm text-gray-300">
                            <svg className="trust-check text-emerald-400 w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                            </svg>
                            <span>24/7 uptime</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Demo & Phone */}
                <div className="hero-demo relative flex justify-center items-center min-h-[600px]" style={{ perspective: '1000px' }}>

                    {/* 1. Background Glow - The "Soul" of the visual */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[600px] bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none -z-10"></div>

                    {/* Workflow Visualization Background (Restored) */}
                    <div className="workflow-bg absolute w-[150%] h-full left-[-25%] pointer-events-none blur-[0.5px] opacity-90">
                        {/* Nodes */}
                        {['trigger', 'intent', 'database', 'format', 'send'].map(type => (
                            <div key={type} className="workflow-node" id={`node-${type}`} data-label={type}>
                                <div className="node-content">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><circle cx="12" cy="12" r="10" /></svg>
                                </div>
                                <span className="node-label">{type.toUpperCase()}</span>
                            </div>
                        ))}

                        {/* Connection Lines */}
                        <svg className="workflow-connections" viewBox="0 0 600 400">
                            <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{ stopColor: '#0066FF', stopOpacity: 0 }} />
                                    <stop offset="50%" style={{ stopColor: '#00D9FF', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#0066FF', stopOpacity: 0 }} />
                                </linearGradient>
                            </defs>
                            <path id="line-1" className="workflow-line-path" d="M 50 40 L 90 90" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                            <path id="line-2" className="workflow-line-path" d="M 90 120 L 60 220" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                            <path id="line-3" className="workflow-line-path" d="M 80 260 L 140 310" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                            <path id="line-4" className="workflow-line-path" d="M 160 330 Q 300 380 540 320" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                        </svg>
                    </div>

                    {/* Floating Badges (Restored) */}
                    <div className="floating-stats">
                        <div className="stat-badge" id="stat-response">⚡ Response in 2.3s</div>
                        <div className="stat-badge" id="stat-confidence">🤖 AI Confidence: 98%</div>
                        <div className="stat-badge" id="stat-automated">✓ Automated</div>
                        <div className="stat-badge" id="stat-query">💬 Query #47 today</div>
                    </div>

                    {/* 2. Phone Container with 3D Tilt & Float Animation */}
                    <div className="phone-mockup relative z-10 animate-float" style={{ transformStyle: 'preserve-3d' }}>
                        <div className="phone-frame bg-[#121212] rounded-[45px] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] border-[6px] border-[#2a2a2a] w-[300px] h-[600px] relative overflow-hidden">

                            {/* Screen Reflection (Glass effect) */}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-50 rounded-[40px]"></div>

                            {/* Notch */}
                            <div className="phone-notch absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1a1a1a] rounded-b-xl z-20"></div>

                            {/* WhatsApp Interface (Keep your existing inner content here) */}
                            <div className="whatsapp-interface w-full h-full bg-[#0B141A] rounded-[34px] overflow-hidden flex flex-col">
                                {/* Header */}
                                <div className="wa-header bg-[#075E54] p-4 pt-11 flex items-center gap-3">
                                    <div className="wa-back text-white"><svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg></div>
                                    <div className="wa-avatar w-9 h-9 bg-gradient-to-br from-[#10B981] to-[#34D399] rounded-full flex items-center justify-center font-bold text-sm text-white">T</div>
                                    <div className="wa-contact flex-1 flex flex-col">
                                        <span className="wa-name text-white font-medium text-sm">TechStore</span>
                                        <span className="wa-status text-xs text-white/70">online</span>
                                    </div>
                                </div>

                                {/* Chat Area */}
                                <div className="wa-chat flex-1 p-3 flex flex-col gap-2 overflow-hidden bg-[url('/chat-bg.png')] bg-opacity-5 relative">
                                    {/* Message 1 */}
                                    <div className="wa-message wa-message-received" id="msg1">
                                        <div className="wa-bubble">Hi, I need help with order #12345<span className="wa-time">10:30 AM</span></div>
                                    </div>
                                    {/* Message 2 */}
                                    <div className="wa-message wa-message-sent" id="msg2">
                                        <div className="wa-bubble"><div className="wa-ai-badge">AI</div>I found your order. It arrives at 3 PM.<span className="wa-time">10:30 AM</span></div>
                                    </div>
                                    {/* Message 3 */}
                                    <div className="wa-message wa-message-received" id="msg3">
                                        <div className="wa-bubble">Can I change address?<span className="wa-time">10:31 AM</span></div>
                                    </div>
                                    {/* Typing Indicator */}
                                    <div className="wa-typing" id="typing">
                                        <div className="wa-bubble">
                                            <div className="typing-dots"><span></span><span></span><span></span></div>
                                        </div>
                                    </div>
                                    {/* Message 4 */}
                                    <div className="wa-message wa-message-sent" id="msg4">
                                        <div className="wa-bubble"><div className="wa-ai-badge">AI</div>Updated! Driver notified.<span className="wa-time">10:31 AM</span></div>
                                    </div>
                                </div>

                                {/* Input Bar */}
                                <div className="wa-input-bar p-2 flex gap-2 items-center bg-[#202C33]">
                                    <div className="wa-input-container flex-1 bg-[#2A3942] rounded-full px-4 py-2">
                                        <input type="text" placeholder="Type a message" disabled className="bg-transparent border-none outline-none text-sm text-white w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Bottom Shadow/Glow (Crucial for grounding the 3D object) */}
                        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-[80%] h-[40px] bg-emerald-500/30 blur-2xl rounded-[100%]"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;