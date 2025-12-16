import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Coffee, Building2, Map, Plane, ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ChatInterface from '@/components/chat/ChatInterface';
import { useRouter } from 'next/router';

const scenarios = [
    {
        id: 'cafe',
        title: '카페에서 주문하기',
        description: '부다페스트의 유서 깊은 카페 제르보에서 커피와 디저트를 주문해보세요.',
        level: '초급 (A1)',
        icon: <Coffee className="w-8 h-8 text-orange-500" />,
        color: 'bg-orange-50 text-orange-600',
        initialMessage: 'Jó napot kívánok! Üdvözlöm a Gerbeaud kávéházban. Mit hozhatok önnek? (안녕하세요! 제르보 카페에 오신 것을 환영합니다. 무엇을 드릴까요?)'
    },
    {
        id: 'hotel',
        title: '호텔 체크인',
        description: '예약한 방을 확인하고 체크인 절차를 진행합니다.',
        level: '초급 (A2)',
        icon: <Building2 className="w-8 h-8 text-blue-500" />,
        color: 'bg-blue-50 text-blue-600',
        initialMessage: 'Jó estét! Üdvözlöm a Corvin Hotelben. Miben segíthetek? (안녕하세요! 코르빈 호텔에 오신 것을 환영합니다. 무엇을 도와드릴까요?)'
    },
    {
        id: 'directions',
        title: '길 물어보기',
        description: '지나가는 행인에게 국회의사당 가는 길을 물어봅니다.',
        level: '중급 (B1)',
        icon: <Map className="w-8 h-8 text-green-500" />,
        color: 'bg-green-50 text-green-600',
        initialMessage: 'Elnézést, tudna segíteni? Kicsit eltévedtem. (실례합니다, 도와주실 수 있나요? 길을 좀 잃어서요.)'
    },
    {
        id: 'airport',
        title: '입국 심사',
        description: '공항 입국 심사대에서 심사관의 질문에 대답합니다.',
        level: '중급 (B2)',
        icon: <Plane className="w-8 h-8 text-purple-500" />,
        color: 'bg-purple-50 text-purple-600',
        initialMessage: 'Jó napot! Az útlevelét kérem. Mi az utazásának a célja? (안녕하세요! 여권 보여주세요. 방문 목적이 무엇인가요?)'
    }
];

export default function RoleplayPage() {
    const router = useRouter();
    const [activeScenario, setActiveScenario] = useState<typeof scenarios[0] | null>(null);

    return (
        <>
            <Head>
                <title>AI 상황극 - 헝가리어 마스터</title>
            </Head>

            <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8 animate-in slide-in-from-top-4 fade-in duration-500">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => activeScenario ? setActiveScenario(null) : router.push('/dashboard')}
                            className="rounded-full hover:bg-white bg-white/50 backdrop-blur"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <MessageSquare className="w-8 h-8 text-indigo-600" />
                                AI 상황극 (Roleplay)
                            </h1>
                            <p className="text-gray-500">현지 상황을 가정한 AI와의 실전 회화 연습</p>
                        </div>
                    </div>

                    {activeScenario ? (
                        <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Info Panel */}
                                <div className="space-y-6">
                                    <Card className="p-6 border-none shadow-lg bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                                        <div className="bg-white/10 w-fit p-3 rounded-2xl mb-4 backdrop-blur-sm">
                                            {React.cloneElement(activeScenario.icon as React.ReactElement, { className: "text-white w-8 h-8" })}
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">{activeScenario.title}</h2>
                                        <p className="text-indigo-100 mb-6">{activeScenario.description}</p>
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-md px-4 py-1">
                                            {activeScenario.level}
                                        </Badge>
                                    </Card>

                                    <Card className="p-6 bg-white border-gray-100 shadow-sm">
                                        <h3 className="font-bold text-gray-800 mb-4">💡 주요 표현 팁</h3>
                                        <ul className="space-y-3 text-sm text-gray-600">
                                            <li className="flex gap-2">
                                                <span className="text-indigo-500 font-bold">•</span>
                                                <span>정중하게 표현하려면 "Kérem"을 붙이세요.</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-indigo-500 font-bold">•</span>
                                                <span>못 알아들었을 땐 "Tessék?"이라고 하세요.</span>
                                            </li>
                                        </ul>
                                    </Card>
                                </div>

                                {/* Chat Interface */}
                                <div className="lg:col-span-2">
                                    <ChatInterface
                                        scenario={activeScenario}
                                        onEndSession={() => setActiveScenario(null)}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Scenario Selection Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
                            {scenarios.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Card
                                        onClick={() => setActiveScenario(item)}
                                        className="p-6 cursor-pointer border-transparent shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group bg-white"
                                    >
                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -mr-8 -mt-8 transition-colors duration-300 group-hover:${item.color.split(' ')[0]}`} />

                                        <div className="relative z-10 flex items-start gap-4">
                                            <div className={`p-4 rounded-2xl ${item.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                                {item.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                                                        {item.level}
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-500 leading-relaxed mb-4">
                                                    {item.description}
                                                </p>
                                                <span className="text-indigo-600 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0 duration-300">
                                                    대화 시작하기 <ArrowLeft className="w-4 h-4 rotate-180" />
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
