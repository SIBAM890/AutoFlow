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

        // --- Helper Functions (Updated for Tailwind) ---
        const showMessage = (id) => {
            const el = document.getElementById(id);
            if (el) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        };

        const showTyping = () => {
            const el = document.getElementById('typing');
            if (el) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        };

        const hideTyping = () => {
            const el = document.getElementById('typing');
            if (el) el.style.opacity = '0';
        };

        const activateNode = (id) => document.getElementById(id)?.setAttribute('data-active', 'true');
        const deactivateNode = (id) => document.getElementById(id)?.setAttribute('data-active', 'false');

        const activateLine = (id) => {
            const line = document.getElementById(id);
            if (line) {
                line.style.opacity = '1';
                line.style.strokeDashoffset = '0';
                const t = setTimeout(() => {
                    line.style.opacity = '0.4';
                    line.style.strokeDashoffset = '100'; // Reset mostly
                }, 800);
                timeouts.push(t);
            }
        };

        const showBadge = (id) => {
            const el = document.getElementById(id);
            if (el) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0) scale(1)';
            }
        };

        const hideBadge = (id) => {
            const el = document.getElementById(id);
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(-10px) scale(0.95)';
            }
        };

        const resetSequence = () => {
            ['msg1', 'msg2', 'msg3', 'msg4'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(20px)';
                }
            });
            hideTyping();
            document.querySelectorAll('.workflow-node').forEach(n => n.setAttribute('data-active', 'false'));
            document.querySelectorAll('.stat-badge').forEach(b => {
                b.style.opacity = '0';
                b.style.transform = 'translateY(10px) scale(0.9)';
            });
            const t = setTimeout(runSequence, 100);
            timeouts.push(t);
        };

        // Start
        runSequence();

        // Cleanup on unmount
        return () => {
            timeouts.forEach(clearTimeout);
            timeouts = [];
        };
    }, []);

    return (
        <section className="relative z-10 min-h-[90vh] flex items-center py-20 px-6 overflow-hidden">
            <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                {/* Left Side: Content */}
                <div className="max-w-xl">
                    <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight text-white">
                        Deploy <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-purple-500 animate-gradient-slow">AI agents</span> that actually understand your customers
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 leading-relaxed font-light">
                        From prompt to live WhatsApp agent in 60 seconds. No code, no setup, no bullshit.
                    </p>

                    {/* CTA Button */}
                    <div className="mb-10">
                        <button className="group relative inline-flex items-center gap-3 px-10 py-4 text-lg font-semibold text-white bg-gradient-to-br from-primary to-secondary border border-white/20 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_50px_rgba(16,185,129,0.5)] active:translate-y-0 active:scale-95">
                            {/* Shine Effect */}
                            <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-500 ease-in-out"></span>

                            <span className="relative z-10">Build Your First Agent</span>
                            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                        <p className="mt-3 text-sm text-gray-500">Free • No credit card required</p>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap gap-6">
                        {['1000+ queries automated daily', '2.3s avg response time', '24/7 uptime'].map((text, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                <svg className="text-primary w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                </svg>
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Demo & Phone */}
                <div className="relative flex justify-center items-center min-h-[600px] perspective-[1000px]">

                    {/* 1. Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[600px] bg-primary/20 blur-[100px] rounded-full pointer-events-none -z-10"></div>

                    {/* Workflow Visualization */}
                    <div className="absolute w-[150%] h-full -left-1/4 pointer-events-none blur-[0.5px] opacity-90">
                        {/* Nodes */}
                        {[
                            { id: 'trigger', label: 'TRIGGER', top: '5%', left: '-5%' },
                            { id: 'intent', label: 'INTENT', top: '25%', left: '0%' },
                            { id: 'database', label: 'DATABASE', top: '60%', left: '-5%' },
                            { id: 'format', label: 'FORMAT', top: '80%', left: '10%' },
                            { id: 'send', label: 'SEND', top: '75%', right: '0%' },
                        ].map(node => (
                            <div
                                key={node.id}
                                id={`node-${node.id}`}
                                className="absolute flex flex-col items-center gap-2 opacity-60 transition-all duration-300 data-[active=true]:opacity-100 data-[active=true]:scale-110 data-[active=true]:drop-shadow-[0_0_15px_rgba(16,185,129,0.6)] workflow-node"
                                style={{ top: node.top, left: node.left, right: node.right }}
                            >
                                <div className="w-14 h-14 bg-primary/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 data-[active=true]:bg-primary/20 data-[active=true]:border-primary node-content">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-accent"><circle cx="12" cy="12" r="10" /></svg>
                                </div>
                                <span className="text-[10px] font-medium text-gray-400 tracking-wider bg-black/50 px-2 py-0.5 rounded">{node.label}</span>
                            </div>
                        ))}

                        {/* Connection Lines */}
                        <svg className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 600 400">
                            <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
                                    <stop offset="50%" stopColor="#34D399" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path id="line-1" className="transition-all duration-500 opacity-40" d="M 50 40 L 90 90" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                            <path id="line-2" className="transition-all duration-500 opacity-40" d="M 90 120 L 60 220" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                            <path id="line-3" className="transition-all duration-500 opacity-40" d="M 80 260 L 140 310" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                            <path id="line-4" className="transition-all duration-500 opacity-40" d="M 160 330 Q 300 380 540 320" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                        </svg>
                    </div>

                    {/* Floating Badges */}
                    <div className="absolute w-full h-full pointer-events-none z-20">
                        <div id="stat-response" className="stat-badge absolute top-[15%] -right-[15%] transition-all duration-500 opacity-0 px-4 py-2 bg-dark-900/90 backdrop-blur-md border border-primary/30 rounded-xl text-sm font-medium text-white shadow-xl translate-y-2">⚡ Response in 2.3s</div>
                        <div id="stat-confidence" className="stat-badge absolute top-[45%] -left-[20%] transition-all duration-500 opacity-0 px-4 py-2 bg-dark-900/90 backdrop-blur-md border border-primary/30 rounded-xl text-sm font-medium text-white shadow-xl translate-y-2">🤖 AI Confidence: 98%</div>
                        <div id="stat-automated" className="stat-badge absolute bottom-[20%] -right-[10%] transition-all duration-500 opacity-0 px-4 py-2 bg-dark-900/90 backdrop-blur-md border border-primary/30 rounded-xl text-sm font-medium text-white shadow-xl translate-y-2">✓ Automated</div>
                        <div id="stat-query" className="stat-badge absolute top-[2%] -left-[15%] transition-all duration-500 opacity-0 px-4 py-2 bg-dark-900/90 backdrop-blur-md border border-primary/30 rounded-xl text-sm font-medium text-white shadow-xl translate-y-2">💬 Query #47 today</div>
                    </div>

                    {/* Phone Mockup with 3D Float */}
                    <div className="relative z-10 animate-phone-float preserve-3d">
                        <div className="w-[300px] h-[600px] bg-dark-800 rounded-[45px] p-3 shadow-2xl border-[6px] border-dark-700 relative overflow-hidden backdrop-blur-xl">

                            {/* Screen Reflection */}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-50 rounded-[40px]"></div>

                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-xl z-20"></div>

                            {/* WhatsApp Interface */}
                            <div className="w-full h-full bg-wa-chat rounded-[34px] overflow-hidden flex flex-col font-sans">
                                {/* Header */}
                                <div className="bg-wa-green p-4 pt-11 flex items-center gap-3">
                                    <div className="text-white"><svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg></div>
                                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center font-bold text-sm text-white">T</div>
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-white font-medium text-sm">TechStore</span>
                                        <span className="text-xs text-white/70">online</span>
                                    </div>
                                </div>

                                {/* Chat Area */}
                                <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden bg-[url('/chat-bg.png')] bg-opacity-5 relative">
                                    {/* Msg 1 */}
                                    <div id="msg1" className="flex justify-start opacity-0 translate-y-4 transition-all duration-300">
                                        <div className="bg-wa-received text-white px-3 py-2 rounded-lg rounded-tl-none text-xs max-w-[85%]">
                                            Hi, I need help with order #12345
                                            <span className="block text-[10px] text-white/50 text-right mt-1">10:30 AM</span>
                                        </div>
                                    </div>
                                    {/* Msg 2 */}
                                    <div id="msg2" className="flex justify-end opacity-0 translate-y-4 transition-all duration-300">
                                        <div className="bg-wa-sent text-white px-3 py-2 rounded-lg rounded-tr-none text-xs max-w-[85%]">
                                            <div className="inline-block px-1.5 py-0.5 bg-gradient-to-r from-primary to-accent rounded text-[9px] font-bold mr-1 align-middle">AI</div>
                                            I found your order. It arrives at 3 PM.
                                            <span className="block text-[10px] text-white/50 text-right mt-1">10:30 AM</span>
                                        </div>
                                    </div>
                                    {/* Msg 3 */}
                                    <div id="msg3" className="flex justify-start opacity-0 translate-y-4 transition-all duration-300">
                                        <div className="bg-wa-received text-white px-3 py-2 rounded-lg rounded-tl-none text-xs max-w-[85%]">
                                            Can I change address?
                                            <span className="block text-[10px] text-white/50 text-right mt-1">10:31 AM</span>
                                        </div>
                                    </div>
                                    {/* Typing */}
                                    <div id="typing" className="flex justify-end opacity-0 transition-opacity duration-300">
                                        <div className="bg-wa-sent px-4 py-3 rounded-lg rounded-tr-none">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></span>
                                                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-75"></span>
                                                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-150"></span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Msg 4 */}
                                    <div id="msg4" className="flex justify-end opacity-0 translate-y-4 transition-all duration-300">
                                        <div className="bg-wa-sent text-white px-3 py-2 rounded-lg rounded-tr-none text-xs max-w-[85%]">
                                            <div className="inline-block px-1.5 py-0.5 bg-gradient-to-r from-primary to-accent rounded text-[9px] font-bold mr-1 align-middle">AI</div>
                                            Updated! Driver notified.
                                            <span className="block text-[10px] text-white/50 text-right mt-1">10:31 AM</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Input Bar */}
                                <div className="p-2 flex gap-2 items-center bg-[#202C33]">
                                    <div className="flex-1 bg-[#2A3942] rounded-full px-4 py-2">
                                        <input type="text" placeholder="Type a message" disabled className="bg-transparent border-none outline-none text-sm text-white w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Shadow */}
                        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-[80%] h-[40px] bg-primary/30 blur-2xl rounded-[100%]"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;