import React from 'react';

const Comparison = () => {
    return (
        <section className="comparison-section py-24 relative">
            <div className="comparison-container max-w-6xl mx-auto px-4">
                <h2 className="comparison-headline text-center text-4xl font-bold mb-16">
                    Stop drowning in support messages
                </h2>

                <div className="split-comparison flex flex-col md:flex-row gap-8 items-stretch justify-center relative">

                    {/* Left: Chaos (Current Reality) */}
                    <div className="comparison-side chaos-side flex-1 bg-[#0F0F0F] rounded-3xl border border-red-500/20 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                        <div className="side-label flex items-center gap-3 mb-8">
                            <div className="icon-box w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                            </div>
                            <span className="label-text text-xl font-semibold text-white">Current Reality</span>
                        </div>

                        <div className="chaos-container space-y-4">
                            {/* Notification 1 */}
                            <div className="notification-item bg-[#1A1A1A] border border-white/5 p-4 rounded-xl flex items-start justify-between">
                                <div className="notif-content flex gap-3">
                                    <div className="notif-icon mt-1 text-red-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                    </div>
                                    <div>
                                        <div className="notif-name text-sm font-semibold text-white mb-0.5">Rahul K.</div>
                                        <div className="notif-msg text-sm text-gray-400">Where is my order?</div>
                                    </div>
                                </div>
                                <span className="notif-time text-xs text-gray-600">2h ago</span>
                            </div>

                            {/* Notification 2 */}
                            <div className="notification-item bg-[#1A1A1A] border border-white/5 p-4 rounded-xl flex items-start justify-between">
                                <div className="notif-content flex gap-3">
                                    <div className="notif-icon mt-1 text-red-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                    </div>
                                    <div>
                                        <div className="notif-name text-sm font-semibold text-white mb-0.5">Priya S.</div>
                                        <div className="notif-msg text-sm text-gray-400">Refund needed ASAP!</div>
                                    </div>
                                </div>
                                <span className="notif-time text-xs text-gray-600">3h ago</span>
                            </div>

                            <div className="notification-badge bg-red-500/10 text-red-400 text-xs font-medium py-2 px-3 rounded-lg text-center border border-red-500/10">
                                +47 other chats waiting
                            </div>

                            <div className="metrics-row grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                                <div className="chaos-metric bg-[#151515] p-4 rounded-xl border border-white/5">
                                    <div className="metric-icon text-red-500 mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    </div>
                                    <div className="metric-value text-xl font-bold text-white">2-4 hrs</div>
                                    <div className="metric-label text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-1">Response Time</div>
                                </div>
                                <div className="chaos-metric bg-[#151515] p-4 rounded-xl border border-white/5">
                                    <div className="metric-icon text-red-500 mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                    </div>
                                    <div className="metric-value text-xl font-bold text-white">₹15k/mo</div>
                                    <div className="metric-label text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-1">Support Cost</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* VS Badge (Center) */}
                    <div className="comparison-divider absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center">
                        <div className="vs-badge w-12 h-12 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-xs font-bold text-gray-500 shadow-xl">
                            VS
                        </div>
                    </div>

                    {/* Right: Solution (With AgentFlow) */}
                    <div className="comparison-side solution-side flex-1 bg-[#091210] rounded-3xl border border-emerald-500/20 p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                        <div className="side-label flex items-center gap-3 mb-8">
                            <div className="icon-box w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                            </div>
                            <span className="label-text text-xl font-semibold text-white">With AgentFlow</span>
                        </div>

                        <div className="solution-container space-y-4">
                            {/* Resolved 1 */}
                            <div className="resolved-item bg-[#0F1C18] border border-emerald-500/10 p-4 rounded-xl flex items-start justify-between group hover:border-emerald-500/30 transition-colors">
                                <div className="resolved-content flex gap-3">
                                    <div className="resolved-icon mt-1 text-emerald-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    </div>
                                    <div>
                                        <div className="resolved-name text-sm font-semibold text-white mb-0.5">Rahul K.</div>
                                        <div className="resolved-msg text-sm text-gray-400">Order status sent</div>
                                    </div>
                                </div>
                                <span className="resolved-time text-xs text-emerald-400/80 font-mono">2.3s</span>
                            </div>

                            {/* Resolved 2 */}
                            <div className="resolved-item bg-[#0F1C18] border border-emerald-500/10 p-4 rounded-xl flex items-start justify-between group hover:border-emerald-500/30 transition-colors">
                                <div className="resolved-content flex gap-3">
                                    <div className="resolved-icon mt-1 text-emerald-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    </div>
                                    <div>
                                        <div className="resolved-name text-sm font-semibold text-white mb-0.5">Priya S.</div>
                                        <div className="resolved-msg text-sm text-gray-400">Refund processed</div>
                                    </div>
                                </div>
                                <span className="resolved-time text-xs text-emerald-400/80 font-mono">1.8s</span>
                            </div>

                            <div className="happy-customers flex items-center gap-3 py-2 px-1">
                                <div className="avatar-group flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-700 border border-[#0F1C18] flex items-center justify-center text-[10px] text-white font-bold">S</div>
                                    <div className="w-6 h-6 rounded-full bg-gray-600 border border-[#0F1C18] flex items-center justify-center text-[10px] text-white font-bold">A</div>
                                    <div className="w-6 h-6 rounded-full bg-gray-500 border border-[#0F1C18] flex items-center justify-center text-[10px] text-white font-bold">M</div>
                                    <div className="w-6 h-6 rounded-full bg-emerald-500 border border-[#0F1C18] flex items-center justify-center text-[10px] text-white font-bold">+1k</div>
                                </div>
                                <span className="text-sm text-gray-400">Delighted customers</span>
                            </div>

                            <div className="metrics-row grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-emerald-500/10">
                                <div className="solution-metric bg-[#0C1614] p-4 rounded-xl border border-emerald-500/20">
                                    <div className="metric-icon text-emerald-400 mb-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                                    </div>
                                    <div className="metric-value text-xl font-bold text-white">2.3 secs</div>
                                    <div className="metric-label text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-1">Response Time</div>
                                </div>
                                <div className="solution-metric bg-[#0C1614] p-4 rounded-xl border border-emerald-500/20">
                                    <div className="metric-icon text-emerald-400 mb-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12" /><path d="M2 7h20v5H2z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>
                                    </div>
                                    <div className="metric-value text-xl font-bold text-white">₹0/mo</div>
                                    <div className="metric-label text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-1">Support Cost</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Comparison;