import React from 'react';
import { motion } from 'framer-motion';
import { RenderText } from './ChatHeader';

/**
 * MessageBubble — Single chat message (bot or user).
 * Renders text content, optional image preview, quick-reply chips,
 * and a timestamp.
 */
function MessageBubble({ msg, onChipClick }) {
    const isUser = msg.sender === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, x: isUser ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`max-w-[90%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8] font-black text-xs mb-2">
                        M
                    </div>
                )}

                <div className={`px-5 py-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                        ? 'bg-slate-900 text-white rounded-tr-none font-bold'
                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'
                }`}>
                    {msg.image && (
                        <img
                            src={msg.image}
                            alt="Attachment"
                            className="w-full h-32 object-cover rounded-xl mb-3 border border-slate-100"
                        />
                    )}
                    <RenderText text={msg.text} />
                </div>

                {/* Quick-reply chips */}
                {msg.chips?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {msg.chips.map((chip, i) => (
                            <button
                                key={i}
                                onClick={() => onChipClick(chip.msg)}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#38BDF8] hover:bg-[#38BDF8] hover:text-white hover:border-[#38BDF8] transition-all"
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                )}

                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-2 px-1">
                    {msg.time}
                </span>
            </div>
        </motion.div>
    );
}

/**
 * TypingIndicator — Three bouncing dots shown while the bot is responding.
 */
function TypingIndicator() {
    return (
        <div className="flex justify-start">
            <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full animate-bounce [animation-delay:-0.3s]" />
            </div>
        </div>
    );
}

/**
 * MessageList — Scrollable message feed.
 * Renders all messages + typing indicator + auto-scroll anchor.
 */
export default function MessageList({ messages, isLoading, onChipClick, bottomRef }) {
    return (
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
            {messages.map((msg, idx) => (
                <MessageBubble key={idx} msg={msg} onChipClick={onChipClick} />
            ))}

            {isLoading && <TypingIndicator />}

            <div ref={bottomRef} />
        </div>
    );
}
