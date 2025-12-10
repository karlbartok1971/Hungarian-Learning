// 진도 예측 컴포넌트
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProgressPrediction = ({ data }: { data?: any }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>진도 예측</CardTitle>
      </CardHeader>
      <CardContent>
        <p>진도 예측 데이터를 분석하는 중...</p>
      </CardContent>
    </Card>
  );
};

export default ProgressPrediction;