import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const INITIAL_CHIPS = [
    { label: 'Mini Soccer', msg: 'Mau booking Mini Soccer' },
    { label: 'Padel',       msg: 'Mau booking Padel' },
    { label: 'Basket',      msg: 'Mau booking Basket' },
    { label: 'Pilates',     msg: 'Mau booking Pilates' },
];

const WELCOME_TEXT =
    'Halo! Selamat datang di **Mandala Arena** \n\nArena olahraga modern di BSD. Mau booking lapangan apa hari ini?';

/**
 * Chatbot — Root chatbot widget.
 *
 * Assembles ChatHeader + MessageList + ChatInput and manages all state:
 * open/close, message history, loading, and redirect flow.
 *
 * Usage: <Chatbot /> — drop anywhere inside the app layout.
 */
export default function Chatbot() {
    const [isOpen,        setIsOpen]        = useState(false);
    const [messages,      setMessages]      = useState([
        {
            sender: 'bot',
            text:   WELCOME_TEXT,
            chips:  INITIAL_CHIPS,
            time:   new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [input,         setInput]         = useState('');
    const [isLoading,     setIsLoading]     = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const bottomRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // Real-time WebSocket listener (Reverb / Laravel Echo)
    useEffect(() => {
        if (!window.Echo) return;
        const channel = window.Echo.channel('chatbot')
            .listen('.App.Events.ChatbotMessageReceived', (e) => {
                console.log('Real-time message received:', e.reply);
            });
        return () => channel.stopListening('.App.Events.ChatbotMessageReceived');
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

            if (response.data.redirect) {
                addMessage('bot', response.data.reply + ' ');
                setIsRedirecting(true);
                setTimeout(() => { window.location.href = response.data.redirect; }, 1200);
                return;
            }

            addMessage('bot', response.data.reply, response.data.chips ?? [], response.data.image ?? null);
        } catch {
            addMessage('bot', 'Koneksi terganggu. Coba lagi ', [{ label: '↩ Retry', msg: text }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="chatbot-window"
                        initial={{ opacity: 0, y: 30, scale: 0.93 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.93 }}
                        className="w-[calc(100vw-2rem)] sm:w-[380px] h-[calc(100vh-6rem)] sm:h-[580px] bg-white border border-slate-200 rounded-[2.5rem] sm:rounded-[2rem] shadow-2xl shadow-slate-300/50 overflow-hidden flex flex-col pointer-events-auto"
                    >
                        <ChatHeader onClose={() => setIsOpen(false)} />

                        <MessageList
                            messages={messages}
                            isLoading={isLoading}
                            onChipClick={sendMessage}
                            bottomRef={bottomRef}
                        />

                        <ChatInput
                            value={input}
                            onChange={setInput}
                            onSubmit={sendMessage}
                            isLoading={isLoading}
                            isRedirecting={isRedirecting}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB toggle button */}
            <motion.button
                whileHover={{ scale: 1.08, rotate: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Tutup chatbot' : 'Buka chatbot'}
                className="w-16 h-16 bg-[#38BDF8] text-white rounded-2xl shadow-xl shadow-[#38BDF8]/30 flex items-center justify-center relative pointer-events-auto border-4 border-white overflow-hidden group"
            >
                <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-20 transition-opacity" />
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                    </svg>
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
