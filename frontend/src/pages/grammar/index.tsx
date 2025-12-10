import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  ArrowRight,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

const GrammarPage = () => {
  const grammarLevels = [
    {
      level: 'A1',
      title: 'A1 문법 (기초)',
      description: '헝가리어 기초 문법을 학습합니다',
      topics: 12,
      completed: 0,
      color: 'blue',
      href: '/grammar/a1'
    },
    {
      level: 'A2',
      title: 'A2 문법 (초중급)',
      description: '헝가리어 초중급 문법을 학습합니다',
      topics: 15,
      completed: 0,
      color: 'green',
      href: '/grammar/a2'
    },
    {
      level: 'B1',
      title: 'B1 문법 (중급)',
      description: '헝가리어 중급 문법을 학습합니다',
      topics: 18,
      completed: 0,
      color: 'orange',
      href: '/grammar/b1'
    },
    {
      level: 'B2',
      title: 'B2 문법 (중고급)',
      description: '헝가리어 중고급 문법을 학습합니다',
      topics: 20,
      completed: 0,
      color: 'red',
      href: '/grammar/b2'
    }
  ];

  return (
    <>
      <Head>
        <title>문법 학습 | 헝가리어 학습 플랫폼</title>
        <meta name="description" content="레벨별 헝가리어 문법 학습" />
      </Head>

      <div>
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            문법 학습 📚
          </h1>
          <p className="text-gray-600">
            레벨별로 체계적인 헝가리어 문법을 학습하세요
          </p>
        </div>

        {/* 문법 레벨 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {grammarLevels.map((level) => (
            <Card key={level.level} className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`bg-${level.color}-100 text-${level.color}-700`}>
                    {level.level}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {level.completed}/{level.topics} 주제 완료
                  </span>
                </div>
                <CardTitle className="text-xl">{level.title}</CardTitle>
                <CardDescription>{level.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 진행률 바 */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>진행률</span>
                      <span>{Math.round((level.completed / level.topics) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-${level.color}-500 h-2 rounded-full`}
                        style={{ width: `${(level.completed / level.topics) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* 통계 */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <BookOpen className="w-4 h-4 mx-auto text-gray-600 mb-1" />
                      <div className="text-lg font-semibold text-gray-900">{level.topics}</div>
                      <div className="text-xs text-gray-600">주제</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <CheckCircle className="w-4 h-4 mx-auto text-gray-600 mb-1" />
                      <div className="text-lg font-semibold text-gray-900">{level.completed}</div>
                      <div className="text-xs text-gray-600">완료</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Clock className="w-4 h-4 mx-auto text-gray-600 mb-1" />
                      <div className="text-lg font-semibold text-gray-900">0h</div>
                      <div className="text-xs text-gray-600">학습시간</div>
                    </div>
                  </div>

                  {/* 시작 버튼 */}
                  <Link href={level.href}>
                    <Button className="w-full" variant={level.completed > 0 ? "default" : "outline"}>
                      {level.completed > 0 ? '계속하기' : '시작하기'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 학습 가이드 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              학습 가이드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• 각 레벨은 약 12-20개의 문법 주제로 구성되어 있습니다.</p>
              <p>• 순서대로 학습하는 것을 권장하지만, 자유롭게 선택할 수 있습니다.</p>
              <p>• 각 주제는 설명, 예문, 연습문제로 구성되어 있습니다.</p>
              <p>• 연습문제를 통과하면 다음 주제로 진행할 수 있습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GrammarPage;
