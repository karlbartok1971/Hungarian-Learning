import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, RotateCcw, MoreVertical, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatInterfaceProps {
    scenario: {
        id: string;
        title: string;
        description: string;
        initialMessage: string;
        avatar?: string;
    };
    onEndSession?: () => void;
}

const ChatInterface = ({ scenario, onEndSession }: ChatInterfaceProps) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'assistant',
            content: scenario.initialMessage,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Mock AI Response (Replace with actual API later)
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Nagyon jó! (아주 좋아요!) "${userMsg.content}"라고 하셨군요. `,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[600px] max-w-md mx-auto bg-gray-50 rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-indigo-100">
                            <AvatarImage src={scenario.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Andras"} />
                            <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">András (AI 튜터)</h3>
                        <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                            <Sparkles size={10} /> {scenario.title}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={onEndSession} className="text-gray-400 hover:text-gray-600">
                        <RotateCcw className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}
                        >
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className={`text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1 items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="헝가리어로 메시지를 입력하세요..."
                        className="flex-1 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl w-12 h-10 p-0 flex items-center justify-center shrink-0 transition-all active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">
                    AI 튜터는 실수를 교정해주고 자연스러운 표현을 제안합니다.
                </p>
            </div>
        </div>
    );
};

export default ChatInterface;
