/**
 * 어휘 심화 설명 컴포넌트
 * AI 튜터에게 단어에 대한 상세한 설명을 요청할 수 있는 컴포넌트
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import ReactMarkdown from 'react-markdown';

interface VocabularyExplainerProps {
  word: string;
  userLevel: string;
  compact?: boolean;
}

type RequestType = 'examples' | 'etymology' | 'usage' | 'synonyms' | 'full';

const requestTypeLabels: Record<RequestType, string> = {
  examples: '더 많은 예문',
  etymology: '어원 & 형성',
  usage: '사용법',
  synonyms: '유의어 & 반의어',
  full: '종합 설명',
};

export function VocabularyExplainer({ word, userLevel, compact = false }: VocabularyExplainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<RequestType>('examples');
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingTabs, setLoadingTabs] = useState<Set<string>>(new Set());

  const fetchExplanation = async (requestType: RequestType) => {
    if (explanations[requestType]) return; // 이미 로드됨

    setLoadingTabs((prev) => new Set(prev).add(requestType));

    try {
      const response = await fetch('http://localhost:3001/api/ai-tutor/vocabulary-explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word,
          userLevel,
          requestType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setExplanations((prev) => ({
          ...prev,
          [requestType]: data.data.explanation,
        }));
      } else {
        setExplanations((prev) => ({
          ...prev,
          [requestType]: `오류: ${data.error}`,
        }));
      }
    } catch (error) {
      console.error('어휘 설명 로드 오류:', error);
      setExplanations((prev) => ({
        ...prev,
        [requestType]: '죄송합니다. AI 튜터 서비스에 연결할 수 없습니다.',
      }));
    } finally {
      setLoadingTabs((prev) => {
        const next = new Set(prev);
        next.delete(requestType);
        return next;
      });
    }
  };

  const handleTabChange = (value: string) => {
    const requestType = value as RequestType;
    setActiveTab(requestType);
    fetchExplanation(requestType);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !explanations[activeTab]) {
      fetchExplanation(activeTab);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {compact ? (
          <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
            <Sparkles className="w-3 h-3" />
            AI 설명
          </Button>
        ) : (
          <Button variant="outline" className="gap-2">
            <BookOpen className="w-4 h-4" />
            AI 튜터에게 더 알아보기
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            {word} - AI 어휘 튜터
          </DialogTitle>
          <DialogDescription>
            AI가 '{word}'에 대해 자세히 설명해드립니다.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
          <TabsList className="grid grid-cols-5 w-full">
            {(Object.keys(requestTypeLabels) as RequestType[]).map((type) => (
              <TabsTrigger key={type} value={type} className="text-xs">
                {requestTypeLabels[type]}
              </TabsTrigger>
            ))}
          </TabsList>

          {(Object.keys(requestTypeLabels) as RequestType[]).map((type) => (
            <TabsContent key={type} value={type} className="mt-4">
              {loadingTabs.has(type) ? (
                <Card className="p-8 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-600">AI가 설명을 생성하는 중...</p>
                </Card>
              ) : explanations[type] ? (
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{explanations[type]}</ReactMarkdown>
                  </div>
                </Card>
              ) : (
                <Card className="p-8 flex flex-col items-center justify-center gap-3 text-gray-500">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                  <p>탭을 클릭하면 AI가 설명을 생성합니다</p>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
