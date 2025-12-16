import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AuroraBackground from '@/components/layout/AuroraBackground';
import { ArrowRight, Mail, Lock as LockIcon, Github, Chrome } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login delay
        setTimeout(() => {
            setIsLoading(false);
            // For demo, just redirect to dashboard
            router.push('/dashboard');
        }, 1500);
    };

    return (
        <AuroraBackground>
            <Head>
                <title>로그인 - Hungarian Pro</title>
                <meta name="description" content="헝가리어 마스터 로그인" />
            </Head>

            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                            <span className="text-2xl">🇭🇺</span>
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">환영합니다</CardTitle>
                        <CardDescription className="text-slate-300">
                            계정에 로그인하여 학습을 계속하세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleLogin} className="space-y-4">
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
                                        className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 hover:border-slate-600 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-200">비밀번호</Label>
                                    <Link href="/auth/forgot-password" className="text-xs text-indigo-300 hover:text-indigo-200 hover:underline">
                                        비밀번호를 잊으셨나요?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <LockIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 hover:border-slate-600 transition-colors"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 shadow-lg shadow-indigo-900/20" disabled={isLoading}>
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                        로그인 중...
                                    </div>
                                ) : (
                                    <>로그인 <ArrowRight className="ml-2 h-4 w-4" /></>
                                )}
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0f172a] px-2 text-slate-400 rounded-lg selection:bg-none">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="bg-slate-900/50 border-slate-700 text-white hover:bg-slate-800 hover:text-white transition-colors">
                                <Github className="mr-2 h-4 w-4" /> Github
                            </Button>
                            <Button variant="outline" className="bg-slate-900/50 border-slate-700 text-white hover:bg-slate-800 hover:text-white transition-colors">
                                <Chrome className="mr-2 h-4 w-4 text-red-500" /> Google
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-slate-800/50 pt-6 mt-2">
                        <p className="text-sm text-slate-400">
                            계정이 없으신가요?{' '}
                            <Link href="/auth/register" className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline transition-colors">
                                회원가입 하기
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </AuroraBackground>
    );
}
