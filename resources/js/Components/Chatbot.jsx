import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function RenderText({ text }) {
    const lines = text.split('\n');
    return (
        <div className="space-y-0.5">
            {lines.map((line, i) => {
                const parts = line.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
                const rendered = parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**'))
                        return <strong key={j} className="font-black italic text-[#38BDF8] uppercase leading-none tracking-widest text-[11px]">{part.slice(2, -2)}</strong>;
                    if (part.startsWith('_') && part.endsWith('_'))
                        return <em key={j} className="text-slate-400 not-italic">{part.slice(1, -1)}</em>;
                    return <span key={j}>{part}</span>;
                });
                return (
                    <p key={i} className={`text-xs ${line.trim() === '' ? 'h-2' : (line.startsWith('•') ? 'pl-2 border-l-2 border-[#38BDF8]/20 ml-1' : '')}`}>
                        {rendered}
                    </p>
                );
            })}
        </div>
    );
}

const INITIAL_CHIPS = [
    { label: 'Mini Soccer', msg: 'Mau booking Mini Soccer' },
    { label: 'Padel', msg: 'Mau booking Padel' },
    { label: 'Basket', msg: 'Mau booking Basket' },
    { label: 'Pilates', msg: 'Mau booking Pilates' },
];

const WELCOME_TEXT = 'Halo! Selamat datang di **Mandala Arena** \n\nArena olahraga modern di BSD. Mau booking lapangan apa hari ini?';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: WELCOME_TEXT,
            chips: INITIAL_CHIPS,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    useEffect(() => {
        if (window.Echo) {
            const channel = window.Echo.channel('chatbot')
                .listen('ChatbotMessageReceived', (e) => {
                    console.log('Real-time message received:', e.reply);
                });
            return () => channel.stopListening('ChatbotMessageReceived');
        }
    }, []);

    const addMessage = (sender, text, chips = [], image = null) => {
        setMessages(prev => [
            ...prev,
            {
                sender,
                text,
                chips: sender === 'bot' ? chips : [],
                image,
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            },
        ]);
    };

    const sendMessage = async (msg) => {
        const text = (msg ?? input).trim();
        if (!text || isLoading || isRedirecting) return;

        setInput('');
        addMessage('user', text);
        setIsLoading(true);

        try {
            const response = await axios.post('/chatbot/message', { message: text });

            // Check for smart redirect from controller
            if (response.data.redirect) {
                addMessage('bot', response.data.reply + " ");
                setIsRedirecting(true);
                setTimeout(() => {
                    window.location.href = response.data.redirect;
                }, 1200);
                return;
            }

            addMessage('bot', response.data.reply, response.data.chips ?? [], response.data.image ?? null);
        } catch {
            addMessage('bot', 'Koneksi terganggu. Coba lagi ', [
                { label: ' Retry', msg: text },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.93 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.93 }}
                        key="chatbot-window"
                        className="w-[calc(100vw-2rem)] sm:w-[380px] h-[calc(100vh-6rem)] sm:h-[580px] bg-white border border-slate-200 rounded-[2.5rem] sm:rounded-[2rem] shadow-2xl shadow-slate-300/50 overflow-hidden flex flex-col pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#38BDF8]/10 rounded-full blur-3xl -mr-10 -mt-10" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-[#38BDF8]/10 border border-[#38BDF8]/20 rounded-2xl flex items-center justify-center font-black text-[#38BDF8] text-xl">
                                    M
                                </div>
                                <div>
                                    <h3 className="font-['Permanent_Marker'] italic uppercase tracking-tighter leading-none text-slate-900 text-xl">Mandala Bot</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.2em]">Online Sekarang</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                }}
                                className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-20 pointer-events-auto"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" /></svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={idx}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[90%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        {msg.sender === 'bot' && (
                                            <div className="w-7 h-7 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8] font-black text-xs mb-2">M</div>
                                        )}
                                        <div className={`
                                            px-5 py-4 rounded-2xl text-xs leading-relaxed
                                            ${msg.sender === 'user'
                                                ? 'bg-slate-900 text-white rounded-tr-none font-bold'
                                                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'}
                                        `}>
                                            {msg.image && (
                                                <img src={msg.image} className="w-full h-32 object-cover rounded-xl mb-3 border border-slate-100" />
                                            )}
                                            <RenderText text={msg.text} />
                                        </div>

                                        {msg.chips && msg.chips.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {msg.chips.map((chip, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => sendMessage(chip.msg)}
                                                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#38BDF8] hover:bg-[#38BDF8] hover:text-white hover:border-[#38BDF8] transition-all"
                                                    >
                                                        {chip.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-2 px-1">{msg.time}</span>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-5 bg-white border-t border-slate-100">
                            <form
                                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                                className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 pl-5"
                            >
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={isRedirecting ? "Mengarahkan Kakak..." : "Tanya Mandala Bot..."}
                                    disabled={isRedirecting}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-[11px] font-medium placeholder:text-slate-300 text-slate-700 outline-none py-2"
                                />
                                <button
                                    disabled={!input.trim() || isLoading || isRedirecting}
                                    className="w-10 h-10 bg-[#38BDF8] text-white rounded-xl flex items-center justify-center hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-30 shadow-md shadow-[#38BDF8]/20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" /></svg>
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.08, rotate: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-[#38BDF8] text-white rounded-2xl shadow-xl shadow-[#38BDF8]/30 flex items-center justify-center relative pointer-events-auto border-4 border-white overflow-hidden group"
            >
                <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-20 transition-opacity" />
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" /></svg>
                ) : (
                    <div className="flex flex-col items-center select-none">
                        <span className="text-2xl font-black italic leading-none pt-0.5">M</span>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FACC15] rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-[8px] font-black text-slate-900">!</span>
                        </div>
                    </div>
                )}
            </motion.button>
        </div>
    );
}

