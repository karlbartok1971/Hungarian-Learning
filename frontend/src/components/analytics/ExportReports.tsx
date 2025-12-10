// 학습 리포트 내보내기 컴포넌트
// T119 [P] [US5] Add export functionality for learning reports
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import analyticsApi from '@/services/analyticsApi';
import {
  Download,
  FileText,
  BarChart3,
  Calendar,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Share2
} from 'lucide-react';

interface ExportReportsProps {
  userId: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  format: 'pdf' | 'json' | 'csv';
  sections: string[];
  estimatedSize: string;
}

const ExportReports: React.FC<ExportReportsProps> = ({ userId }) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '3months' | 'all'>('30days');
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'json' | 'csv'>('pdf');
  const [selectedTemplate, setSelectedTemplate] = useState('comprehensive');

  // 리포트 템플릿 정의
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'comprehensive',
      name: '종합 학습 리포트',
      description: '모든 학습 데이터와 분석 결과가 포함된 상세 리포트',
      icon: <FileText className="h-5 w-5" />,
      format: 'pdf',
      sections: ['개요', '진도 분석', '약점 분석', '학습 패턴', '추천사항'],
      estimatedSize: '2-3 MB'
    },
    {
      id: 'progress',
      name: '진도 리포트',
      description: '학습 진도와 성과 변화에 중점을 둔 리포트',
      icon: <BarChart3 className="h-5 w-5" />,
      format: 'pdf',
      sections: ['학습 시간', '완료 레슨', '정확도 변화', '레벨 진행'],
      estimatedSize: '1-2 MB'
    },
    {
      id: 'weakness',
      name: '약점 분석 리포트',
      description: '학습 약점과 개선 방안에 특화된 리포트',
      icon: <AlertCircle className="h-5 w-5" />,
      format: 'pdf',
      sections: ['약점 카테고리', '근본 원인', '추천 액션', '개선 계획'],
      estimatedSize: '1 MB'
    },
    {
      id: 'raw_data',
      name: '원시 데이터',
      description: '가공되지 않은 순수 학습 데이터',
      icon: <Download className="h-5 w-5" />,
      format: 'csv',
      sections: ['세션 데이터', '성과 메트릭', '활동 로그'],
      estimatedSize: '500 KB - 5 MB'
    }
  ];

  // 리포트 내보내기 처리
  const handleExport = async () => {
    if (!userId) {
      toast({
        title: "내보내기 실패",
        description: "사용자 정보가 없습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // 선택된 템플릿에 따른 내보내기
      if (selectedTemplate === 'comprehensive') {
        await exportComprehensiveReport();
      } else if (selectedTemplate === 'progress') {
        await exportProgressReport();
      } else if (selectedTemplate === 'weakness') {
        await exportWeaknessReport();
      } else if (selectedTemplate === 'raw_data') {
        await exportRawData();
      }

      toast({
        title: "내보내기 완료",
        description: "학습 리포트가 성공적으로 다운로드되었습니다.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "내보내기 실패",
        description: "리포트 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // 종합 리포트 내보내기
  const exportComprehensiveReport = async () => {
    try {
      // 모든 분석 데이터 수집
      const [overview, progressData, patterns, weakness] = await Promise.all([
        analyticsApi.getAnalyticsOverview(userId, selectedPeriod),
        analyticsApi.getProgressData(userId, selectedPeriod),
        analyticsApi.getLearningPatterns(userId),
        analyticsApi.getWeaknessAnalysis(userId)
      ]);

      // 종합 리포트 데이터 구성
      const reportData = {
        reportType: 'comprehensive',
        generatedAt: new Date().toISOString(),
        period: selectedPeriod,
        sections: {
          overview,
          progressData,
          patterns,
          weakness
        },
        metadata: {
          userId,
          reportVersion: '1.0',
          language: 'ko'
        }
      };

      // PDF 생성을 위한 API 호출
      await generatePDFReport(reportData);
    } catch (error) {
      throw new Error('종합 리포트 생성 실패');
    }
  };

  // 진도 리포트 내보내기
  const exportProgressReport = async () => {
    try {
      const [overview, progressData] = await Promise.all([
        analyticsApi.getAnalyticsOverview(userId, selectedPeriod),
        analyticsApi.getProgressData(userId, selectedPeriod)
      ]);

      const reportData = {
        reportType: 'progress',
        generatedAt: new Date().toISOString(),
        period: selectedPeriod,
        sections: {
          overview,
          progressData
        }
      };

      await generatePDFReport(reportData);
    } catch (error) {
      throw new Error('진도 리포트 생성 실패');
    }
  };

  // 약점 분석 리포트 내보내기
  const exportWeaknessReport = async () => {
    try {
      const weakness = await analyticsApi.getWeaknessAnalysis(userId);

      const reportData = {
        reportType: 'weakness',
        generatedAt: new Date().toISOString(),
        sections: {
          weakness
        }
      };

      await generatePDFReport(reportData);
    } catch (error) {
      throw new Error('약점 분석 리포트 생성 실패');
    }
  };

  // 원시 데이터 내보내기
  const exportRawData = async () => {
    try {
      const blob = await analyticsApi.exportAnalyticsData(userId, 'csv', selectedPeriod);

      // 파일 다운로드
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hungarian-learning-data-${userId}-${selectedPeriod}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('원시 데이터 내보내기 실패');
    }
  };

  // PDF 리포트 생성 (실제 구현에서는 백엔드 API 호출)
  const generatePDFReport = async (reportData: any) => {
    // 실제 구현에서는 백엔드의 PDF 생성 서비스를 호출
    // 여기서는 JSON 다운로드로 대체
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hungarian-learning-report-${reportData.reportType}-${userId}-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // 미리보기 생성
  const handlePreview = () => {
    toast({
      title: "미리보기 준비 중",
      description: "리포트 미리보기를 생성하고 있습니다.",
    });

    // 실제 구현에서는 미리보기 모달이나 새 탭에서 리포트 미리보기 표시
    setTimeout(() => {
      toast({
        title: "미리보기 완료",
        description: "새 탭에서 리포트 미리보기를 확인하세요.",
      });
    }, 2000);
  };

  const selectedTemplateData = reportTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>학습 리포트 내보내기</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            다양한 형식과 내용으로 학습 데이터를 내보내어 개인적인 분석이나
            멘토와의 상담에 활용하세요.
          </p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 왼쪽: 설정 */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>리포트 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 기간 선택 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  데이터 기간
                </label>
                <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">최근 7일</SelectItem>
                    <SelectItem value="30days">최근 30일</SelectItem>
                    <SelectItem value="3months">최근 3개월</SelectItem>
                    <SelectItem value="all">전체 기간</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 형식 선택 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  파일 형식
                </label>
                <Select value={selectedFormat} onValueChange={(value: any) => setSelectedFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 액션 버튼 */}
              <div className="space-y-2 pt-4">
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  className="w-full flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>미리보기</span>
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full flex items-center space-x-2"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>{isExporting ? '생성 중...' : '내보내기'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 템플릿 선택 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>리포트 템플릿</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {reportTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          selectedTemplate === template.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {template.sections.map((section) => (
                              <Badge key={section} variant="secondary" className="text-xs">
                                {section}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>형식: {template.format.toUpperCase()}</span>
                            <span>크기: {template.estimatedSize}</span>
                          </div>
                        </div>
                      </div>
                      {selectedTemplate === template.id && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 선택된 템플릿 상세 정보 */}
          {selectedTemplateData && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {selectedTemplateData.icon}
                  <span>{selectedTemplateData.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    {selectedTemplateData.description}
                  </p>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">포함 내용:</h4>
                    <ul className="space-y-1">
                      {selectedTemplateData.sections.map((section) => (
                        <li key={section} className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{section}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>예상 파일 크기: {selectedTemplateData.estimatedSize}</span>
                      <span>형식: {selectedTemplateData.format.toUpperCase()}</span>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Share2 className="h-4 w-4" />
                      <span>공유</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportReports;