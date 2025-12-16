import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 나중에 API에서 받아올 데이터 타입 정의
interface DailyWord {
    hungarian: string;
    korean: string;
    pronunciation: string;
    exampleHu: string;
    exampleKo: string;
    partOfSpeech: string;
}

const MOCK_DAILY_WORD: DailyWord = {
    hungarian: "Reménység",
    korean: "희망, 소망",
    pronunciation: "[레메-니-셰-그]",
    exampleHu: "A reménység nem szégyenít meg.",
    exampleKo: "소망은 부끄럽게 하지 않습니다.",
    partOfSpeech: "명사 (Névszó)"
};

export const WordOfTheDayCard = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // 뒤집기 핸들러
    const handleFlip = () => {
        if (!isAnimating) {
            setIsFlipped(!isFlipped);
            setIsAnimating(true);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto perspective-1000">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative w-full h-[280px] cursor-pointer group"
                onClick={handleFlip}
            >
                {/* 카드 컨테이너 (3D 회전 적용) */}
                <motion.div
                    className="relative w-full h-full preserve-3d transition-all duration-500"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    onAnimationComplete={() => setIsAnimating(false)}
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {/* 앞면 (Front) */}
                    <div className="absolute inset-0 w-full h-full backface-hidden">
                        <div className="h-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center text-white relative overflow-hidden border border-indigo-400/30">

                            {/* 배경 데코레이션 */}
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles size={120} />
                            </div>

                            {/* 상단 라벨 */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="absolute top-6 left-6 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium"
                            >
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                <span>오늘의 단어</span>
                            </motion.div>

                            {/* 메인 단어 */}
                            <div className="text-center z-10 mt-4">
                                <motion.h2
                                    className="text-5xl font-extrabold mb-4 tracking-tight"
                                    layoutId="word-hu"
                                >
                                    {MOCK_DAILY_WORD.hungarian}
                                </motion.h2>
                                <p className="text-indigo-200 text-lg font-light tracking-wide">
                                    클릭해서 뒤집어보세요
                                </p>
                            </div>

                            {/* 하단 인터랙션 유도 아이콘 */}
                            <div className="absolute bottom-6 right-6 animate-pulse">
                                <RefreshCw className="w-6 h-6 text-white/50" />
                            </div>
                        </div>
                    </div>

                    {/* 뒷면 (Back) */}
                    <div
                        className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-xl bg-white border-2 border-indigo-100 p-8 flex flex-col relative overflow-hidden"
                        style={{ transform: "rotateY(180deg)" }}
                    >
                        {/* 뒷면 상단 */}
                        <div className="flex justify-between items-start mb-6">
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-semibold">
                                {MOCK_DAILY_WORD.partOfSpeech}
                            </span>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
                                <Volume2 className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* 메인 내용 */}
                        <div className="flex-1 flex flex-col justify-center text-center space-y-4">
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                    {MOCK_DAILY_WORD.korean}
                                </h3>
                                <p className="text-gray-400 text-sm">{MOCK_DAILY_WORD.pronunciation}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
                                <p className="text-indigo-700 font-medium italic mb-1">
                                    "{MOCK_DAILY_WORD.exampleHu}"
                                </p>
                                <p className="text-gray-500 text-sm">
                                    {MOCK_DAILY_WORD.exampleKo}
                                </p>
                            </div>
                        </div>

                        {/* 하단 안내 */}
                        <div className="mt-auto text-center">
                            <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                <RefreshCw className="w-3 h-3" /> 다시 뒤집으려면 클릭하세요
                            </span>
                        </div>
                    </div>

                </motion.div>
            </motion.div>
        </div>
    );
};
