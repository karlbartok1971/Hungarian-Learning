import React, { useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Check, X, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Word {
    hungarian: string;
    korean: string;
    pronunciation: string;
    example: string;
}

interface SwipeLearningProps {
    words: Word[];
    onComplete: (results: { known: Word[]; unknown: Word[] }) => void;
    onExit: () => void;
}

const SwipeLearning = ({ words, onComplete, onExit }: SwipeLearningProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [knownWords, setKnownWords] = useState<Word[]>([]);
    const [unknownWords, setUnknownWords] = useState<Word[]>([]);
    const [showResult, setShowResult] = useState(false);

    // Motion values for swipe animation
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
    const bg = useTransform(
        x,
        [-200, -50, 0, 50, 200],
        ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0)', 'rgba(255, 255, 255, 0)', 'rgba(34, 197, 94, 0)', 'rgba(34, 197, 94, 0.2)']
    );

    const currentWord = words[currentIndex];

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            handleSwipe('right');
        } else if (info.offset.x < -threshold) {
            handleSwipe('left');
        }
    };

    const handleSwipe = (direction: 'left' | 'right') => {
        if (direction === 'right') {
            setKnownWords([...knownWords, currentWord]);
        } else {
            setUnknownWords([...unknownWords, currentWord]);
        }

        if (currentIndex < words.length - 1) {
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
                x.set(0);
            }, 200);
        } else {
            setShowResult(true);
        }
    };

    if (showResult) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="mb-6 p-6 bg-yellow-100 rounded-full shadow-lg">
                    <Trophy className="w-16 h-16 text-yellow-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4">학습 완료! 🎉</h2>
                <div className="flex gap-8 mb-8">
                    <div className="text-center">
                        <p className="text-gray-500 text-sm">암기함</p>
                        <p className="text-4xl font-bold text-green-600">{knownWords.length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-500 text-sm">복습 필요</p>
                        <p className="text-4xl font-bold text-red-500">{unknownWords.length}</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button onClick={onExit} variant="outline" size="lg">목록으로</Button>
                    <Button onClick={() => {
                        onComplete({ known: knownWords, unknown: unknownWords });
                        // Here you would typically reset or handle the next step
                        onExit();
                    }} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        결과 저장하기
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-4 w-full max-w-md px-4 z-10">
                <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
                    <span>진행 상황</span>
                    <span>{currentIndex + 1} / {words.length}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Card Interface */}
            <div className="relative w-full max-w-sm h-[450px] flex items-center justify-center">
                {/* Background Cards for Stack Effect */}
                {currentIndex < words.length - 1 && (
                    <div className="absolute top-4 scale-95 opacity-50 z-0">
                        <Card className="w-[320px] h-[400px] bg-white shadow-lg border-2 border-gray-100 rounded-3xl" />
                    </div>
                )}

                {/* Active Card */}
                <motion.div
                    style={{ x, rotate, opacity }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    className="absolute z-10 cursor-grab active:cursor-grabbing w-full flex justify-center"
                >
                    <motion.div style={{ backgroundColor: bg }} className="w-[340px] h-[420px] rounded-3xl p-1">
                        <Card className="w-full h-full flex flex-col items-center justify-center p-8 bg-white shadow-xl border-2 border-indigo-50 rounded-[22px] select-none">
                            <div className="flex-1 flex flex-col items-center justify-center gap-6">
                                <Badge variant="secondary" className="mb-4">
                                    WORD CARD
                                </Badge>

                                <div className="text-center space-y-2">
                                    <h2 className="text-4xl font-black text-gray-900 mb-2">
                                        {currentWord.hungarian}
                                    </h2>
                                    <p className="text-indigo-600 font-medium text-lg">
                                        {currentWord.pronunciation}
                                    </p>
                                </div>

                                <div className="w-16 h-1 bg-gray-100 rounded-full" />

                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-700 mb-4">
                                        {currentWord.korean}
                                    </p>
                                    <p className="text-gray-500 text-sm px-4 italic bg-gray-50 py-2 rounded-lg">
                                        "{currentWord.example}"
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-12 text-sm font-medium text-gray-400">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="p-2 border-2 border-red-200 rounded-full text-red-300">
                                        <X size={20} />
                                    </div>
                                    <span>몰라요</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="p-2 border-2 border-green-200 rounded-full text-green-300">
                                        <Check size={20} />
                                    </div>
                                    <span>알아요</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-6 mt-8 z-20">
                <Button
                    onClick={() => handleSwipe('left')}
                    variant="outline"
                    size="icon"
                    className="w-14 h-14 rounded-full border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:scale-110 transition-all shadow-sm"
                >
                    <X className="w-6 h-6" />
                </Button>

                <Button
                    onClick={() => {
                        setCurrentIndex(0);
                        setKnownWords([]);
                        setUnknownWords([]);
                    }}
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                    <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                    onClick={() => handleSwipe('right')}
                    variant="outline"
                    size="icon"
                    className="w-14 h-14 rounded-full border-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 hover:scale-110 transition-all shadow-sm"
                >
                    <Check className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
};

export default SwipeLearning;
