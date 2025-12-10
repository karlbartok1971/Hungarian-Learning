// 성능 트렌드 컴포넌트
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceTrendsProps {
  data?: any;
}

const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>성능 트렌드</CardTitle>
      </CardHeader>
      <CardContent>
        <p>성능 트렌드 데이터를 시각화하는 중...</p>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrends;