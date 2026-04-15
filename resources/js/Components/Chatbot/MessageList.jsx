import React from 'react';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import TypingIndicator from './TypingIndicator';
import QuickReplyChips from './QuickReplyChips';
import BookingSummaryCard from './Cards/BookingSummaryCard';
import PaymentInstructionCard from './Cards/PaymentInstructionCard';
import PaymentStatusCard from './Cards/PaymentStatusCard';
import PaymentMethodCard from './Cards/PaymentMethodCard';

export default function MessageList({ 
    messages, 
    isLoading, 
    onChipClick, 
    bottomRef,
    onBookingConfirm,
    onBookingEdit,
    onBookingCancel,
    onSelectPaymentMethod,
    onCheckPaymentStatus,
    onChangePaymentMethod,
    onRetryPayment
}) {
    
    // Dynamic Modular Component Router
    const renderContent = (msg) => {
        const { type, payload, text } = msg;

        if (type === 'booking_summary' && payload) {
            return (
                <BookingSummaryCard 
                    facilityName={payload.facility_name}
                    bookingDate={payload.date}
                    bookingTime={payload.time}
                    duration={payload.duration}
                    estimatedPrice={payload.price}
                    onConfirm={onBookingConfirm}
                    onEdit={onBookingEdit}
                    onCancel={onBookingCancel}
                />
            );
        }

        if (type === 'payment_instruction' && payload) {
            return (
                <PaymentInstructionCard 
                    amount={payload.amount}
                    paymentMethod={payload.method}
                    paymentReference={payload.va_number || payload.booking_id}
                    expiryTime={payload.expires_in}
                    actionUrl={payload.qris_url || payload.action_url}
                    instructionLines={payload.method === 'TRANSFER' ? ['Buka Aplikasi Mobile Banking atau ATM', `Masukkan nomor Rekening/VA: ${payload.va_number}`, 'Pastikan nominal sesuai', 'Selesaikan pembayaran'] : ['Scan QRIS melalui aplikasi E-Wallet atau M-Banking', 'Pastikan nama penerima Mandala Arena dan nominal sesuai', 'Selesaikan dan tunggu konfirmasi']}
                    onCheckStatus={onCheckPaymentStatus}
                    onChangeMethod={onChangePaymentMethod}
                />
            );
        }

        if (type === 'payment_method_selection') {
            return <PaymentMethodCard data={payload || {}} onAction={(method) => onSelectPaymentMethod(method)} />;
        }

        if (type === 'payment_status' && payload) {
            return (
                <PaymentStatusCard 
                    status={payload.status}
                    bookingReference={payload.booking_id}
                    onRetry={onRetryPayment}
                    onCheckStatus={onCheckPaymentStatus}
                    onChangeMethod={onChangePaymentMethod}
                    onViewBooking={() => router.visit('/profile')}
                />
            );
        }

        // Default Text Render
        return renderTextContent(text || '');
    };

    const renderTextContent = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
            if (!line) return <br key={`br-${i}`} />;
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <p key={`line-${i}`} className="min-h-[1.25rem]">
                    {parts.map((part, pid) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={pid} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    return (
        <div className="flex-1 overflow-y-auto px-5 py-6 bg-[#f8fafc] space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Jadwalin main jadi lebih mudah.<br/>Kirim pesan untuk memulai.</p>
                </div>
            )}

            {messages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                const isCard = msg.type !== 'text' && !isUser;

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
                    >
                        <div className="flex items-end gap-2 max-w-[88%]">
                            {!isUser && (
                                <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex-shrink-0 flex items-center justify-center shadow-sm -mb-1 z-10">
                                    <span className="text-[10px] font-bold text-white italic">M</span>
                                </div>
                            )}

                            <div
                                className={`text-[14px] leading-relaxed shadow-sm ${
                                    isCard ? 'bg-transparent shadow-none p-0' : 
                                    (isUser
                                        ? 'px-4 py-3 bg-sky-500 text-white rounded-3xl rounded-br-sm border border-sky-600/20'
                                        : 'px-4 py-3 bg-white text-slate-700 rounded-3xl rounded-bl-sm border border-slate-200/60'
                                    )
                                }`}
                            >
                                {renderContent(msg)}
                            </div>
                        </div>
                        
                        <span className={`text-[10px] font-medium text-slate-400 mt-1.5 ${isUser ? 'pr-2' : (isCard ? 'pl-9 mt-2' : 'pl-9')}`}>
                            {msg.time}
                        </span>

                        {!isCard && <QuickReplyChips chips={msg.chips} onAction={onChipClick} align={isUser ? 'end' : 'start'} />}
                    </motion.div>
                );
            })}

            {isLoading && (
                <div className="flex items-end gap-2 max-w-[88%] pl-0">
                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex-shrink-0 flex items-center justify-center shadow-sm -mb-1">
                        <span className="text-[10px] font-bold text-white italic">M</span>
                    </div>
                    <TypingIndicator />
                </div>
            )}

            <div ref={bottomRef} className="h-1" />
        </div>
    );
}
