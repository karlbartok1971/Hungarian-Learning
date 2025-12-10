// 학습 패턴 분석 컴포넌트
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StudyPatternsProps {
  data?: any;
}

const StudyPatterns: React.FC<StudyPatternsProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>학습 패턴 분석</CardTitle>
      </CardHeader>
      <CardContent>
        <p>학습 패턴 데이터를 분석하는 중...</p>
      </CardContent>
    </Card>
  );
};

export default StudyPatterns;