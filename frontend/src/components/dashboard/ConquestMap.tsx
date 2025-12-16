import React from 'react';
import { motion } from 'framer-motion';
import { Lock, MapPin, Trophy, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConquestMapProps {
    currentLevel: string; // 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
    progress: number;
}

const regions = [
    {
        id: 'budapest',
        name: '부다페스트 (Budapest)',
        level: 'A1',
        description: '헝가리의 심장, 도나우의 진주',
        path: 'M380 200 C360 200, 350 220, 360 240 C370 260, 400 260, 410 240 C420 220, 400 200, 380 200 Z', // Simplified circle-ish for capital
        cx: 385, cy: 230,
        color: '#ef4444', // Red
        landmark: '🏰 국회의사당'
    },
    {
        id: 'balaton',
        name: '발라톤 (Balaton)',
        level: 'A2',
        description: '헝가리의 바다, 최대 휴양지',
        path: 'M250 280 L320 270 L340 300 L260 310 Z', // Elongated shape
        cx: 290, cy: 290,
        color: '#3b82f6', // Blue
        landmark: '🌊 티하니 반도'
    },
    {
        id: 'eger',
        name: '에게르 (Eger)',
        level: 'B1',
        description: '역사와 와인의 도시',
        path: 'M450 150 L500 160 L480 200 L430 190 Z',
        cx: 465, cy: 175,
        color: '#8b5cf6', // Purple
        landmark: '🍷 황소의 피 와인'
    },
    {
        id: 'szeged',
        name: '세게드 (Szeged)',
        level: 'B2',
        description: '태양의 도시, 파프리카의 고향',
        path: 'M420 350 L480 350 L470 400 L410 400 Z',
        cx: 445, cy: 375,
        color: '#f59e0b', // Amber/Orange
        landmark: '☀️ 돔 광장'
    },
    {
        id: 'debrecen',
        name: '데브레첸 (Debrecen)',
        level: 'C1',
        description: '대평원 호르토바지의 관문',
        path: 'M550 200 L620 210 L600 280 L530 260 Z',
        cx: 575, cy: 235,
        color: '#10b981', // Emerald
        landmark: '🐎 대교회'
    }
];

const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const ConquestMap = ({ currentLevel, progress }: ConquestMapProps) => {
    const currentLevelIndex = levelOrder.indexOf(currentLevel);

    // Helper to determine region status
    const getRegionStatus = (regionLevel: string) => {
        const regionIndex = levelOrder.indexOf(regionLevel);
        if (regionIndex < currentLevelIndex) return 'conquered';
        if (regionIndex === currentLevelIndex) return 'active';
        return 'locked';
    };

    return (
        <div className="w-full bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-slate-700">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                {/* Map Area */}
                <div className="flex-1 w-full max-w-2xl relative aspect-[16/9] bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden group">

                    <div className="absolute top-4 left-4 z-20">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <MapPin className="text-yellow-400 fill-yellow-400" />
                            헝가리 정복 지도
                        </h3>
                        <p className="text-slate-400 text-sm">레벨을 올려 영토를 확장하세요!</p>
                    </div>

                    <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-2xl">
                        {/* Base Map Outline (Simplified Hungary) */}
                        <path
                            d="M150 200 L250 150 L400 120 L600 150 L700 250 L650 400 L450 450 L250 400 L100 300 Z"
                            fill="#1e293b"
                            stroke="#334155"
                            strokeWidth="2"
                        />

                        {/* Regions */}
                        {regions.map((region) => {
                            const status = getRegionStatus(region.level);
                            const isLocked = status === 'locked';
                            const isActive = status === 'active';

                            return (
                                <g key={region.id} className="transition-all duration-500 cursor-pointer hover:opacity-90">
                                    <TooltipProvider>
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger asChild>
                                                <motion.g
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    {/* Region Shape */}
                                                    <path
                                                        d={region.path}
                                                        fill={isLocked ? '#334155' : region.color}
                                                        fillOpacity={isLocked ? 0.3 : 0.6}
                                                        stroke={isLocked ? '#475569' : region.color}
                                                        strokeWidth={isActive ? 3 : 1}
                                                        className={`${isActive ? 'animate-pulse' : ''}`}
                                                        style={{ filter: isActive ? `drop-shadow(0 0 10px ${region.color})` : 'none' }}
                                                    />

                                                    {/* Location Marker / Icon */}
                                                    <circle cx={region.cx} cy={region.cy} r={isActive ? 8 : 5} fill="white" fillOpacity={isLocked ? 0.2 : 1} />
                                                    {isLocked ? (
                                                        <Lock x={region.cx - 8} y={region.cy - 8} width={16} height={16} className="text-slate-500" />
                                                    ) : (
                                                        <Star x={region.cx - 8} y={region.cy - 8} width={16} height={16} className="text-yellow-300 fill-yellow-300" />
                                                    )}
                                                </motion.g>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-900 border-slate-700 text-white p-3">
                                                <div className="space-y-1">
                                                    <p className="font-bold flex items-center gap-2">
                                                        {region.name}
                                                        <span className={`text-xs px-2 py-0.5 rounded ${isLocked ? 'bg-slate-700' : 'bg-green-600'}`}>
                                                            {isLocked ? '잠김' : '정복됨'}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-slate-300">{region.description}</p>
                                                    <p className="text-xs text-yellow-400 font-medium">{region.landmark}</p>
                                                    {isLocked && <p className="text-xs text-red-300 pt-1">🔒 Level {region.level} 필요</p>}
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Stats Panel */}
                <div className="w-full md:w-64 space-y-4">
                    {regions.map((region) => {
                        const status = getRegionStatus(region.level);
                        return (
                            <div
                                key={region.id}
                                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${status === 'locked'
                                        ? 'bg-slate-800/50 border-slate-700 opacity-50'
                                        : status === 'active'
                                            ? 'bg-slate-800 border-indigo-500 shadow-lg scale-105'
                                            : 'bg-slate-800 border-slate-600'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${status === 'locked' ? 'bg-slate-700' : 'bg-indigo-900/50'}`}>
                                    {status === 'locked' ? <Lock size={16} className="text-slate-400" /> : <Trophy size={16} className={status === 'active' ? 'text-yellow-400' : 'text-indigo-400'} />}
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold ${status === 'locked' ? 'text-slate-400' : 'text-white'}`}>{region.name.split('(')[0]}</h4>
                                    <span className="text-xs text-slate-500">{region.level} Level</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default ConquestMap;
