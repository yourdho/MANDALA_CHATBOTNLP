import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const INITIAL_CHIPS = [
    { label: '⚽ Booking Mini Soccer', msg: 'Mau booking Mini Soccer' },
    { label: '🎾 Sewa Padel',          msg: 'Mau booking Padel' },
    { label: '🎯 Pilates',             msg: 'Pilates' },
    { label: '🏀 Basket',              msg: 'Mau booking Basket' },
];

const WELCOME_TEXT =
    'Halo! Selamat datang di **Mandala Arena** 🏆\n\nSaya asisten virtual cerdas yang siap membantu. Mau booking fasilitas, cek harga, atau cari lawan main hari ini?';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 'init-msg',
            sender: 'bot',
            type: 'text',
            text: WELCOME_TEXT,
            payload: null,
            chips: INITIAL_CHIPS,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (!window.Echo) return;
        const sessionId = document.querySelector('meta[name="session-id"]')?.content || 'guest';
        
        const channel = window.Echo.channel(`chatbot.${sessionId}`)
            .listen('.App.Events.ChatbotMessageReceived', (e) => {
                if (e.senderId && e.senderId !== 'bot') {
                    appendBotMessageFromAdmin(e);
                }
            });
        return () => channel.stopListening('.App.Events.ChatbotMessageReceived');
    }, []);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const appendUserMessage = (text) => {
        setMessages(prev => [
            ...prev,
            {
                id: generateId(),
                sender: 'user',
                type: 'text',
                text,
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            },
        ]);
    };

    const appendBotMessageFromAdmin = (e) => {
        setMessages(prev => [...prev, {
            id: generateId(),
            sender: 'admin',
            type: 'text',
            text: e.reply,
            chips: [],
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        }]);
    }

    const appendBotMessageFromResponse = (response) => {
        let msgType = 'text';
        let msgPayload = null;
        let displayedText = response.reply;
        let meta = response.meta || {};
        
        if (response.ui && response.ui.type) {
            msgType = response.ui.type;
            msgPayload = response.ui.payload;
            if (msgType !== 'text') displayedText = ''; 
        } else {
            try {
                const parsed = JSON.parse(response.reply);
                if (parsed.type) {
                    msgType = parsed.type;
                    msgPayload = parsed;
                    displayedText = '';
                }
            } catch(e) {}
        }

        setMessages(prev => [
            ...prev,
            {
                id: generateId(),
                sender: 'bot',
                type: msgType,
                text: displayedText,
                payload: msgPayload,
                meta: meta,
                chips: response.chips || [],
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            },
        ]);
    };

    // --- EXPERT ACTION HANDLERS ---
    const handleBookingConfirm = (payload = null) => handleSendMessage('Lanjut konfirmasi booking');
    const handleBookingEdit = (payload = null) => handleSendMessage('Saya ingin ganti jadwal atau ubah pesanan');
    const handleBookingCancel = (payload = null) => handleSendMessage('Batalin booking');
    
    // For payment method, the child button emits 'qris' or 'transfer', we map it safely
    const handleSelectPaymentMethod = (method) => handleSendMessage(`bayar pakai ${method}`);
    
    const handleCheckPaymentStatus = (payload = null) => handleSendMessage('cek status pembayaran');
    const handleChangePaymentMethod = (payload = null) => handleSendMessage('ganti metode pembayaran lain');
    const handleRetryPayment = (payload = null) => handleSendMessage('booking ulang jadwal tadi');
        


    const handleSendMessage = async (msgText) => {
        const text = (msgText ?? input).trim();
        if (!text || isLoading || isRedirecting) return;

        setInput('');
        appendUserMessage(text);
        setIsLoading(true);

        try {
            const response = await axios.post('/chatbot/message', { message: text });

            if (response.data.redirect) {
                appendBotMessageFromResponse({ reply: 'Mengalihkan halaman... ⏳', ui: {type: 'text'}, chips: [] });
                setIsRedirecting(true);
                setTimeout(() => { window.location.href = response.data.redirect; }, 1200);
                return;
            }

            appendBotMessageFromResponse(response.data);
        } catch (error) {
            setMessages(prev => [
                ...prev,
                {
                    id: generateId(),
                    sender: 'bot',
                    type: 'text',
                    text: 'Aduh... Koneksi terputus. Coba lagi ya? 📡',
                    chips: [{ label: '↩ Ulangi', msg: text }],
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                }
            ]);
        } finally {
            setIsLoading(false);
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-5 pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="chatbot-window"
                        initial={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-8rem)] sm:h-[650px] max-h-[800px] bg-[#f8fafc] border border-slate-200/60 rounded-[2rem] shadow-2xl shadow-sky-900/10 overflow-hidden flex flex-col pointer-events-auto origin-bottom-right"
                    >
                        <ChatHeader onClose={() => setIsOpen(false)} />

                        <MessageList
                            messages={messages}
                            isLoading={isLoading}
                            onChipClick={handleSendMessage}
                            bottomRef={bottomRef}
                            onBookingConfirm={handleBookingConfirm}
                            onBookingEdit={handleBookingEdit}
                            onBookingCancel={handleBookingCancel}
                            onSelectPaymentMethod={handleSelectPaymentMethod}
                            onCheckPaymentStatus={handleCheckPaymentStatus}
                            onChangePaymentMethod={handleChangePaymentMethod}
                            onRetryPayment={handleRetryPayment}
                        />

                        <ChatInput
                            value={input}
                            onChange={setInput}
                            onSubmit={() => handleSendMessage()}
                            isLoading={isLoading}
                            isRedirecting={isRedirecting}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Tutup Mandala Bot' : 'Buka Mandala Bot'}
                className="w-16 h-16 rounded-full bg-slate-900 shadow-xl shadow-slate-900/30 flex items-center justify-center relative pointer-events-auto border-4 border-white transition-colors group z-50 overflow-hidden"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform rotate-0 scale-100">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <div className="flex relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-sky-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                    </div>
                )}
            </motion.button>
        </div>
    );
}
