import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const Skeleton = ({ className }: { className: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const DashboardSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8 space-y-8">
            {/* Hero Section Skeleton */}
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl p-8 lg:p-12 h-[300px] border border-gray-100">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32 bg-gray-300" />
                    <Skeleton className="h-12 w-3/4 bg-gray-300" />
                    <Skeleton className="h-12 w-1/2 bg-gray-300" />
                    <div className="mt-6 flex items-start gap-4 p-4 border border-gray-100 rounded-xl">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-none shadow-lg bg-white">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-12 w-12 rounded-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Skeleton */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/4 mb-2" />
                            <Skeleton className="h-4 w-1/3" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-end h-64 gap-4 px-2">
                                {[...Array(7)].map((_, i) => (
                                    <Skeleton key={i} className="w-full rounded-t-lg h-full" style={{ height: `${Math.random() * 80 + 20}%` }} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Skeleton */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
