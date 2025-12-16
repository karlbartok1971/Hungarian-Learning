import React, { useState } from 'react';
import Head from 'next/head';
import {
    Users, Database, Activity, Server, Shield,
    Search, Plus, Save, Trash2, Edit, CheckCircle, AlertTriangle,
    BookOpen, FileText, Settings, LogOut, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock Data for Admin (Korean)
const MOCK_STATS = [
    { label: '총 사용자', value: '1,234', change: '+12%', icon: Users, color: 'text-blue-500' },
    { label: '학습 데이터', value: '5,600', change: '+54', icon: Database, color: 'text-purple-500' },
    { label: 'API 요청', value: '45.2k', change: '+8%', icon: Activity, color: 'text-green-500' },
    { label: '서버 상태', value: '정상', change: '99.9%', icon: Server, color: 'text-emerald-500' }
];

const MOCK_USERS = [
    { id: 1, name: '김목사', email: 'pastor.kim@example.com', role: '프리미엄', status: '활성', lastLogin: '2분 전' },
    { id: 2, name: '홍길동', email: 'hong@test.com', role: '일반', status: '활성', lastLogin: '5시간 전' },
    { id: 3, name: '테스트 유저', email: 'test@test.com', role: '일반', status: '비활성', lastLogin: '3일 전' },
];

const MOCK_CONTENTS = [
    { id: 1, type: '단어장', title: '필수 동사 50선 (A1)', hidden: false, items: 50 },
    { id: 2, type: '문법', title: '동사 격 변화 완벽 정리', hidden: false, items: 1 },
    { id: 3, type: '성경', title: '창세기 1:1 문법 분석', hidden: true, items: 7 },
];

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // Simple Client-side Auth for Demo
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin1234') {
            setIsAuthenticated(true);
        } else {
            alert('비밀번호가 틀렸습니다. (힌트: admin1234)');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-white shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold">관리자 통제실</CardTitle>
                        <CardDescription className="text-slate-400">시스템 접근을 위해 인증하세요</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                <Input
                                    type="password"
                                    placeholder="비밀번호 입력"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 pl-10"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 font-bold">
                                시스템 접속
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>관리자 대시보드 | 헝가리어 마스터</title>
            </Head>

            <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
                {/* Sidebar */}
                <aside className="w-full md:w-72 bg-slate-900 text-white p-6 flex flex-col justify-between shadow-xl z-20">
                    <div>
                        <div className="flex items-center gap-3 mb-12 px-2">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30">A</div>
                            <div>
                                <span className="text-lg font-bold block leading-tight">Admin System</span>
                                <span className="text-xs text-slate-400">Control Tower</span>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
                            <Button
                                variant="ghost"
                                onClick={() => setActiveTab('overview')}
                                className={`w-full justify-start h-12 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            >
                                <Activity className="w-5 h-5 mr-3" /> 통합 상황판
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setActiveTab('users')}
                                className={`w-full justify-start h-12 rounded-xl transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            >
                                <Users className="w-5 h-5 mr-3" /> 사용자 관리
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setActiveTab('content')}
                                className={`w-full justify-start h-12 rounded-xl transition-all ${activeTab === 'content' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            >
                                <Database className="w-5 h-5 mr-3" /> 콘텐츠 CMS
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start h-12 rounded-xl transition-all text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                                <Settings className="w-5 h-5 mr-3" /> 시스템 설정
                            </Button>
                        </nav>
                    </div>

                    <Button
                        variant="ghost"
                        onClick={() => setIsAuthenticated(false)}
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800/50 mt-auto"
                    >
                        <LogOut className="w-5 h-5 mr-3" /> 로그아웃
                    </Button>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen bg-slate-50">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">대시보드</h1>
                            <p className="text-slate-500 mt-1">관리자님, 환영합니다. 시스템 현황을 확인하세요.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" size="icon" className="rounded-full"><Search className="w-5 h-5 text-slate-500" /></Button>
                            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full border border-slate-200 shadow-sm">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>AD</AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                    <p className="font-bold text-slate-800">Administrator</p>
                                    <p className="text-xs text-slate-500">Super User</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-6">

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {MOCK_STATS.map((stat, idx) => (
                                        <Card key={idx} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-6 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                                    <h3 className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</h3>
                                                    <p className="text-xs text-green-600 mt-1 font-medium">{stat.change} <span className="text-slate-400 font-normal">비교: 지난달</span></p>
                                                </div>
                                                <div className={`p-4 rounded-2xl bg-slate-50 ${stat.color}`}>
                                                    <stat.icon className="w-6 h-6" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card className="border-slate-200 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Server className="w-5 h-5 text-indigo-600" /> 시스템 상태
                                            </CardTitle>
                                            <CardDescription>백엔드 API 및 데이터베이스 연결 상태</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl text-green-700 border border-green-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                        <span className="font-semibold">메인 API 서버</span>
                                                    </div>
                                                    <Badge className="bg-green-600 hover:bg-green-700 border-none">정상 가동 중</Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl text-green-700 border border-green-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                        <span className="font-semibold">PostgreSQL 데이터베이스</span>
                                                    </div>
                                                    <Badge className="bg-green-600 hover:bg-green-700 border-none">정상 가동 중</Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl text-yellow-700 border border-yellow-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                                        <span className="font-semibold">AI Assistant (OpenAI)</span>
                                                    </div>
                                                    <Badge variant="outline" className="text-yellow-700 border-yellow-600">응답 지연됨</Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-slate-200 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5 text-orange-500" /> 최근 알림 로그
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                    <span className="text-lg">⚠️</span>
                                                    <div>
                                                        <span className="font-bold text-slate-700">[경고] 높은 메모리 사용량 (85%)</span>
                                                        <p className="text-slate-500 text-xs mt-1">10분 전 • System Monitor</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                    <span className="text-lg">ℹ️</span>
                                                    <div>
                                                        <span className="font-bold text-slate-700">[정보] 일일 데이터 백업 완료</span>
                                                        <p className="text-slate-500 text-xs mt-1">2시간 전 • Backup Service</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                    <span className="text-lg">💰</span>
                                                    <div>
                                                        <span className="font-bold text-slate-700">[결제] 신규 프리미엄 구독: 김목사</span>
                                                        <p className="text-slate-500 text-xs mt-1">5시간 전 • Payment Gateway</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-slate-200 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>사용자 관리</CardTitle>
                                        <CardDescription>가입된 사용자 및 권한을 관리합니다.</CardDescription>
                                    </div>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4 mr-2" /> 사용자 추가</Button>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>사용자 정보</TableHead>
                                                <TableHead>등급</TableHead>
                                                <TableHead>상태</TableHead>
                                                <TableHead>최근 접속</TableHead>
                                                <TableHead className="text-right">관리</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {MOCK_USERS.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="font-bold text-slate-800">{user.name}</div>
                                                        <div className="text-xs text-slate-500">{user.email}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={user.role === '프리미엄' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}>
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${user.status === '활성' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                            {user.status}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{user.lastLogin}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600"><Edit className="w-4 h-4" /></Button>
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                        {/* Content Tab */}
                        {activeTab === 'content' && (
                            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-slate-200 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>콘텐츠 관리 (CMS)</CardTitle>
                                        <CardDescription>단어, 문법, 성경 데이터를 관리합니다.</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="text-slate-600"><BookOpen className="w-4 h-4 mr-2" /> JSON 가져오기</Button>
                                        <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4 mr-2" /> 새 콘텐츠 작성</Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-3 mb-6">
                                        <Button variant="secondary" className="bg-slate-100 text-slate-900 border border-slate-200 shadow-sm">전체 보기</Button>
                                        <Button variant="ghost" className="text-slate-500 hover:text-slate-900">단어장</Button>
                                        <Button variant="ghost" className="text-slate-500 hover:text-slate-900">문법</Button>
                                        <Button variant="ghost" className="text-slate-500 hover:text-slate-900">성경</Button>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>유형</TableHead>
                                                <TableHead>제목</TableHead>
                                                <TableHead>항목 수</TableHead>
                                                <TableHead>배포 상태</TableHead>
                                                <TableHead className="text-right">관리</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {MOCK_CONTENTS.map((content) => (
                                                <TableRow key={content.id}>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="bg-slate-100">{content.type}</Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium text-slate-800">{content.title}</TableCell>
                                                    <TableCell>{content.items}개</TableCell>
                                                    <TableCell>
                                                        {content.hidden ? (
                                                            <Badge variant="outline" className="text-slate-500 bg-slate-50">작성 중 (비공개)</Badge>
                                                        ) : (
                                                            <Badge className="bg-emerald-500 border-none">배포 완료</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600"><Edit className="w-4 h-4" /></Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                    </div>
                </main>
            </div>
        </>
    );
}
