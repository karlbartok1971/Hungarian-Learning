import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AuroraBackground from '@/components/layout/AuroraBackground';
import { ArrowLeft, Mail, Send, Lock as LockIcon } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true);
        }, 1500);
    };

    return (
        <AuroraBackground>
            <Head>
                <title>비밀번호 찾기 - Hungarian Pro</title>
                <meta name="description" content="비밀번호 재설정" />
            </Head>

            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
                            <LockIcon className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">비밀번호 찾기</CardTitle>
                        <CardDescription className="text-slate-300">
                            가입하신 이메일로 재설정 링크를 보내드립니다
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isSent ? (
                            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                                <div className="bg-emerald-500/20 text-emerald-300 p-4 rounded-lg border border-emerald-500/30">
                                    <p className="font-semibold">이메일 전송 완료!</p>
                                    <p className="text-sm opacity-90 mt-1">{email}로 링크를 보냈습니다.</p>
                                </div>
                                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white" onClick={() => setIsSent(false)}>
                                    다시 입력하기
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-200">이메일</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 hover:border-slate-600 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-11 shadow-lg shadow-orange-900/20" disabled={isLoading}>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                            전송 중...
                                        </div>
                                    ) : (
                                        <>링크 보내기 <Send className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-slate-800/50 pt-6 mt-2">
                        <Link href="/auth/login" className="flex items-center text-sm text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> 로그인으로 돌아가기
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </AuroraBackground>
    );
}
