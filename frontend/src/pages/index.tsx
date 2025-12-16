/**
 * 랜딩 페이지
 * 헝가리어 학습 플랫폼의 메인 홈페이지 (Aurora Theme)
 */

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/layout/AuroraBackground';
import {
  BookOpen,
  Target,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  MessageSquare,
  Globe,
  Trophy,
  Sparkles,
  ChevronRight,
  Menu
} from 'lucide-react';

const LandingPage = () => {
  // 주요 기능
  const features = [
    {
      icon: Target,
      title: '정확한 레벨 진단',
      description: 'A1부터 B2까지 체계적인 레벨 테스트로 현재 실력을 정확하게 측정하세요.',
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30'
    },
    {
      icon: BookOpen,
      title: '맞춤형 학습 경로',
      description: '개인의 레벨과 목표에 맞춘 커리큘럼으로 효율적인 학습을 제공합니다.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/30'
    },
    {
      icon: MessageSquare,
      title: '설교문 작성 특화',
      description: '목회자를 위한 전문 종교 어휘와 설교문 작성 연습 기능을 제공합니다.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/30'
    },
    {
      icon: Sparkles,
      title: 'AI 기반 피드백',
      description: '작문에 대한 즉각적이고 정확한 AI 피드백으로 빠르게 실력을 향상하세요.',
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/30'
    },
  ];

  // 학습 레벨
  const levels = [
    {
      level: 'A1',
      title: '기초',
      description: '기본 인사와 일상 표현',
      color: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300',
      badgeColor: 'bg-emerald-500 text-white',
      features: ['기초 어휘 300개', '현재시제 동사', '기본 격변화'],
    },
    {
      level: 'A2',
      title: '초급',
      description: '일상 대화와 간단한 문장',
      color: 'bg-blue-500/10 border-blue-500/50 text-blue-300',
      badgeColor: 'bg-blue-500 text-white',
      features: ['어휘 600개', '과거시제', '복합 문장'],
    },
    {
      level: 'B1',
      title: '중급',
      description: '복잡한 주제의 이해와 표현',
      color: 'bg-purple-500/10 border-purple-500/50 text-purple-300',
      badgeColor: 'bg-purple-500 text-white',
      features: ['어휘 1200개', '조건법', '설교문 작성'],
    },
    {
      level: 'B2',
      title: '고급',
      description: '유창한 의사소통과 전문 어휘',
      color: 'bg-orange-500/10 border-orange-500/50 text-orange-300',
      badgeColor: 'bg-orange-500 text-white',
      features: ['어휘 2000개', '고급 문법', '학술 작문'],
    },
  ];

  // 사용자 후기 (Mock)
  const testimonials = [
    {
      name: '김목사',
      role: '부다페스트 한인교회',
      content: '설교문 작성 기능 덕분에 헝가리어 설교 준비 시간이 절반으로 줄었습니다. AI 피드백이 정말 정확해요!',
      rating: 5,
      avatarBg: 'from-blue-500 to-cyan-500',
    },
    {
      name: '이선교사',
      role: '헝가리 선교사',
      content: 'A1부터 차근차근 배워서 이제 현지인들과 자연스럽게 대화할 수 있게 되었습니다. 커리큘럼이 최고예요.',
      rating: 5,
      avatarBg: 'from-purple-500 to-pink-500',
    },
    {
      name: '박전도사',
      role: '신학대학원생',
      content: '종교 전문 어휘가 풍부해서 신학 공부에 큰 도움이 됩니다. 특히 성경 번역 연습이 유용해요.',
      rating: 5,
      avatarBg: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <AuroraBackground>
      <Head>
        <title>헝가리어 마스터 - 오로라</title>
        <meta
          name="description"
          content="A1부터 B2까지 체계적인 헝가리어 학습. 설교문 작성, AI 피드백, 맞춤형 커리큘럼으로 효율적인 학습을 경험하세요."
        />
      </Head>

      {/* 네비게이션 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-2xl">🇭🇺</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Hungarian Pro</h1>
                <p className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">Aurora Edition</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">로그인</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105">
                  무료 시작하기
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" className="text-slate-300">
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-20 px-4 md:pt-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto text-center relative z-10 mb-20 md:mb-32">
          <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            <span>목회자를 위한 프리미엄 헝가리어 학습</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
            헝가리어로<br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 ml-2 md:ml-4">
              설교하고 소통하세요
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            AI 기반 피드백과 체계적인 커리큘럼으로<br className="hidden md:block" />
            언어의 장벽을 넘어 더 깊은 사역의 길을 엽니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Link href="/auth/register">
              <Button size="lg" className="h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all shadow-xl shadow-indigo-500/20 rounded-full font-bold">
                <Zap className="w-5 h-5 mr-2 fill-slate-900" />
                지금 무료로 시작하기
              </Button>
            </Link>
            <Link href="/assessment/start">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-600 text-slate-200 hover:bg-white/10 hover:text-white hover:border-white rounded-full bg-transparent backdrop-blur-sm">
                <Target className="w-5 h-5 mr-2" />
                레벨 테스트
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1,234명 함께 공부 중
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% 무료 체험
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto mb-32 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">왜 Hungarian Pro인가요?</h2>
            <p className="text-slate-400">목회자를 위해 설계된 특별한 기능을 경험하세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className={`bg-slate-900/40 backdrop-blur-md border-white/10 hover:bg-slate-800/50 transition-all hover:-translate-y-1 duration-300 group`}>
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.border} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-white text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Level System */}
        <section className="max-w-7xl mx-auto mb-32 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 px-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">체계적인 성장 로드맵</h2>
              <p className="text-slate-400">기초 인사말부터 고급 설교까지, 단계별로 정복하세요</p>
            </div>
            <Button variant="link" className="text-indigo-400 hover:text-indigo-300 p-0 mt-4 md:mt-0">
              전체 커리큘럼 보기 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.map((level, idx) => (
              <Card key={idx} className={`relative overflow-hidden bg-slate-900/40 backdrop-blur-md border hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 ${level.color}`}>
                <div className={`absolute top-0 right-0 p-4 opacity-10`}>
                  <h3 className="text-6xl font-black">{level.level}</h3>
                </div>
                <CardHeader>
                  <Badge className={`w-fit mb-3 ${level.badgeColor} border-0`}>{level.level}</Badge>
                  <CardTitle className="text-white text-2xl">{level.title}</CardTitle>
                  <CardDescription className="text-slate-300 font-medium">{level.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {level.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-7xl mx-auto mb-20 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-yellow-500/50 text-yellow-500">후기</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">함께 성장하는 동역자들</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 leading-relaxed">"{t.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarBg} flex items-center justify-center text-white font-bold`}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{t.name}</p>
                      <p className="text-slate-500 text-xs">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto relative z-10">
          <Card className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 border-indigo-500/30 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            <CardContent className="py-16 text-center relative z-10">
              <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">지금 바로 시작하세요</h2>
              <p className="text-indigo-200 text-lg mb-8 max-w-2xl mx-auto">
                하나님이 주신 언어의 은사로<br />더 넓은 세상과 소통할 준비가 되셨나요?
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="h-14 px-10 text-lg bg-white text-indigo-900 hover:bg-indigo-50 font-bold shadow-xl shadow-black/20">
                  무료 회원가입
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950/80 border-t border-white/5 py-12 px-4 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇭🇺</span>
            <span className="text-white font-bold">Hungarian Pro</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 Hungarian Pro. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-slate-400 hover:text-white transition-colors"><Globe className="w-5 h-5" /></Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors"><MessageSquare className="w-5 h-5" /></Link>
          </div>
        </div>
      </footer>
    </AuroraBackground>
  );
};

export default LandingPage;
