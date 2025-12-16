
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GrammarLessonView } from '@/components/grammar/GrammarLessonView';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';

const GrammarLessonPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3901/api/grammar-lessons/${id}`);

      if (!response.ok) {
        throw new Error('강의를 불러오는데 실패했습니다');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setLesson(data.data);
      }
    } catch (err: any) {
      console.error('강의 로드 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">강의를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-red-100">
          <CardHeader className="bg-red-50 rounded-t-lg">
            <CardTitle className="text-red-700 flex items-center gap-2">
              ⚠️ 오류 발생
            </CardTitle>
            <CardDescription className="text-red-600">
              {error || '강의 데이터를 찾을 수 없습니다.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button
              onClick={() => router.push('/grammar/b2')}
              variant="outline"
              className="w-full hover:bg-gray-100"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <GrammarLessonView lesson={lesson} level="B2" />;
};

export default GrammarLessonPage;
