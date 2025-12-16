import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, TrendingUp, Zap, Award } from 'lucide-react';

// 숫자 카운트업 컴포넌트
const CountUp = ({ end, duration = 2, suffix = '' }: { end: number, duration?: number, suffix?: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / (duration * 1000), 1);

            // Easing function: easeOutExpo
            const easeOut = (x: number) => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);

            setCount(Math.floor(easeOut(percentage) * end));

            if (progress < duration * 1000) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return <>{count}{suffix}</>;
};

// 원형 프로그레스 바 컴포넌트
const CircularProgress = ({ value, color, size = 60, strokeWidth = 5 }: any) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center font-bold text-gray-700" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    className="text-gray-200"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <motion.circle
                    className={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="absolute text-sm">
                {Math.round(value)}%
            </div>
        </div>
    );
};

interface StatsCardsProps {
    stats: {
        totalLearned: number;
        totalWords: number;
        streak: number;
        accuracy: number;
    };
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
    const progressPercentage = Math.round((stats.totalLearned / stats.totalWords) * 100);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {/* 1. 학습한 단어 */}
            <motion.div variants={item}>
                <Card className="bg-white border-blue-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BookOpen size={80} className="text-blue-600 transform group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <CardContent className="pt-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-100 p-2.5 rounded-xl">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                Total
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">학습한 단어</p>
                            <h3 className="text-3xl font-bold text-gray-900">
                                <CountUp end={stats.totalLearned} />
                                <span className="text-lg text-gray-400 font-normal ml-1">/ {stats.totalWords}</span>
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 2. 전체 진도 (원형 그래프 적용) */}
            <motion.div variants={item}>
                <Card className="bg-white border-green-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-green-100 p-2.5 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mb-1">전체 진도율</p>
                            <h3 className="text-3xl font-bold text-gray-900">
                                <CountUp end={progressPercentage} suffix="%" />
                            </h3>
                        </div>
                        <div className="mr-2">
                            <CircularProgress value={progressPercentage} color="text-green-500" size={70} strokeWidth={6} />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 3. 연속 학습 (불꽃 애니메이션) */}
            <motion.div variants={item}>
                <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <Zap size={100} className="text-orange-500 rotate-12" />
                    </div>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-orange-100 p-2.5 rounded-xl">
                                <Zap className="w-6 h-6 text-orange-500" />
                            </div>
                            <span className="animate-pulse text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full flex items-center gap-1">
                                🔥 Burning
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">연속 학습</p>
                            <h3 className="text-3xl font-bold text-gray-900">
                                <CountUp end={stats.streak} suffix="일" />
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 4. 평균 정확도 */}
            <motion.div variants={item}>
                <Card className="bg-white border-purple-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-purple-100 p-2.5 rounded-xl">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stats.accuracy >= 90 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                {stats.accuracy >= 90 ? 'Excellent' : 'Good'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">평균 정확도</p>
                            <h3 className="text-3xl font-bold text-gray-900">
                                <CountUp end={stats.accuracy} suffix="%" />
                            </h3>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.accuracy}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="bg-purple-500 h-full rounded-full"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};
