'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Calendar,
  Clock,
  BookOpen,
  Star,
  Filter,
  SortAsc,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

/**
 * 설교문 라이브러리 - 저장된 설교문 관리
 */

interface SermonItem {
  id: string;
  title: string;
  topic: string;
  target_audience: string;
  difficulty_level: 'A1' | 'A2' | 'B1' | 'B2';
  content: string;
  status: 'draft' | 'in_progress' | 'completed';
  word_count: number;
  estimated_reading_time: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  theological_focus: string[];
  is_favorite: boolean;
  version: number;
}

interface SearchFilters {
  query: string;
  status: string;
  difficulty_level: string;
  target_audience: string;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

export default function SermonLibrary() {
  const { toast } = useToast();
  const router = useRouter();

  // 상태 관리
  const [sermons, setSermons] = useState<SermonItem[]>([]);
  const [filteredSermons, setFilteredSermons] = useState<SermonItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSermons, setSelectedSermons] = useState<string[]>([]);

  // 검색 및 필터 상태
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: 'all',
    difficulty_level: 'all',
    target_audience: 'all',
    sort_by: 'updated_at',
    sort_order: 'desc'
  });

  // 통계
  const [statistics, setStatistics] = useState({
    total_sermons: 0,
    completed_sermons: 0,
    draft_sermons: 0,
    average_word_count: 0,
    total_study_time: 0
  });

  // 초기 데이터 로드
  useEffect(() => {
    loadSermons();
    loadStatistics();
  }, []);

  // 필터링 로직
  useEffect(() => {
    let filtered = sermons;

    // 텍스트 검색
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(sermon =>
        sermon.title.toLowerCase().includes(query) ||
        sermon.topic.toLowerCase().includes(query) ||
        sermon.content.toLowerCase().includes(query) ||
        sermon.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 상태 필터
    if (filters.status !== 'all') {
      filtered = filtered.filter(sermon => sermon.status === filters.status);
    }

    // 난이도 필터
    if (filters.difficulty_level !== 'all') {
      filtered = filtered.filter(sermon => sermon.difficulty_level === filters.difficulty_level);
    }

    // 대상 청중 필터
    if (filters.target_audience !== 'all') {
      filtered = filtered.filter(sermon => sermon.target_audience === filters.target_audience);
    }

    // 정렬
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sort_by) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'word_count':
          aValue = a.word_count;
          bValue = b.word_count;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
        default:
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
      }

      if (filters.sort_order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredSermons(filtered);
  }, [sermons, filters]);

  // 설교문 목록 로드
  const loadSermons = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sermon/drafts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load sermons');
      }

      const data = await response.json();
      setSermons(data.data.drafts || []);

    } catch (error) {
      toast({
        title: "설교문 로드 실패",
        description: "설교문 목록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 통계 로드
  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/sermon/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  // 새 설교문 작성
  const handleCreateNew = () => {
    router.push('/sermon/new');
  };

  // 설교문 편집
  const handleEdit = (sermonId: string) => {
    router.push(`/sermon/edit/${sermonId}`);
  };

  // 설교문 보기
  const handleView = (sermonId: string) => {
    router.push(`/sermon/view/${sermonId}`);
  };

  // 설교문 삭제
  const handleDelete = async (sermonId: string) => {
    try {
      const response = await fetch(`/api/sermon/drafts/${sermonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete sermon');
      }

      setSermons(prev => prev.filter(sermon => sermon.id !== sermonId));
      toast({
        title: "설교문 삭제 완료",
        description: "설교문이 성공적으로 삭제되었습니다.",
      });

    } catch (error) {
      toast({
        title: "삭제 실패",
        description: "설교문 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 즐겨찾기 토글
  const handleToggleFavorite = async (sermonId: string) => {
    try {
      const sermon = sermons.find(s => s.id === sermonId);
      if (!sermon) return;

      const response = await fetch(`/api/sermon/drafts/${sermonId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ is_favorite: !sermon.is_favorite })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      setSermons(prev => prev.map(s =>
        s.id === sermonId ? { ...s, is_favorite: !s.is_favorite } : s
      ));

    } catch (error) {
      toast({
        title: "즐겨찾기 설정 실패",
        description: "즐겨찾기 설정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 설교문 복사
  const handleDuplicate = async (sermonId: string) => {
    try {
      const response = await fetch(`/api/sermon/drafts/${sermonId}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate sermon');
      }

      const data = await response.json();
      setSermons(prev => [data.data.draft, ...prev]);

      toast({
        title: "설교문 복사 완료",
        description: "설교문이 성공적으로 복사되었습니다.",
      });

    } catch (error) {
      toast({
        title: "복사 실패",
        description: "설교문 복사 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 설교문 내보내기
  const handleExport = async (sermonId: string) => {
    try {
      const response = await fetch(`/api/sermon/drafts/${sermonId}/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export sermon');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `sermon-${sermonId}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "설교문 내보내기 완료",
        description: "설교문이 성공적으로 내보내졌습니다.",
      });

    } catch (error) {
      toast({
        title: "내보내기 실패",
        description: "설교문 내보내기 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 상태별 배지 색상
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  // 상태별 한국어 이름
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '완성';
      case 'in_progress': return '작성 중';
      case 'draft': return '초안';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">설교문 라이브러리</h1>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            새 설교문 작성
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">전체 설교문</p>
                  <p className="text-xl font-bold">{statistics.total_sermons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">완성된 설교문</p>
                  <p className="text-xl font-bold">{statistics.completed_sermons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Edit className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">초안</p>
                  <p className="text-xl font-bold">{statistics.draft_sermons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">평균 단어 수</p>
                  <p className="text-xl font-bold">{statistics.average_word_count.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-600">총 학습 시간</p>
                  <p className="text-xl font-bold">{Math.round(statistics.total_study_time / 60)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* 검색 */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="제목, 주제, 내용 검색..."
                    value={filters.query}
                    onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 상태 필터 */}
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="draft">초안</SelectItem>
                  <SelectItem value="in_progress">작성 중</SelectItem>
                  <SelectItem value="completed">완성</SelectItem>
                </SelectContent>
              </Select>

              {/* 난이도 필터 */}
              <Select
                value={filters.difficulty_level}
                onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="난이도" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 난이도</SelectItem>
                  <SelectItem value="A1">A1 (초급)</SelectItem>
                  <SelectItem value="A2">A2 (초중급)</SelectItem>
                  <SelectItem value="B1">B1 (중급)</SelectItem>
                  <SelectItem value="B2">B2 (중고급)</SelectItem>
                </SelectContent>
              </Select>

              {/* 대상 청중 필터 */}
              <Select
                value={filters.target_audience}
                onValueChange={(value) => setFilters(prev => ({ ...prev, target_audience: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="대상 청중" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 청중</SelectItem>
                  <SelectItem value="일반 성도">일반 성도</SelectItem>
                  <SelectItem value="새신자">새신자</SelectItem>
                  <SelectItem value="성숙한 신자">성숙한 신자</SelectItem>
                  <SelectItem value="청년">청년</SelectItem>
                </SelectContent>
              </Select>

              {/* 정렬 */}
              <Select
                value={`${filters.sort_by}_${filters.sort_order}`}
                onValueChange={(value) => {
                  const [sort_by, sort_order] = value.split('_');
                  setFilters(prev => ({ ...prev, sort_by, sort_order: sort_order as 'asc' | 'desc' }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated_at_desc">최근 수정순</SelectItem>
                  <SelectItem value="created_at_desc">최근 생성순</SelectItem>
                  <SelectItem value="title_asc">제목순</SelectItem>
                  <SelectItem value="word_count_desc">단어 수 많은 순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 설교문 목록 */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSermons.map((sermon) => (
            <Card key={sermon.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{sermon.title || '제목 없음'}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{sermon.topic}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFavorite(sermon.id)}
                    className="p-1"
                  >
                    <Star className={`w-4 h-4 ${sermon.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* 상태 및 정보 */}
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant={getStatusBadgeVariant(sermon.status)}>
                      {getStatusLabel(sermon.status)}
                    </Badge>
                    <Badge variant="outline">{sermon.difficulty_level}</Badge>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>대상: {sermon.target_audience}</p>
                    <p>단어: {sermon.word_count.toLocaleString()}개</p>
                    <p>예상 시간: {sermon.estimated_reading_time}분</p>
                  </div>

                  {/* 태그 */}
                  {sermon.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sermon.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {sermon.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{sermon.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* 날짜 */}
                  <p className="text-xs text-gray-500">
                    수정: {new Date(sermon.updated_at).toLocaleDateString('ko-KR')}
                  </p>

                  {/* 액션 버튼 */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(sermon.id)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      보기
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(sermon.id)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      편집
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(sermon.id)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>설교문 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            정말로 이 설교문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(sermon.id)}>
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && filteredSermons.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">설교문이 없습니다</h3>
          <p className="text-gray-500 mb-4">
            {filters.query || filters.status !== 'all' || filters.difficulty_level !== 'all'
              ? '검색 조건에 맞는 설교문이 없습니다.'
              : '첫 번째 설교문을 작성해보세요.'}
          </p>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            새 설교문 작성
          </Button>
        </div>
      )}
    </div>
  );
}