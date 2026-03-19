import { useState, useEffect, useCallback, useRef } from 'react';
import { Send, CheckCircle, Clock, RefreshCw, Smartphone, Rocket } from 'lucide-react';
import { workflowApi } from '../../services/workflowApi';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

export const TestMode = () => {
    // WhatsApp State
    const [qrCode, setQrCode] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [statusText, setStatusText] = useState("Checking session...");
    
    // Chat State — Still used for simulation log internally
    const [executionSteps, setExecutionSteps] = useState([]);

    const isMounted = useRef(true);
    const isConnectedRef = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        checkCurrentStatus();
        return () => { isMounted.current = false; };
    }, []);

    const checkCurrentStatus = async () => {
        try {
            const data = await workflowApi.getStatus();
            if (!isMounted.current) return;

            if (data.connected) {
                setIsConnected(true);
                isConnectedRef.current = true;
                setStatusText("WhatsApp Connected");
            } else if (data.qr) {
                setQrCode(data.qr);
                setStatusText("Scan QR to Test");
            } else {
                setStatusText("Not Connected");
            }
        } catch (err) {
            console.error("Status check failed", err);
        }
    };

    const startSession = async () => {
        setIsConnecting(true);
        setStatusText("Initializing WhatsApp instance...");
        try {
            await workflowApi.deploy();
            // Polling will handle the rest
        } catch (err) {
            setStatusText("Failed to start session");
            setIsConnecting(false);
        }
    };

    const handleLogout = async () => {
        if (!confirm("Stop current testing session?")) return;
        try {
            await workflowApi.logout();
            setIsConnected(false);
            isConnectedRef.current = false;
            setQrCode(null);
            checkCurrentStatus();
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    // Polling logic
    useEffect(() => {
        let timeoutId;
        const poll = async () => {
            if (isConnectedRef.current || !isMounted.current) return;
            
            try {
                const data = await workflowApi.getStatus();
                if (data.connected) {
                    setIsConnected(true);
                    isConnectedRef.current = true;
                    setQrCode(null);
                    setIsConnecting(false);
                } else if (data.qr) {
                    setQrCode(data.qr);
                    setIsConnecting(false);
                }
            } catch (e) {}

            if (!isConnectedRef.current && isMounted.current) {
                timeoutId = setTimeout(poll, 3000);
            }
        };
        poll();
        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div className="flex h-[500px] bg-[#121212] rounded-xl overflow-hidden shadow-2xl border border-white/5">
            {/* Left Column: Phone Connection */}
            <div className="w-1/2 p-8 flex flex-col items-center justify-center bg-[#1e1e1e] border-r border-white/5">
                {!isConnected ? (
                    <div className="text-center flex flex-col items-center">
                        <div className="mb-6 p-5 bg-[#252526] rounded-3xl shadow-xl border border-white/10 ring-1 ring-white/5">
                            {qrCode ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-2 bg-white rounded-xl shadow-lg">
                                        <QRCodeSVG value={qrCode} size={200} />
                                    </div>
                                    <p className="text-[10px] text-amber-500 uppercase tracking-widest font-black">Scan to Link Production Agent</p>
                                </div>
                            ) : (
                                <div className="w-[200px] h-[200px] flex items-center justify-center bg-[#121212] rounded-2xl border border-dashed border-white/10">
                                    {isConnecting ? (
                                        <RefreshCw className="animate-spin text-purple-500" size={40} />
                                    ) : (
                                        <Smartphone className="text-gray-600" size={56} />
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <h4 className="text-xl font-black text-white mb-2">{statusText}</h4>
                        <p className="text-sm text-gray-400 mb-8 max-w-[240px] leading-relaxed">
                            {qrCode ? "Scan this code with WhatsApp to start testing your agent live on your device." : "Connect your device to see the inner workings of the AI engine."}
                        </p>

                        {!qrCode && !isConnecting && (
                            <button
                                onClick={startSession}
                                className="bg-purple-600 text-white px-10 py-4 rounded-2xl hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-purple-900/40 font-black flex items-center gap-3"
                            >
                                <Rocket size={20} className="fill-current" />
                                Initiate Test Bridge
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col p-2">
                        <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-3xl mb-6 flex flex-col items-center text-center">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                <span className="text-green-400 font-black text-xs uppercase tracking-widest">Production Link Active</span>
                            </div>
                            <p className="text-[11px] text-green-300 font-medium leading-relaxed">
                                Your agent is now listening on your WhatsApp number. Open your phone and send a message to starting testing!
                            </p>
                        </div>

                        <div className="flex-1 bg-[#252526] rounded-[40px] p-8 border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center relative group">
                            <div className="absolute inset-0 bg-green-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 ring-4 ring-green-500/5">
                                <Send size={36} />
                            </div>
                            <h5 className="font-black text-white text-lg mb-2">Live Testing Phase</h5>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                Interactions on your connected phone will be processed by the AutoFlow Engine in real-time.
                            </p>
                            
                            <button
                                onClick={handleLogout}
                                className="mt-12 text-[10px] font-black uppercase tracking-widest text-red-400/60 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 px-6 py-3 rounded-xl transition-all border border-red-500/10"
                            >
                                Disconnect Testing Session
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Interaction Log */}
            <div className="w-1/2 flex flex-col bg-[#0d0d0d]">
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#121212]">
                    <h3 className="font-black text-xs text-amber-500 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={16} className="text-amber-500/70" />
                        Execution Engine Logs
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* If we had messages, we'd map them here similarly to execution log */}
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                         <div className="w-16 h-16 bg-[#121212] rounded-full flex items-center justify-center mb-6 border border-white/5">
                             <Smartphone size={32} className="text-gray-500" />
                         </div>
                         <p className="text-xs text-gray-500 font-bold uppercase tracking-widest max-w-[200px]">
                            {isConnected 
                                ? "Incoming activity from your real device will sync here." 
                                : "Link your device to view live execution logs."}
                         </p>
                    </div>
                </div>

                <div className="p-5 bg-[#1a1a1b] border-t border-white/5">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-amber-500/40" />
                              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Engine Mode</span>
                         </div>
                         <span className="text-[10px] text-amber-500/80 font-black uppercase tracking-widest">v2.0 Beta Production</span>
                    </div>
                </div>
            </div>
        </div>
    );
};