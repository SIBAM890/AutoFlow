// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
import { Send, CheckCircle, Clock, RefreshCw, Smartphone, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { workflowApi } from '../services/workflowApi';

export default function DeployPage() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [qrCode, setQrCode] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isDeploying, setIsDeploying] = useState(true);
    const [statusText, setStatusText] = useState("Initializing Agent...");

    const deployAgent = async () => {
        setIsDeploying(true);
        setStatusText("Linking WhatsApp Bridge...");
        try {
            await workflowApi.deploy();
            // Polling handles the rest
        } catch (err) {
            console.error("Deployment failed", err);
            setStatusText("Deployment initialization failed.");
            setIsDeploying(false);
        }
    };

    useEffect(() => {
        // Start deployment immediately on entry
        deployAgent();
    }, []);

    const isMounted = useRef(true);
    const isConnectedRef = useRef(false);

    useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

    const checkStatus = useCallback(async () => {
        try {
            const data = await workflowApi.getStatus();
            if (!isMounted.current) return;

            if (data.connected) {
                setIsConnected(true);
                isConnectedRef.current = true;
                setQrCode(null);
                setIsDeploying(false);
                setStatusText("Agent Active & Listening");

                setMessages(prev => {
                    if (prev.length === 0) {
                        return [{
                            role: 'bot',
                            text: "🚀 Agent Deployed Successfully!\n\nI am now live and responding to messages on this WhatsApp account using your custom workflow logic.",
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }];
                    }
                    return prev;
                });
            } else if (data.qr) {
                setQrCode(data.qr);
                setIsDeploying(false);
                setStatusText("Scan QR Code to Deploy");
            } else if (!data.connecting && !data.connected && !data.qr) {
                setIsDeploying(false);
                setStatusText("Ready to Deploy");
            }
        } catch (err) {
            if (!isMounted.current) return;
            console.warn("Status check failed", err.message);
            setStatusText("Connecting to server...");
        }
    }, []);

    useEffect(() => {
        let timeoutId;
        const poll = async () => {
            if (isConnectedRef.current || !isMounted.current) return;
            await checkStatus();
            if (!isConnectedRef.current && isMounted.current) {
                timeoutId = setTimeout(poll, 3000);
            }
        };
        poll();
        return () => clearTimeout(timeoutId);
    }, [checkStatus]);

    const handleLogout = async () => {
        if (!confirm("Are you sure? This will disconnect the current WhatsApp session.")) return;
        try {
            await workflowApi.logout();
            setIsConnected(false);
            isConnectedRef.current = false;
            setQrCode(null);
            setIsDeploying(true);
            setMessages([]);
            deployAgent();
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <div className="flex h-screen bg-[#0d0d0d] relative overflow-hidden text-sm">
            {/* Animated Background Line */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 via-amber-500 to-purple-500 animate-pulse z-50 opacity-40"></div>

            {/* Back Button */}
            <button
                onClick={() => navigate('/studio')}
                className="absolute top-8 left-8 z-50 flex items-center gap-2 px-5 py-2.5 bg-[#252526] hover:bg-[#2d2d2d] rounded-xl shadow-2xl border border-white/5 text-gray-400 hover:text-white transition-all font-bold group"
            >
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Return to Studio
            </button>

            {/* Left Column: Phone & QR */}
            <div className="w-1/2 flex flex-col items-center justify-center p-12 bg-[#121212] relative border-r border-white/5">
                   <div className="text-center mb-12 max-w-sm">
                        <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">Production Link</div>
                        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Final Deployment</h1>
                        <p className="text-gray-500 font-medium leading-relaxed">Scan the secure handshake code below to finalize your real-time automation bridge.</p>
                   </div>

                   <div className="relative group">
                        {/* Shadow Glow */}
                        <div className="absolute inset-0 bg-purple-500/5 blur-[100px] rounded-full group-hover:bg-purple-500/10 transition-all duration-1000"></div>
                        
                        {/* iPhone Frame */}
                        <div className="w-[320px] h-[650px] bg-[#1a1a1a] rounded-[55px] p-4 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] relative ring-8 ring-[#252526] pointer-events-auto border border-white/5">
                            {/* Notch */}
                            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-28 h-7 bg-[#1a1a1a] rounded-full z-20 flex items-center justify-center border-b border-white/5">
                                <div className="w-8 h-1 bg-gray-800 rounded-full mb-1"></div>
                            </div>

                            {/* Screen */}
                            <div className="w-full h-full bg-[#0d0d0d] rounded-[42px] overflow-hidden flex flex-col relative border border-white/5">
                                {/* Header */}
                                <div className="bg-[#1e1e1e] px-6 pt-10 pb-4 text-white border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center text-lg border border-purple-500/20">🤖</div>
                                        <div>
                                            <div className="text-[13px] font-black tracking-tight">AutoFlow LeadGen</div>
                                            <div className="text-[9px] text-amber-500/80 font-bold uppercase tracking-widest">
                                                {isConnected ? "● Authenticated" : "Handshaking..."}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Content */}
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0d0d0d]">
                                    {isDeploying && !qrCode && (
                                        <div className="flex flex-col items-center gap-4">
                                            <RefreshCw className="animate-spin text-purple-500" size={32} />
                                            <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">Mounting Session</p>
                                        </div>
                                    )}

                                    {qrCode && !isConnected && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }} 
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white p-5 rounded-[28px] shadow-2xl transition-all"
                                        >
                                            <QRCodeSVG value={qrCode} size={200} />
                                            <div className="mt-5 flex flex-col gap-2">
                                                <div className="flex items-center gap-2 justify-center text-gray-400">
                                                    <Smartphone size={12} />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">Link Production Device</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {isConnected && (
                                        <div className="w-full h-full flex flex-col pt-4">
                                            <div className="flex-1 overflow-y-auto space-y-4 text-left custom-scrollbar pr-2">
                                                {messages.map((msg, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className={clsx(
                                                            "max-w-[90%] px-4 py-3 rounded-2xl text-[12px] shadow-lg relative pb-6 leading-relaxed border border-white/5",
                                                            msg.role === 'bot' ? "bg-[#1e1e1e] text-gray-300 rounded-tl-none border-l-2 border-amber-500" : "ml-auto bg-purple-500/10 text-purple-200 rounded-tr-none border-r-2 border-purple-500"
                                                        )}
                                                    >
                                                        {msg.text}
                                                        <span className="text-[8px] text-gray-500 absolute bottom-1.5 right-3 italic font-black uppercase tracking-widest">{msg.time}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                            <div className="mt-4 p-4 bg-amber-500/5 backdrop-blur-sm rounded-2xl border border-amber-500/10 flex items-center gap-3">
                                                 <CheckCircle size={18} className="text-amber-500/60" />
                                                 <span className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest">Bridge Synchronized</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                   </div>
            </div>

            {/* Right Column: Deployment Progress */}
            <div className="w-1/2 bg-[#0d0d0d] p-24 overflow-y-auto flex flex-col justify-center relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>
                
                <div className="max-w-md mx-auto w-full z-10">
                    <div className="mb-14">
                         <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] text-gray-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4 border border-white/5">
                            Status Cluster
                         </div>
                         <h2 className="text-3xl font-black text-white tracking-tight">System Initialization</h2>
                    </div>

                    <div className="space-y-12 relative border-l border-white/10 pl-10 ml-5">
                        <DeploymentStep 
                            active={true}
                            completed={true}
                            title="Engine Optimization"
                            desc="Workflow logic and AI tools are being uploaded to the high-performance execution cluster."
                        />
                        <DeploymentStep 
                            active={qrCode || isConnected}
                            completed={isConnected}
                            title="WebSocket Handshake"
                            desc="Establishing secure socket connection with WhatsApp multi-device infrastructure."
                        />
                        <DeploymentStep 
                            active={isConnected}
                            completed={isConnected}
                            title="Live Production Mode"
                            desc="The agent is now autonomous. All incoming traffic is being routed to the AI engine."
                        />
                    </div>

                    {isConnected && (
                        <motion.button 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            onClick={handleLogout}
                            className="mt-20 w-full py-4 bg-[#1a1a1b] hover:bg-red-500/10 text-red-500/60 hover:text-red-500 rounded-2xl shadow-2xl border border-white/5 font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Reset Production Session
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
}

const DeploymentStep = ({ active, completed, title, desc }) => (
    <div className={clsx("relative transition-all duration-700", !active && "opacity-20 translate-x-4")}>
        <div className={clsx(
            "absolute -left-[51px] w-10 h-10 rounded-full flex items-center justify-center ring-8 ring-[#0d0d0d] transition-all duration-700 shadow-2xl",
            completed ? "bg-amber-500 text-black" : active ? "bg-[#1e1e1e] text-amber-500 border border-amber-500/40 animate-pulse" : "bg-[#1e1e1e] text-gray-700 border border-white/5"
        )}>
            {completed ? <CheckCircle size={18} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
        </div>
        <div>
            <h3 className={clsx("text-lg font-black tracking-tight mb-1.5", active ? "text-white" : "text-gray-500")}>{title}</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed font-medium">{desc}</p>
        </div>
    </div>
);
