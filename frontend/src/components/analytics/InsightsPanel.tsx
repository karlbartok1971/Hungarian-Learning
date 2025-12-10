// 인사이트 패널 컴포넌트
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';

interface InsightsPanelProps {
  insights: any[];
  loading: boolean;
  className?: string;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, loading, className }) => {
  if (loading) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>실시간 인사이트</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!insights.length) {
    return (
      <div className={className}>
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            현재 새로운 인사이트가 없습니다. 학습을 계속하면 개인화된 분석을 제공해드리겠습니다.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <Alert key={index} className="border-blue-200 bg-blue-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Bell className="h-4 w-4 text-blue-500" />
                  <Badge
                    variant={insight.priority === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {insight.priority}
                  </Badge>
                </div>
                <AlertDescription>
                  <strong>{insight.title}</strong>
                  <br />
                  {insight.description}
                </AlertDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        ))}
      </div>
    </div>
  );
};

export default InsightsPanel;