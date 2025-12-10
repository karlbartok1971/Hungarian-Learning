/**
 * 랜딩 페이지
 * 헝가리어 학습 플랫폼의 메인 홈페이지
 */

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Target,
  TrendingUp,
  Award,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  MessageSquare,
  Globe,
  Clock,
  Trophy,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const LandingPage = () => {
  const router = useRouter();

  // 주요 기능
  const features = [
    {
      icon: Target,
      title: '정확한 레벨 진단',
      description: 'A1부터 B2까지 체계적인 레벨 테스트로 현재 실력을 정확하게 측정하세요.',
      color: 'blue',
    },
    {
      icon: BookOpen,
      title: '맞춤형 학습 경로',
      description: '개인의 레벨과 목표에 맞춘 커리큘럼으로 효율적인 학습을 제공합니다.',
      color: 'purple',
    },
    {
      icon: MessageSquare,
      title: '설교문 작성 특화',
      description: '목회자를 위한 전문 종교 어휘와 설교문 작성 연습 기능을 제공합니다.',
      color: 'green',
    },
    {
      icon: Sparkles,
      title: 'AI 기반 피드백',
      description: '작문에 대한 즉각적이고 정확한 AI 피드백으로 빠르게 실력을 향상하세요.',
      color: 'orange',
    },
  ];

  // 학습 레벨
  const levels = [
    {
      level: 'A1',
      title: '기초',
      description: '기본 인사와 일상 표현',
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      features: ['기초 어휘 300개', '현재시제 동사', '기본 격변화'],
    },
    {
      level: 'A2',
      title: '초급',
      description: '일상 대화와 간단한 문장',
      color: 'bg-green-100 text-green-700 border-green-300',
      features: ['어휘 600개', '과거시제', '복합 문장'],
    },
    {
      level: 'B1',
      title: '중급',
      description: '복잡한 주제의 이해와 표현',
      color: 'bg-purple-100 text-purple-700 border-purple-300',
      features: ['어휘 1200개', '조건법', '설교문 작성'],
    },
    {
      level: 'B2',
      title: '고급',
      description: '유창한 의사소통과 전문 어휘',
      color: 'bg-orange-100 text-orange-700 border-orange-300',
      features: ['어휘 2000개', '고급 문법', '학술 작문'],
    },
  ];

  // 사용자 후기 (Mock)
  const testimonials = [
    {
      name: '김목사',
      role: '부다페스트 한인교회 담임목사',
      content: '설교문 작성 기능 덕분에 헝가리어 설교 준비 시간이 절반으로 줄었습니다. AI 피드백이 정말 정확해요!',
      rating: 5,
      level: 'B1',
      levelColor: 'bg-purple-100 text-purple-700',
    },
    {
      name: '이선교사',
      role: '헝가리 선교사',
      content: 'A1부터 차근차근 배워서 이제 현지인들과 자연스럽게 대화할 수 있게 되었습니다. 체계적인 커리큘럼이 최고예요.',
      rating: 5,
      level: 'A2',
      levelColor: 'bg-green-100 text-green-700',
    },
    {
      name: '박전도사',
      role: '신학대학원생',
      content: '종교 전문 어휘가 풍부해서 신학 공부에 큰 도움이 됩니다. 특히 성경 번역 연습이 유용해요.',
      rating: 5,
      level: 'B2',
      levelColor: 'bg-orange-100 text-orange-700',
    },
  ];

  // 가격 플랜
  const pricingPlans = [
    {
      name: '무료',
      price: '0원',
      period: '영구 무료',
      description: 'A1 레벨 학습 체험',
      features: [
        'A1 레벨 일부 콘텐츠',
        '기본 어휘 학습',
        '레벨 테스트 1회',
        '커뮤니티 접근',
      ],
      limitations: [
        '전체 콘텐츠 제한',
        'AI 피드백 제한',
      ],
      cta: '무료로 시작하기',
      highlighted: false,
    },
    {
      name: '프리미엄',
      price: '29,000원',
      period: '월',
      description: '전체 레벨 무제한 학습',
      features: [
        'A1~B2 전체 콘텐츠',
        '무제한 어휘 & 문법',
        '무제한 AI 피드백',
        '설교문 작성 연습',
        '개인 맞춤 학습 경로',
        '진도 분석 리포트',
        '우선 고객 지원',
      ],
      limitations: [],
      cta: '프리미엄 시작하기',
      highlighted: true,
      badge: '가장 인기',
    },
  ];

  // FAQ
  const faqs = [
    {
      question: '완전 초보자도 학습할 수 있나요?',
      answer: '네! A1 기초 레벨부터 체계적으로 학습할 수 있도록 설계되었습니다. 헝가리어를 한 번도 접해보지 않았어도 걱정하지 마세요.',
    },
    {
      question: '설교문 작성 기능은 어떻게 작동하나요?',
      answer: 'B1 레벨부터 설교문 작성 연습을 시작할 수 있으며, AI가 문법, 어휘, 표현의 적절성을 실시간으로 피드백해줍니다. 종교 전문 어휘 데이터베이스도 제공됩니다.',
    },
    {
      question: '레벨 테스트는 얼마나 정확한가요?',
      answer: '유럽언어공통기준(CEFR)을 기반으로 한 25문항의 종합 평가로 문법, 어휘, 독해, 듣기를 평가합니다. 정기적인 재평가로 학습 진도를 추적할 수 있습니다.',
    },
    {
      question: '무료 체험 후 자동 결제되나요?',
      answer: '아니요. 무료 플랜은 영구적으로 무료이며, 프리미엄으로 업그레이드하려면 직접 결제를 진행해야 합니다.',
    },
    {
      question: '모바일에서도 사용할 수 있나요?',
      answer: '네! 모든 기능이 모바일에 최적화되어 있어 언제 어디서나 학습할 수 있습니다.',
    },
  ];

  return (
    <>
      <Head>
        <title>헝가리어 학습 플랫폼 - 목회자를 위한 전문 학습 시스템</title>
        <meta
          name="description"
          content="A1부터 B2까지 체계적인 헝가리어 학습. 설교문 작성, AI 피드백, 맞춤형 커리큘럼으로 효율적인 학습을 경험하세요."
        />
      </Head>

      {/* 네비게이션 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-white to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">🇭🇺</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hungarian Pro</h1>
                <p className="text-xs text-gray-500">목회자를 위한 헝가리어</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">로그인</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  무료 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-700 px-4 py-2 text-sm">
              🎯 목회자 전문 헝가리어 학습 플랫폼
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              헝가리어로<br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                설교하고 소통하세요
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              A1부터 B2까지 체계적인 학습 경로와 AI 기반 피드백으로
              <br />
              헝가리어 설교문 작성과 유창한 의사소통을 실현하세요
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/auth/register">
                <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl">
                  <Zap className="w-5 h-5 mr-2" />
                  무료로 시작하기
                </Button>
              </Link>
              <Link href="/assessment/start">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2">
                  <Target className="w-5 h-5 mr-2" />
                  레벨 테스트 해보기
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>신용카드 불필요</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>언제든 업그레이드 가능</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>1,234명이 학습 중</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-purple-100 text-purple-700">주요 기능</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                왜 Hungarian Pro인가요?
              </h2>
              <p className="text-xl text-gray-600">
                목회자를 위한 특화된 학습 경험을 제공합니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <Card key={idx} className="border-2 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 flex items-center justify-center mb-4 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Level System Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-green-100 text-green-700">학습 경로</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                체계적인 4단계 학습
              </h2>
              <p className="text-xl text-gray-600">
                초보자부터 고급까지, 단계별로 실력을 향상하세요
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {levels.map((level, idx) => (
                <Card key={idx} className={`border-2 hover:shadow-2xl transition-all duration-200 ${level.color}`}>
                  <CardHeader>
                    <Badge className={`w-fit text-lg px-4 py-1 mb-3 ${level.color}`}>
                      {level.level}
                    </Badge>
                    <CardTitle className="text-2xl mb-2">{level.title}</CardTitle>
                    <CardDescription className="text-base font-medium mb-4">
                      {level.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {level.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-1 flex-shrink-0" />
                          <span className="text-sm">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/assessment/start">
                <Button size="lg" className="px-8 py-6 text-lg">
                  내 레벨 확인하기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-yellow-100 text-yellow-700">사용자 후기</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                실제 사용자들의 이야기
              </h2>
              <p className="text-xl text-gray-600">
                Hungarian Pro와 함께 목표를 달성한 분들의 경험담
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, idx) => (
                <Card key={idx} className="border-2 hover:shadow-xl transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{testimonial.name}</p>
                          <p className="text-sm text-gray-600">{testimonial.role}</p>
                        </div>
                      </div>
                      <Badge className={testimonial.levelColor}>
                        {testimonial.level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-100 text-blue-700">가격 플랜</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                모두에게 열려있는 학습
              </h2>
              <p className="text-xl text-gray-600">
                무료로 시작하고, 준비되면 프리미엄으로 업그레이드하세요
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, idx) => (
                <Card
                  key={idx}
                  className={`border-2 transition-all duration-200 ${
                    plan.highlighted
                      ? 'border-blue-500 shadow-2xl scale-105'
                      : 'border-gray-200 hover:shadow-xl'
                  }`}
                >
                  <CardHeader>
                    {plan.badge && (
                      <Badge className="w-fit mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        {plan.badge}
                      </Badge>
                    )}
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period && <span className="text-gray-600 ml-2">/ {plan.period}</span>}
                    </div>
                    <CardDescription className="text-base">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="font-semibold text-gray-900 mb-3">포함 기능:</p>
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-900 mb-3">제한사항:</p>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-gray-400 flex-shrink-0">✕</span>
                              <span className="text-gray-600">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Link href="/auth/register">
                      <Button
                        size="lg"
                        className={`w-full ${
                          plan.highlighted
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                            : ''
                        }`}
                        variant={plan.highlighted ? 'default' : 'outline'}
                      >
                        {plan.cta}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-purple-100 text-purple-700">자주 묻는 질문</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                궁금한 점이 있으신가요?
              </h2>
              <p className="text-xl text-gray-600">
                자주 묻는 질문에 대한 답변을 확인하세요
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <Card key={idx} className="border-2 hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-3">
                      <span className="text-blue-600 font-bold flex-shrink-0">Q.</span>
                      <span>{faq.question}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed pl-8">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">더 궁금한 점이 있으신가요?</p>
              <Button variant="outline" size="lg">
                고객 지원 센터
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
              <CardContent className="py-16 text-center">
                <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-6" />
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  지금 시작하세요!
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  1,234명의 목회자들이 Hungarian Pro와 함께
                  <br />
                  헝가리어 목회 사역을 준비하고 있습니다
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/auth/register">
                    <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl">
                      <Zap className="w-5 h-5 mr-2" />
                      무료로 시작하기
                    </Button>
                  </Link>
                  <Link href="/assessment/start">
                    <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2">
                      <Target className="w-5 h-5 mr-2" />
                      레벨 테스트만 해보기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-white to-green-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-2xl">🇭🇺</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Hungarian Pro</h3>
                    <p className="text-xs">목회자를 위한 헝가리어</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  체계적인 학습으로 헝가리어 목회 사역을 준비하세요.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">학습</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/grammar" className="hover:text-white transition-colors">문법 학습</Link></li>
                  <li><Link href="/vocabulary" className="hover:text-white transition-colors">어휘 학습</Link></li>
                  <li><Link href="/writing" className="hover:text-white transition-colors">작문 연습</Link></li>
                  <li><Link href="/assessment" className="hover:text-white transition-colors">레벨 평가</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">회사</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">회사 소개</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">팀</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">블로그</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">채용</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">지원</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">고객 센터</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">이용 약관</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">개인정보 처리방침</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">문의하기</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
              <p className="text-sm text-gray-400">
                © 2024 Hungarian Pro. All rights reserved.
              </p>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
