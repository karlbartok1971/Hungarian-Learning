/**
 * 작문 첨삭 패널
 * AI 튜터가 작문을 첨삭해주는 컴포넌트
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Sparkles, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface WritingFeedbackPanelProps {
  initialText?: string;
  userLevel: string;
  writingType: 'sentence' | 'paragraph' | 'sermon';
  onFeedbackReceived?: (feedback: string) => void;
}

type FocusArea = 'grammar' | 'vocabulary' | 'style' | 'theological';

const focusAreaLabels: Record<FocusArea, string> = {
  grammar: '문법',
  vocabulary: '어휘',
  style: '스타일',
  theological: '신학적 표현',
};

export function WritingFeedbackPanel({
  initialText = '',
  userLevel,
  writingType,
  onFeedbackReceived,
}: WritingFeedbackPanelProps) {
  const [text, setText] = useState(initialText);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<Set<FocusArea>>(new Set());

  const handleAreaToggle = (area: FocusArea) => {
    setSelectedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) {
        next.delete(area);
      } else {
        next.add(area);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setFeedback('');

    try {
      const response = await fetch('http://localhost:3001/api/ai-tutor/writing-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText: text,
          userLevel,
          writingType,
          focusAreas: Array.from(selectedAreas),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFeedback(data.data.feedback);
        onFeedbackReceived?.(data.data.feedback);
      } else {
        setFeedback(`오류: ${data.error}`);
      }
    } catch (error) {
      console.error('작문 첨삭 요청 오류:', error);
      setFeedback('죄송합니다. AI 튜터 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">작문 입력</h3>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            writingType === 'sermon'
              ? '헝가리어 설교문을 입력하세요...'
              : writingType === 'paragraph'
              ? '헝가리어 단락을 입력하세요...'
              : '헝가리어 문장을 입력하세요...'
          }
          rows={10}
          className="w-full font-mono text-sm"
        />

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            첨삭 영역 선택 (선택 사항)
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(focusAreaLabels) as FocusArea[]).map((area) => (
              <label
                key={area}
                className="flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  checked={selectedAreas.has(area)}
                  onCheckedChange={() => handleAreaToggle(area)}
                />
                <span className="text-sm">{focusAreaLabels[area]}</span>
              </label>
            ))}
          </div>
          {selectedAreas.size === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              선택하지 않으면 모든 영역을 종합적으로 검토합니다
            </p>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
          className="w-full mt-4 gap-2"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AI가 첨삭하는 중... (최대 30초 소요)
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              AI 튜터에게 첨삭 받기
            </>
          )}
        </Button>
      </Card>

      {feedback && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <div className="flex items-start gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <h3 className="font-semibold text-green-900">AI 튜터의 첨삭</h3>
          </div>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{feedback}</ReactMarkdown>
          </div>
        </Card>
      )}
    </div>
  );
}
