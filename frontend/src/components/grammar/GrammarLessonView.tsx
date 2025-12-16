import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
    BookOpen,
    ChevronLeft,
    Clock,
    Award,
    Circle,
    Lightbulb,
    MessageCircle,
    Volume2,
    ChevronRight,
    Printer,
    GraduationCap,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Languages,
    Cross
} from 'lucide-react';
import { GrammarQuestionDialog } from '@/components/ai-tutor';
import { GrammarVisualization } from './GrammarVisualization';
import { BibleLink } from '@/components/bible/BibleLink';
import { PDFDownloadButton } from '@/components/common/PDFDownloadButton';
import ReactMarkdown from 'react-markdown';

interface GrammarLesson {
    id: string;
    titleKorean: string; // The backend uses this field name
    titleHungarian: string | null;
    level: string;
    orderIndex: number;
    explanationKorean: string;
    estimatedDuration: number;
    difficultyScore: number;
    tags: string[];
    examples: any[];
    grammarRules: any;
    koreanInterferenceNotes?: string;
    commonMistakes?: any[];
    comparisonWithKorean?: string;
    theologicalRelevance?: boolean;
    theologicalExamples?: string[];
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

interface GrammarLessonViewProps {
    lesson: GrammarLesson;
    level: string;
}

export const GrammarLessonView: React.FC<GrammarLessonViewProps> = ({ lesson, level }) => {
    const router = useRouter();

    const getDifficultyColor = (score: number) => {
        if (score <= 2) return 'bg-green-100 text-green-700';
        if (score <= 4) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    const getDifficultyLabel = (score: number) => {
        if (score <= 2) return '쉬움';
        if (score <= 4) return '보통';
        return '어려움';
    };

    const handleNextLesson = () => {
        alert('다음 강의로 이동하는 기능은 곧 제공됩니다.');
    };

    return (
        <>
            <Head>
                <title>{lesson.titleKorean} - 헝가리어 학습</title>
            </Head>

            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Header */}
                <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
                    <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/grammar/${level.toLowerCase()}`)}
                            className="gap-2 text-gray-600 hover:text-gray-900 -ml-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            {level.toUpperCase()} 목록
                        </Button>

                        <div className="flex items-center gap-2">
                            {/* PDF Download Button */}
                            <PDFDownloadButton
                                targetId="grammar-lesson-content"
                                filename={`${lesson.level}-${lesson.orderIndex}_${lesson.titleKorean}`}
                            />

                            <Badge className={getDifficultyColor(lesson.difficultyScore)}>
                                {getDifficultyLabel(lesson.difficultyScore)}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Main Content Area - This ID is used for PDF generation */}
                <div id="grammar-lesson-content" className="max-w-4xl mx-auto px-4 py-8 bg-gray-50">

                    {/* Title Section */}
                    <div className="mb-8 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                            <Badge variant="outline" className="bg-white text-blue-600 border-blue-200">
                                제 {lesson.orderIndex}과
                            </Badge>
                            <Badge variant="default" className="bg-blue-600">
                                {lesson.level}
                            </Badge>
                            <span className="flex items-center text-sm text-gray-500 ml-2">
                                <Clock className="h-3 w-3 mr-1" />
                                {lesson.estimatedDuration}분
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                            {lesson.titleKorean}
                        </h1>

                        {lesson.titleHungarian && (
                            <p className="text-xl sm:text-2xl text-blue-800 font-serif italic mb-4">
                                {lesson.titleHungarian}
                            </p>
                        )}

                        <div className="text-gray-700 text-lg leading-relaxed max-w-2xl">
                            <ReactMarkdown
                                components={{
                                    // Title Styling (Big & Distinct)
                                    h1: ({ node, ...props }) => <h1 className="text-3xl font-extrabold text-gray-900 mt-8 mb-4 tracking-tight" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-indigo-800 mt-8 mb-4 border-b-2 border-indigo-100 pb-2" {...props} />,
                                    h3: ({ node, ...props }) => (
                                        <div className="mt-8 mb-4">
                                            <h3 className="text-xl font-extrabold text-gray-800 bg-gray-100 px-4 py-2 rounded-lg inline-flex items-center gap-2 border-l-4 border-indigo-500 shadow-sm" {...props} />
                                        </div>
                                    ),

                                    // Indentation for Content
                                    p: ({ node, ...props }) => <p className="pl-4 mb-4 text-gray-700 leading-8" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="pl-8 mb-6 list-disc marker:text-indigo-400 space-y-2" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="pl-8 mb-6 list-decimal marker:text-indigo-600 font-medium space-y-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="pl-2" {...props} />,

                                    // "Pretty Box" for Quotes/Notices
                                    blockquote: ({ node, ...props }) => (
                                        <blockquote className="my-6 border-l-4 border-blue-500 bg-blue-50/50 p-6 rounded-r-xl shadow-sm italic text-gray-700 relative ml-4">
                                            <div className="absolute -top-3 -left-3 bg-blue-500 text-white rounded-full p-1 shadow-md">
                                                <Lightbulb className="w-4 h-4" />
                                            </div>
                                            {props.children}
                                        </blockquote>
                                    ),

                                    // Highlight/Code
                                    strong: ({ node, ...props }) => <strong className="font-bold text-indigo-900 bg-indigo-50 px-1 py-0.5 rounded" {...props} />,
                                    a: ({ node, ...props }) => <a {...props} className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition-colors" target="_blank" rel="noopener noreferrer" />,

                                    // Table styling inside markdown
                                    table: ({ node, ...props }) => <div className="overflow-x-auto my-6 ml-4 rounded-xl border border-gray-200 shadow-sm"><table className="w-full text-sm text-left" {...props} /></div>,
                                    thead: ({ node, ...props }) => <thead className="bg-gray-50 text-gray-700 uppercase" {...props} />,
                                    th: ({ node, ...props }) => <th className="px-6 py-3 font-bold border-b" {...props} />,
                                    td: ({ node, ...props }) => <td className="px-6 py-4 border-b last:border-0" {...props} />,
                                }}
                            >
                                {lesson.explanationKorean}
                            </ReactMarkdown>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                            {lesson.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* AI Tutor Callout */}
                    <Card className="mb-8 border-none shadow-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <CardContent className="pt-6 relative z-10 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5" />
                                    AI 튜터와 함께 공부하세요
                                </h3>
                                <p className="text-indigo-100 text-sm opacity-90">
                                    이해가 안 되는 문법이나 예문을 물어보시면 자세히 설명해 드립니다.
                                </p>
                            </div>
                            <GrammarQuestionDialog
                                grammarTopic={lesson.titleKorean}
                                userLevel={lesson.level}
                            />
                        </CardContent>
                    </Card>

                    {/* Content Tabs */}
                    <Tabs defaultValue="explanation" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-6 bg-white p-1 shadow-sm border rounded-xl overflow-x-auto">
                            <TabsTrigger value="explanation" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 min-w-max">
                                <BookOpen className="h-4 w-4 mr-2" />
                                핵심 설명
                            </TabsTrigger>
                            <TabsTrigger value="examples" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 min-w-max">
                                <Lightbulb className="h-4 w-4 mr-2" />
                                풍부한 예문
                            </TabsTrigger>
                            <TabsTrigger value="deepdive" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 min-w-max">
                                <GraduationCap className="h-4 w-4 mr-2" />
                                심화 학습
                            </TabsTrigger>
                            <TabsTrigger value="practice" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 min-w-max">
                                <Award className="h-4 w-4 mr-2" />
                                연습 문제
                            </TabsTrigger>
                        </TabsList>

                        {/* Content Accordion for Explanation */}
                        <TabsContent value="explanation" className="space-y-6 animate-in fade-in-50 duration-300">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                {/* If we have structured rules (new schema), use Accordion */}
                                {lesson.grammarRules?.rules ? (
                                    <Accordion type="single" collapsible className="w-full space-y-4">
                                        {lesson.grammarRules.rules.map((rule: any, idx: number) => (
                                            <AccordionItem key={idx} value={`rule-${idx}`} className="border rounded-xl px-4 data-[state=open]:bg-blue-50/50 data-[state=open]:border-blue-200 transition-all">
                                                <AccordionTrigger className="hover:no-underline py-4">
                                                    <div className="flex flex-col items-start text-left gap-1">
                                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                                                {idx + 1}
                                                            </span>
                                                            {rule.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 font-normal pl-8 line-clamp-1">
                                                            {rule.description ? rule.description.substring(0, 60) + "..." : "펼쳐서 자세히 보기"}
                                                        </p>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-2 pb-4 pl-8">
                                                    <div className="prose prose-sm max-w-none text-gray-700 mb-4">
                                                        <ReactMarkdown>{rule.description}</ReactMarkdown>
                                                    </div>
                                                    {rule.table && (
                                                        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm my-4 bg-white">
                                                            <table className="w-full text-sm text-left">
                                                                <thead className="bg-gray-50 text-gray-700 border-b">
                                                                    <tr>
                                                                        {rule.table.headers.map((h: string, i: number) => (
                                                                            <th key={i} className="px-4 py-3 font-bold whitespace-pre-line">{h}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {rule.table.rows.map((row: string[], rI: number) => (
                                                                        <tr key={rI} className="hover:bg-gray-50/50">
                                                                            {row.map((cell: string, cI: number) => (
                                                                                <td key={cI} className="px-4 py-3">
                                                                                    <ReactMarkdown components={{ p: ({ node, ...props }) => <span {...props} /> }}>
                                                                                        {cell}
                                                                                    </ReactMarkdown>
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                    {rule.pattern && !rule.table && (
                                                        <div className="bg-gray-800 text-gray-100 p-4 rounded-lg font-mono text-sm shadow-inner">
                                                            {rule.pattern}
                                                        </div>
                                                    )}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                ) : (
                                    // Fallback for generic explanation
                                    <div className="prose max-w-none text-gray-700">
                                        <ReactMarkdown>{typeof lesson.grammarRules === 'string' ? lesson.grammarRules : JSON.stringify(lesson.grammarRules)}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* 2. Examples Tab */}
                        <TabsContent value="examples" className="space-y-6 animate-in fade-in-50 duration-300">
                            {lesson.examples?.map((ex, idx) => (
                                <Card key={idx} className="border-0 shadow-sm ring-1 ring-gray-100">
                                    <CardHeader>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        {(ex.items) ? (
                                            // It's a group
                                            <div className="space-y-4">
                                                <h3 className="font-bold text-lg text-gray-800 mb-2">{ex.category}</h3>
                                                {ex.items.map((item: any, i: number) => (
                                                    <div key={i} className="flex flex-col border-l-2 border-blue-400 pl-4 py-3 hover:bg-gray-50 rounded-r group transition-all">
                                                        <div className="flex justify-between items-start w-full">
                                                            <div>
                                                                <p className="font-medium text-lg text-gray-900">{item.hungarian}</p>
                                                                <p className="text-gray-600 mb-2"><BibleLink text={item.korean} /></p>
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="opacity-50 group-hover:opacity-100">
                                                                <Volume2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        {item.grammar && (
                                                            <div className="text-sm bg-yellow-50 text-yellow-800 px-3 py-2 rounded-md mb-2 flex items-start gap-2">
                                                                <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-yellow-600" />
                                                                <span>{item.grammar}</span>
                                                            </div>
                                                        )}

                                                        {item.vocabulary && item.vocabulary.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                                {item.vocabulary.map((vocab: string, vIdx: number) => (
                                                                    <Badge key={vIdx} variant="outline" className="text-xs text-gray-500 border-gray-200 bg-white">
                                                                        {vocab}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            // It's a flat example
                                            <div className="flex justify-between items-start border-l-4 border-indigo-400 bg-white p-4 mb-3 rounded-r-lg shadow-sm hover:translate-x-1 transition-transform">
                                                <div className="flex-1">
                                                    {ex.context && (
                                                        <Badge variant="outline" className="mb-2 text-indigo-500 border-indigo-200">
                                                            {ex.context}
                                                        </Badge>
                                                    )}
                                                    <p className="font-semibold text-lg text-gray-900 mb-1 leading-snug">
                                                        {ex.hu}
                                                    </p>
                                                    <p className="text-gray-600 font-medium">
                                                        <BibleLink text={ex.ko} />
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-indigo-600">
                                                    <Volume2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}

                            {(!lesson.examples || lesson.examples.length === 0) && (
                                <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed">
                                    등록된 예문이 없습니다.
                                </div>
                            )}
                        </TabsContent>

                        {/* 3. Deep Dive Tab (Enhanced with Mistake Clinic) */}
                        <TabsContent value="deepdive" className="space-y-6 animate-in fade-in-50 duration-300">

                            {/* Comparison - Keep as Card */}
                            {lesson.comparisonWithKorean && (
                                <Card className="border-l-4 border-l-green-500 shadow-sm">
                                    <CardHeader className="bg-gradient-to-r from-green-50 to-white pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                                            <Languages className="h-5 w-5" />
                                            한국어 vs 헝가리어
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                                            <ReactMarkdown
                                                components={{
                                                    h3: ({ node, ...props }) => (
                                                        <div className="mt-6 mb-3">
                                                            <h3 className="text-lg font-bold text-green-800 bg-green-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 border-l-4 border-green-500 shadow-sm" {...props} />
                                                        </div>
                                                    ),
                                                    h4: ({ node, ...props }) => <h4 className="text-base font-bold text-green-700 mt-4 mb-2 ml-2" {...props} />,
                                                    p: ({ node, ...props }) => <p className="pl-4 mb-3 text-gray-700 leading-7" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="pl-8 mb-4 list-disc marker:text-green-500 space-y-1" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="pl-8 mb-4 list-decimal marker:text-green-600 font-medium space-y-1" {...props} />,
                                                    blockquote: ({ node, ...props }) => (
                                                        <blockquote className="my-4 border-l-4 border-green-400 bg-green-50/50 p-4 rounded-r-lg shadow-sm italic text-gray-600 ml-4 relative">
                                                            <div className="absolute -top-2 -left-2 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                                                                <Lightbulb className="w-3 h-3" />
                                                            </div>
                                                            {props.children}
                                                        </blockquote>
                                                    ),
                                                    strong: ({ node, ...props }) => <strong className="font-bold text-green-900 bg-green-100 px-1 rounded" {...props} />,
                                                }}
                                            >
                                                {lesson.comparisonWithKorean}
                                            </ReactMarkdown>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Korean Interference - Keep as Card but make it pop */}
                            {lesson.koreanInterferenceNotes && (
                                <Card className="border-l-4 border-l-orange-500 shadow-sm">
                                    <CardHeader className="bg-gradient-to-r from-orange-50 to-white pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                                            <AlertTriangle className="h-5 w-5" />
                                            한국인 학습자 주의사항
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                                            <ReactMarkdown
                                                components={{
                                                    h3: ({ node, ...props }) => (
                                                        <div className="mt-6 mb-3">
                                                            <h3 className="text-lg font-bold text-orange-800 bg-orange-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 border-l-4 border-orange-500 shadow-sm" {...props} />
                                                        </div>
                                                    ),
                                                    h4: ({ node, ...props }) => <h4 className="text-base font-bold text-orange-700 mt-4 mb-2 ml-2 flex items-center gap-1" {...props} />,
                                                    p: ({ node, ...props }) => <p className="pl-4 mb-3 text-gray-700 leading-7" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="pl-8 mb-4 list-disc marker:text-orange-500 space-y-1" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="pl-8 mb-4 list-decimal marker:text-orange-600 font-medium space-y-1" {...props} />,
                                                    blockquote: ({ node, ...props }) => (
                                                        <blockquote className="my-4 border-l-4 border-orange-400 bg-orange-50/50 p-4 rounded-r-lg shadow-sm italic text-gray-600 ml-4 relative">
                                                            <div className="absolute -top-2 -left-2 bg-orange-500 text-white rounded-full p-0.5 shadow-sm">
                                                                <AlertTriangle className="w-3 h-3" />
                                                            </div>
                                                            {props.children}
                                                        </blockquote>
                                                    ),
                                                    strong: ({ node, ...props }) => <strong className="font-bold text-orange-900 bg-orange-100 px-1 rounded" {...props} />,
                                                }}
                                            >
                                                {lesson.koreanInterferenceNotes}
                                            </ReactMarkdown>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Mistake Clinic (INTERACTIVE!) */}
                            {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
                                <Card className="border-l-4 border-l-red-500 shadow-sm overflow-hidden">
                                    <CardHeader className="bg-gradient-to-r from-red-50 to-white pb-3 border-b border-red-100">
                                        <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                                            <XCircle className="h-5 w-5" />
                                            자주 틀리는 실수 클리닉
                                        </CardTitle>
                                        <CardDescription>
                                            틀린 이유를 스스로 생각해보고 설명을 확인하세요.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0 px-0">
                                        <Accordion type="single" collapsible className="w-full">
                                            {lesson.commonMistakes.map((mistake, idx) => (
                                                <AccordionItem key={idx} value={`mistake-${idx}`} className="border-b last:border-0 px-6 data-[state=open]:bg-red-50/30 transition-colors">
                                                    <AccordionTrigger className="hover:no-underline py-4 group">
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full text-left">
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">BAD</span>
                                                                <span className="line-through text-gray-500 font-medium decoration-red-400 group-hover:text-red-600 transition-colors">{mistake.mistake}</span>
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 text-gray-300 hidden sm:block" />
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">GOOD</span>
                                                                <span className="font-bold text-gray-800">{mistake.correct}</span>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pt-0 pb-4">
                                                        <div className="bg-white rounded-lg p-4 border border-red-100 shadow-sm mt-2 flex gap-4 items-start">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-sm text-red-800 mb-1 flex items-center gap-1">
                                                                    <Lightbulb className="h-4 w-4" />
                                                                    왜 틀렸을까요?
                                                                </h4>
                                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                                    {mistake.explanation}
                                                                </p>
                                                            </div>
                                                            <div className="shrink-0">
                                                                <GrammarQuestionDialog
                                                                    grammarTopic={lesson.titleKorean}
                                                                    userLevel={lesson.level}
                                                                    triggerText="AI에게 질문"
                                                                    triggerVariant="outline"
                                                                    initialQuestion={`"${mistake.mistake}"가 틀리고 "${mistake.correct}"가 맞는 이유가 "${mistake.explanation}"라고 하는데, 더 쉽게 설명해줄 수 있어?`}
                                                                />
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Theological Relevance - Keeping it simpler but visual */}
                            {(lesson.theologicalRelevance || (lesson.theologicalExamples && lesson.theologicalExamples.length > 0)) && (
                                <Card className="border-l-4 border-l-indigo-500 shadow-sm">
                                    <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2 text-indigo-800">
                                            <Cross className="h-5 w-5" />
                                            선교적 적용 (Theological Context)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        <p className="text-gray-700">
                                            이 문법은 성경과 설교에서 다음과 같이 사용됩니다:
                                        </p>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {lesson.theologicalExamples?.map((ex, idx) => (
                                                <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm hover:shadow-md transition-all hover:bg-indigo-50/30">
                                                    <div className="h-2 w-2 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                                                    <span className="text-indigo-900 font-medium text-sm leading-relaxed">
                                                        <BibleLink text={ex} />
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* 4. Practice Tab */}
                        <TabsContent value="practice" className="animate-in fade-in-50 duration-300">
                            <Card className="bg-white border-dashed border-2 border-gray-200 shadow-none">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Award className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">연습 문제 준비 중</h3>
                                    <p className="text-center text-gray-500 max-w-md">
                                        현재 이 강의를 위한 맞춤형 연습 문제를 생성하고 있습니다.<br />
                                        핵심 설명과 예문을 충분히 익힌 후 다시 확인해주세요.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Footer Navigation */}
                    <div className="mt-12 flex justify-between items-center pt-8 border-t">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => router.push(`/grammar/${level.toLowerCase()}`)}
                            className="text-gray-600"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            목록으로
                        </Button>

                        <Button
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                            onClick={handleNextLesson}
                        >
                            다음 강의
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
