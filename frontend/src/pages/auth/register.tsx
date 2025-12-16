import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AuroraBackground from '@/components/layout/AuroraBackground';
import { ArrowRight, Mail, Lock as LockIcon, User, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate registration delay
        setTimeout(() => {
            setIsLoading(false);
            router.push('/dashboard');
        }, 1500);
    };

    return (
        <AuroraBackground>
            <Head>
                <title>회원가입 - Hungarian Pro</title>
                <meta name="description" content="헝가리어 마스터 회원가입" />
            </Head>

            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">회원가입</CardTitle>
                        <CardDescription className="text-slate-300">
                            새로운 여정을 시작하세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-200">이름</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="홍길동"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 hover:border-slate-600 transition-colors"
                                    />
                                </div>
                            </div>
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
                                        className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 hover:border-slate-600 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-200">비밀번호</Label>
                                <div className="relative">
                                    <LockIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 hover:border-slate-600 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="text-xs text-slate-400 pl-1">
                                <ul className="list-none space-y-1">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 8자 이상 비밀번호
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 특수문자 포함
                                    </li>
                                </ul>
                            </div>

                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 shadow-lg shadow-emerald-900/20 mt-2" disabled={isLoading}>
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                        가입 처리 중...
                                    </div>
                                ) : (
                                    <>가입 완료 <ArrowRight className="ml-2 h-4 w-4" /></>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-slate-800/50 pt-6 mt-2">
                        <p className="text-sm text-slate-400">
                            이미 계정이 있으신가요?{' '}
                            <Link href="/auth/login" className="text-emerald-400 font-semibold hover:text-emerald-300 hover:underline transition-colors">
                                로그인 하기
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </AuroraBackground>
    );
}
