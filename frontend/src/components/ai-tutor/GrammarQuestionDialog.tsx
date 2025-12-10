/**
 * 문법 질문 다이얼로그
 * AI 튜터에게 문법 관련 질문을 할 수 있는 컴포넌트
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
import { Textarea } from '../ui/textarea';
import { MessageCircle, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import ReactMarkdown from 'react-markdown';

interface GrammarQuestionDialogProps {
  grammarTopic: string;
  userLevel: string;
  context?: string;
}

export function GrammarQuestionDialog({
  grammarTopic,
  userLevel,
  context,
}: GrammarQuestionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/ai-tutor/grammar-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grammarTopic,
          question,
          userLevel,
          context,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAnswer(data.data.answer);
      } else {
        setAnswer(`오류: ${data.error}`);
      }
    } catch (error) {
      console.error('문법 질문 처리 오류:', error);
      setAnswer('죄송합니다. AI 튜터 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageCircle className="w-4 h-4" />
          AI 튜터에게 질문하기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            AI 문법 튜터
          </DialogTitle>
          <DialogDescription>
            "{grammarTopic}"에 대해 궁금한 점을 질문해주세요. AI 튜터가 자세히 답변해드립니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">질문</label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: 언제 정관사를 사용하나요? 형용사 변화가 헷갈려요..."
              rows={4}
              className="w-full"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !question.trim()}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AI가 답변을 생성하는 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI 튜터에게 질문하기
              </>
            )}
          </Button>

          {answer && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <h3 className="font-semibold text-blue-900">AI 튜터의 답변</h3>
              </div>
              <div className="prose prose-sm max-w-none text-gray-800">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
