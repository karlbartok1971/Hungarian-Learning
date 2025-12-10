// 동료 비교 컴포넌트
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PeerComparison = ({ data }: { data?: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>동료 비교</CardTitle>
    </CardHeader>
    <CardContent>
      <p>동료 비교 데이터를 분석하는 중...</p>
    </CardContent>
  </Card>
);

export default PeerComparison;