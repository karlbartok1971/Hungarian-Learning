import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
    Volume2, ArrowRight, ArrowLeft, RotateCcw, CheckCircle2,
    Sparkles, Keyboard, LayoutGrid, BookOpen, Star, Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTTS } from '@/hooks/useTTS';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/api';

// --- Types ---
interface Word {
    hu: string;
    ko: string;
    pron: string;
    pos: string;
    exHu: string;
    exKo: string;
}

interface Topic {
    id: string;
    title: string;
    emoji: string;
    words: Word[];
}

interface VocabularyData {
    level: string;
    title: string;
    description: string;
    topics: Topic[];
}

export default function LevelLearningPage() {
    const router = useRouter();
    const { level } = router.query;
    const { speak, isSpeaking } = useTTS();

    // Data State
    const [data, setData] = useState<VocabularyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI State
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isPressingAction, setIsPressingAction] = useState(false);

    // Bookmark State
    const [savedWords, setSavedWords] = useState<Word[]>([]);

    // Load Saved Words
    useEffect(() => {
        const saved = localStorage.getItem('myVocabulary');
        if (saved) {
            setSavedWords(JSON.parse(saved));
        }
    }, []);

    // Toggle Save
    const toggleSave = useCallback((word: Word, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSavedWords(prev => {
            const exists = prev.find(w => w.hu === word.hu);
            let newSaved;
            if (exists) {
                newSaved = prev.filter(w => w.hu !== word.hu);
            } else {
                newSaved = [...prev, word];
            }
            localStorage.setItem('myVocabulary', JSON.stringify(newSaved));
            return newSaved;
        });
    }, []);

    const isSaved = useCallback((word: Word) => {
        return savedWords.some(w => w.hu === word.hu);
    }, [savedWords]);

    // Fetch Data
    useEffect(() => {
        if (!level || typeof level !== 'string') return;

        setLoading(true);
        // [Hardcoded Fix] 하드코딩 주소 사용 (가장 확실함)
        const targetUrl = `${API_BASE_URL}/vocabulary/${level}`;
        console.log(`Fetching vocabulary from: ${targetUrl}`);

        fetch(targetUrl)
            .then(async res => {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText.substring(0, 100)}`);
                }
                return res.json();
            })
            .then((data: VocabularyData) => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Vocabulary Fetch Error:", err);
                setError(err.message); // 상세 에러 메시지 표시
                setLoading(false);
            });
    }, [level]);

    // Topic Selection Handler
    const handleSelectTopic = (topic: Topic) => {
        setSelectedTopic(topic);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const handleSelectSaved = () => {
        if (savedWords.length === 0) {
            alert("아직 저장된 단어가 없습니다. 단어 카드 위의 별표를 눌러 단어를 저장해보세요!");
            return;
        }
        // 가상의 토픽 생성
        const savedTopic: Topic = {
            id: 'saved',
            title: '내 단어장',
            emoji: '⭐',
            words: savedWords
        };
        setSelectedTopic(savedTopic);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const handleBackToTopics = () => {
        setSelectedTopic(null);
        setCurrentIndex(0); // Reset index
    };

    // PDF Export Handler
    const handleExportPDF = () => {
        if (savedWords.length === 0) return;

        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("My Hungarian Vocabulary", 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Total Words: ${savedWords.length}`, 14, 30);

        const tableData = savedWords.map(word => [
            word.hu,
            word.pron,
            word.pos,
            word.ko,
            word.exHu
        ]);

        autoTable(doc, {
            head: [['Hungarian', 'Pronunciation', 'POS', 'Korean (Meaning)', 'Example']],
            body: tableData,
            startY: 40,
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [79, 70, 229], textColor: 255 }, // Indigo-600 color
            alternateRowStyles: { fillColor: [245, 247, 255] },
        });

        doc.save('hungarian-vocabulary.pdf');
    };

    // Learning Handlers
    const currentWords = selectedTopic?.words || [];
    const currentWord = currentWords[currentIndex];
    const progress = currentWords.length > 0 ? Math.round(((currentIndex + 1) / currentWords.length) * 100) : 0;

    const handleNext = useCallback(() => {
        if (currentIndex < currentWords.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
        }
    }, [currentIndex, currentWords.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
        }
    }, [currentIndex]);

    const handleFlip = useCallback(() => {
        setIsFlipped(prev => !prev);
    }, []);

    const handlePlayAudio = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentWord) speak(currentWord.hu);
    }, [currentWord, speak]);

    // Keyboard Events
    useEffect(() => {
        if (!selectedTopic) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.querySelector('[role="dialog"]')) return;

            switch (e.code) {
                case 'Space':
                case 'Enter':
                    e.preventDefault();
                    handleFlip();
                    setIsPressingAction(true);
                    setTimeout(() => setIsPressingAction(false), 200);
                    break;
                case 'ArrowRight':
                    handleNext();
                    break;
                case 'ArrowLeft':
                    handlePrev();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    handlePlayAudio();
                    break;
                case 'Escape':
                    handleBackToTopics();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedTopic, handleFlip, handleNext, handlePrev, handlePlayAudio]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error || !data) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <p className="text-xl text-red-500 font-bold">{error || "데이터 없음"}</p>
            <Button onClick={() => router.back()}>돌아가기</Button>
        </div>
    );

    return (
        <>
            <Head>
                <title>{data.title} | 헝가리어 마스터</title>
            </Head>

            <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">

                {/* --- 1. 토픽 선택 화면 (Topic Selection) --- */}
                {!selectedTopic && (
                    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-8">
                            <Button variant="ghost" onClick={() => router.back()}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> 뒤로
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{data.title}</h1>
                                <p className="text-gray-500">{data.description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Special Card: My Vocabulary */}
                            <Card
                                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-yellow-100 bg-yellow-50/50 group relative overflow-hidden"
                                onClick={handleSelectSaved}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Star className="w-24 h-24 text-yellow-500 fill-yellow-500" />
                                </div>
                                <CardHeader className="flex flex-row items-center gap-4 relative z-10">
                                    <div className="text-4xl bg-yellow-100 p-3 rounded-2xl group-hover:bg-yellow-200 transition-colors shadow-sm">
                                        ⭐
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl mb-1 text-yellow-900 group-hover:text-yellow-700 transition-colors">
                                            내 단어장
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 text-yellow-700/80">
                                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> {savedWords.length} 저장됨
                                        </CardDescription>
                                    </div>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-yellow-600">
                                        <ArrowRight className="w-6 h-6" />
                                    </div>
                                </CardHeader>
                            </Card>

                            {data.topics.map((topic) => (
                                <Card
                                    key={topic.id}
                                    className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 hover:border-indigo-200 group"
                                    onClick={() => handleSelectTopic(topic)}
                                >
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className="text-4xl bg-gray-50 p-3 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                            {topic.emoji}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl mb-1 group-hover:text-indigo-700 transition-colors">
                                                {topic.title}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4" /> {topic.words.length} 단어
                                            </CardDescription>
                                        </div>
                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500">
                                            <ArrowRight className="w-6 h-6" />
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- 2. 카드 학습 화면 (Learning Mode) --- */}
                {selectedTopic && currentWord && (
                    <div className="w-full max-w-2xl animate-in zoom-in-95 duration-300">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between mb-8">
                            <Button
                                variant="outline"
                                className="h-12 px-6 text-base font-medium border-2 border-indigo-100 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm"
                                onClick={handleBackToTopics}
                            >
                                <LayoutGrid className="mr-2 h-5 w-5" /> 주제 목록으로
                            </Button>

                            {/* PDF Download Button (Visible only in Saved Words Mode) */}
                            {selectedTopic.id === 'saved' && (
                                <Button
                                    variant="outline"
                                    className="h-12 px-6 ml-4 text-base font-medium border-2 border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 transition-all shadow-sm group"
                                    onClick={handleExportPDF}
                                >
                                    <Download className="mr-2 h-5 w-5 group-hover:animate-bounce" /> PDF 다운로드
                                </Button>
                            )}

                            {/* Right Side: Topic Badge & Shortcuts */}
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-lg px-3 py-1">
                                    {selectedTopic.emoji} {selectedTopic.title}
                                </Badge>

                                {/* 단축키 안내 */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2 text-gray-500 hover:text-indigo-600 border-dashed">
                                            <Keyboard className="w-4 h-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>키보드 컨트롤</DialogTitle>
                                            <DialogDescription>
                                                ESC를 누르면 목록으로 돌아갑니다.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>단축키</TableHead>
                                                    <TableHead>기능</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell><Badge variant="outline">Space</Badge></TableCell>
                                                    <TableCell>뒤집기</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell><Badge variant="outline">↑</Badge></TableCell>
                                                    <TableCell>발음 듣기</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell><Badge variant="outline">→</Badge></TableCell>
                                                    <TableCell>다음</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-sm font-medium text-gray-500 w-10">{progress}%</span>
                            <Progress
                                value={progress}
                                className="h-2 flex-1 bg-gray-200 [&>div]:bg-indigo-600"
                            />
                            <span className="text-sm font-medium text-gray-500 w-12 text-right">
                                {currentIndex + 1}/{currentWords.length}
                            </span>
                        </div>

                        {/* 3D Card Area */}
                        <div className="perspective-1000 w-full flex justify-center mb-8">
                            <motion.div
                                className="relative w-full max-w-sm aspect-[3/4] cursor-pointer"
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                onClick={handleFlip}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {/* FRONT */}
                                <div
                                    className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-gray-200 flex flex-col items-center justify-center p-8 active:scale-[0.98] transition-transform"
                                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                                >
                                    {/* Bookmark Button (Front) */}
                                    <div className="absolute top-6 right-6 z-30">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={(e) => toggleSave(currentWord, e)}
                                            className="rounded-full w-10 h-10 shadow-md bg-white hover:bg-yellow-50 border border-gray-100"
                                        >
                                            <Star
                                                className={cn(
                                                    "w-5 h-5 transition-all text-gray-300",
                                                    isSaved(currentWord) && "fill-yellow-400 text-yellow-400 scale-110"
                                                )}
                                            />
                                        </Button>
                                    </div>

                                    <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-3xl" />
                                    {isPressingAction && <div className="absolute inset-0 bg-indigo-50/50 z-0 animate-pulse rounded-3xl" />}

                                    <div className="absolute top-8 left-8 opacity-10">
                                        <Sparkles size={60} className="text-indigo-500" />
                                    </div>

                                    <span className="text-xs font-bold text-indigo-500 tracking-widest mb-6 uppercase z-10">HUNGARIAN</span>

                                    <h1 className="text-5xl font-black text-gray-900 mb-8 text-center leading-tight z-10 break-words max-w-full">
                                        {currentWord.hu}
                                    </h1>

                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className={cn(
                                            "rounded-full w-16 h-16 shadow-lg hover:scale-110 transition-transform z-20",
                                            isSpeaking && "ring-4 ring-indigo-100 bg-indigo-50"
                                        )}
                                        onClick={handlePlayAudio}
                                    >
                                        <Volume2 className={cn("h-8 w-8 text-gray-600", isSpeaking && "text-indigo-600 animate-pulse")} />
                                    </Button>

                                    <p className="mt-8 text-gray-400 text-xs animate-pulse z-10">Space to Flip</p>
                                </div>

                                {/* BACK */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-slate-800 to-indigo-950 rounded-3xl shadow-xl flex flex-col p-8 text-white"
                                    style={{
                                        transform: "rotateY(180deg)",
                                        backfaceVisibility: 'hidden',
                                        WebkitBackfaceVisibility: 'hidden'
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-6 w-full relative z-30">
                                        <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">{currentWord.pos}</Badge>
                                        <div className="flex gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={(e) => toggleSave(currentWord, e)}
                                                className="text-white/70 hover:text-yellow-300 hover:bg-white/10 rounded-full"
                                            >
                                                <Star className={cn("h-5 w-5", isSaved(currentWord) && "fill-yellow-400 text-yellow-400")} />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={handlePlayAudio} className="text-white/70 hover:text-white rounded-full">
                                                <Volume2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                                        <h2 className="text-4xl font-bold mb-4">{currentWord.ko}</h2>
                                        <p className="text-indigo-200 text-lg font-light mb-8">{currentWord.pron}</p>

                                        <div className="w-full bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/5 shadow-inner">
                                            <p className="text-lg font-medium mb-2 text-indigo-100 italic">"{currentWord.exHu}"</p>
                                            <p className="text-sm text-gray-400">{currentWord.exKo}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 flex justify-center text-gray-400 text-xs gap-1 cursor-pointer hover:text-white" onClick={handleFlip}>
                                        <RotateCcw className="w-3 h-3" /> 다시 앞면으로
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Bottom Controls */}
                        <div className="flex items-center justify-center gap-6">
                            <Button size="icon" variant="outline" className="h-12 w-12 rounded-full border-2" onClick={handlePrev} disabled={currentIndex === 0}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>

                            <Button
                                className="h-14 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-md text-base font-bold gap-2 hover:-translate-y-1 transition-all"
                                onClick={handleNext}
                                disabled={currentIndex === currentWords.length - 1}
                            >
                                <CheckCircle2 className="h-5 w-5" /> 다음 단어
                            </Button>

                            <Button size="icon" variant="outline" className="h-12 w-12 rounded-full border-2" onClick={handleNext} disabled={currentIndex === currentWords.length - 1}>
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </div>

                    </div>
                )}
            </div>
        </>
    );
}
