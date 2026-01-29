import React, { useEffect, useState, useRef } from 'react';

const HowItWorks = () => {
    const [typedText, setTypedText] = useState("");
    const [isStep1Visible, setIsStep1Visible] = useState(false);
    const [isStep2Visible, setIsStep2Visible] = useState(false);
    const [isStep3Visible, setIsStep3Visible] = useState(false);
    const [counter, setCounter] = useState(0);

    const step1Ref = useRef(null);
    const step2Ref = useRef(null);
    const step3Ref = useRef(null);

    // Intersection Observer to trigger animations
    useEffect(() => {
        const observerOptions = { threshold: 0.3 };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.id === 'step-1') setIsStep1Visible(true);
                    if (entry.target.id === 'step-2') setIsStep2Visible(true);
                    if (entry.target.id === 'step-3') setIsStep3Visible(true);
                }
            });
        }, observerOptions);

        if (step1Ref.current) observer.observe(step1Ref.current);
        if (step2Ref.current) observer.observe(step2Ref.current);
        if (step3Ref.current) observer.observe(step3Ref.current);

        return () => observer.disconnect();
    }, []);

    // Step 1: Typing Animation
    useEffect(() => {
        if (isStep1Visible && typedText === "") {
            const fullText = "Handle order tracking questions, process refunds automatically, and answer FAQs about shipping and returns";
            let index = 0;
            const interval = setInterval(() => {
                setTypedText(fullText.slice(0, index));
                index++;
                if (index > fullText.length) clearInterval(interval);
            }, 30); // Slightly faster typing for better feel
            return () => clearInterval(interval);
        }
    }, [isStep1Visible, typedText]); // Added typedText to dependency array to prevent re-typing if already typed

    // Step 3: Counter Animation
    useEffect(() => {
        if (isStep3Visible) {
            let start = 0;
            const end = 47;
            const duration = 2000;
            const increment = end / (duration / 16);

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCounter(end);
                    clearInterval(timer);
                } else {
                    setCounter(Math.floor(start));
                }
            }, 16);
            return () => clearInterval(timer);
        }
    }, [isStep3Visible]);

    return (
        <section className="how-it-works-section" id="how-it-works">
            <div className="how-container">
                <h2 className="how-headline">How it works</h2>
                <p className="how-subheadline">Three steps. Sixty seconds. Zero complexity.</p>

                {/* Step 1: Describe */}
                <div id="step-1" ref={step1Ref} className={`how-step flex flex-col md:flex-row items-center gap-16 md:gap-32 mb-32 ${isStep1Visible ? 'visible' : ''}`} data-step="1">
                    {/* Left: Content */}
                    <div className="step-content flex-1 text-left">
                        <div className="step-number text-[#0F392B] text-8xl font-black mb-4 opacity-80" style={{ fontFamily: 'Inter, sans-serif' }}>01</div>
                        <h3 className="step-title text-[3.5rem] font-bold text-white mb-5 leading-[1.1] tracking-tight">
                            Just describe <br />
                            what you need
                        </h3>
                        <p className="step-description text-lg text-gray-400 leading-relaxed max-w-md">
                            Tell us in plain English what your agent should do. No technical knowledge required.
                        </p>
                    </div>

                    {/* Right: Visual */}
                    <div className="step-visual flex-1 w-full max-w-lg">
                        <div className="fake-input-container p-8 rounded-2xl bg-[#09090B] border border-white/5 relative overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-transform duration-500">

                            {/* Input Area */}
                            <div className="fake-input-header mb-3">
                                <span className="input-label text-[13px] text-gray-400 font-medium block">What should your agent do?</span>
                            </div>
                            <div className="fake-input-body bg-[#151518] p-4 rounded-xl border border-white/5 min-h-[120px] mb-6 flex items-start shadow-inner">
                                <span className="typed-text text-gray-200 text-[15px] leading-relaxed font-light">{typedText}</span><span className="cursor text-emerald-400 ml-1">|</span>
                            </div>

                            {/* Glowing 'Generate Agent' Button */}
                            <div className="generate-btn-container relative group cursor-pointer inline-block">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-400 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-500 ease-out"></div>
                                <button className="relative px-6 py-3 bg-[#10B981] rounded-lg flex items-center gap-2.5 text-white font-bold text-sm shadow-xl transform group-active:scale-[0.98] transition-all duration-200">
                                    <span>Generate Agent</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Step 2: AI Builds */}
                <div id="step-2" ref={step2Ref} className={`how-step flex flex-col md:flex-row-reverse items-center gap-16 md:gap-32 mb-32 ${isStep2Visible ? 'visible' : ''}`} data-step="2">
                    {/* Visual (Left/Right depending on row-reverse) */}
                    <div className="step-visual flex-1 w-full max-w-lg">
                        <div className="workflow-builder p-8 rounded-2xl bg-[#09090B] border border-white/5 relative overflow-hidden shadow-2xl h-[320px] transform hover:scale-[1.01] transition-transform duration-500">
                            <div className="builder-header flex items-center justify-between mb-8">
                                <div className="builder-status flex items-center gap-2.5">
                                    <div className="status-dot w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Building workflow...</span>
                                </div>
                                <div className="builder-progress w-28 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="progress-bar w-full h-full bg-gradient-to-r from-emerald-500 to-green-400 animate-[progress_2s_ease-in-out_infinite]"></div>
                                </div>
                            </div>
                            <div className="builder-canvas relative h-full w-full">
                                {/* Simplified representation of nodes appearing - Conditional Animation */}
                                <div className={`build-node absolute px-5 py-2.5 bg-[#1A1A1A] border border-white/10 rounded-xl text-xs font-medium text-white shadow-xl ${isStep2Visible ? 'animate-[fadeInUp_0.5s_0.2s_both]' : 'opacity-0'}`} data-node="1" style={{ top: '15%', left: '10%' }}><span>Receive</span></div>
                                <div className={`build-node absolute px-5 py-2.5 bg-[#1A1A1A] border border-white/10 rounded-xl text-xs font-medium text-white shadow-xl ${isStep2Visible ? 'animate-[fadeInUp_0.5s_0.6s_both]' : 'opacity-0'}`} data-node="2" style={{ top: '15%', left: '45%' }}><span>Analysis</span></div>
                                <div className={`build-node absolute px-5 py-2.5 bg-[#1A1A1A] border border-white/10 rounded-xl text-xs font-medium text-white shadow-xl ${isStep2Visible ? 'animate-[fadeInUp_0.5s_1.0s_both]' : 'opacity-0'}`} data-node="5" style={{ top: '35%', left: '75%' }}><span>Send</span></div>
                                <svg className="build-connections absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path className="build-line" data-line="1" d="M 15 28.5 L 45 28.5" stroke="#10B981" strokeWidth="0.5" fill="none" strokeDasharray="2" className="animate-[dash_1s_linear_infinite]" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="step-content flex-1 text-left">
                        <div className="step-number text-[#0F392B] text-8xl font-black mb-4 opacity-80" style={{ fontFamily: 'Inter, sans-serif' }}>02</div>
                        <h3 className="step-title text-[3.5rem] font-bold text-white mb-5 leading-[1.1] tracking-tight">
                            AI builds your <br />
                            workflow
                        </h3>
                        <p className="step-description text-lg text-gray-400 leading-relaxed max-w-md">
                            Watch as our AI automatically creates a custom workflow tailored to your needs.
                        </p>
                    </div>
                </div>

                {/* Step 3: Goes Live */}
                <div id="step-3" ref={step3Ref} className={`how-step flex flex-col md:flex-row items-center gap-16 md:gap-32 ${isStep3Visible ? 'visible' : ''}`} data-step="3">
                    {/* Content */}
                    <div className="step-content flex-1 text-left">
                        <div className="step-number text-[#0F392B] text-8xl font-black mb-4 opacity-80" style={{ fontFamily: 'Inter, sans-serif' }}>03</div>
                        <h3 className="step-title text-[3.5rem] font-bold text-white mb-5 leading-[1.1] tracking-tight">
                            Go live <br />
                            instantly
                        </h3>
                        <p className="step-description text-lg text-gray-400 leading-relaxed max-w-md">
                            Start handling customer queries immediately. Zero delay, handled autonomously.
                        </p>
                    </div>

                    {/* Visual */}
                    <div className="step-visual flex-1 w-full max-w-lg">
                        <div className="live-demo-container p-8 rounded-2xl bg-[#09090B] border border-white/5 relative overflow-hidden shadow-2xl h-[320px] flex flex-col transform hover:scale-[1.01] transition-transform duration-500">
                            <div className="live-header flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                <div className="live-status flex items-center gap-2.5">
                                    <div className="live-dot w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Agent Live</span>
                                </div>
                                <div className="live-counter flex flex-col items-end">
                                    <span className="counter-number text-2xl font-bold text-white leading-none">{counter}</span>
                                    <span className="counter-label text-[10px] uppercase text-gray-500 font-semibold tracking-wider">queries handled</span>
                                </div>
                            </div>
                            <div className="live-phone flex-1 relative overflow-hidden">
                                <div className="live-chat-area space-y-4 pt-2">
                                    <div className={`live-message live-msg-in bg-[#1A1A1A] text-gray-200 text-sm p-3 rounded-2xl rounded-tl-none max-w-[80%] ${isStep3Visible ? 'animate-[fadeInRight_0.4s_both]' : 'opacity-0'}`} data-live-msg="1">
                                        Track order #5432
                                    </div>
                                    <div className={`live-message live-msg-out bg-emerald-500/10 text-emerald-300 text-sm p-3 rounded-2xl rounded-tr-none max-w-[80%] ml-auto border border-emerald-500/20 ${isStep3Visible ? 'animate-[fadeInLeft_0.4s_1.5s_both]' : 'opacity-0'}`} data-live-msg="2">
                                        <span className="text-[10px] font-bold bg-emerald-500 text-[#09090B] px-1.5 py-0.5 rounded mr-2 align-middle inline-block">AI</span>
                                        Out for delivery!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;