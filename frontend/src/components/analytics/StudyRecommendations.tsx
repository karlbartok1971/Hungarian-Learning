// 학습 추천 컴포넌트
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StudyRecommendations = ({ data }: { data?: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>학습 추천</CardTitle>
    </CardHeader>
    <CardContent>
      <p>개인화된 학습 추천을 생성하는 중...</p>
    </CardContent>
  </Card>
);

export default StudyRecommendations;