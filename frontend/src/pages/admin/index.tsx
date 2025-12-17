import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
    Users, Database, Activity, Server,
    Search, Plus, Trash2, Edit, CheckCircle, AlertTriangle,
    BookOpen, Settings, LogOut, Lock, Loader2, ArrowLeft
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";


// Mock Data for Users (Still mock for now)
const MOCK_USERS = [
    { id: 1, name: '김목사', email: 'pastor.kim@example.com', role: '프리미엄', status: '활성', lastLogin: '2분 전' },
    { id: 2, name: '홍길동', email: 'hong@test.com', role: '일반', status: '활성', lastLogin: '5시간 전' },
    { id: 3, name: '테스트 유저', email: 'test@test.com', role: '일반', status: '비활성', lastLogin: '3일 전' },
];

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // Real Data States
    const [stats, setStats] = useState<any>(null);
    const [contents, setContents] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const [loadingContents, setLoadingContents] = useState(false);

    // CMS Editor States
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [vocabData, setVocabData] = useState<any[]>([]);
    const [loadingVocab, setLoadingVocab] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>({ hungarian: '', korean: '', example: '', example_kr: '' });

    const handleLogin = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (password === 'admin1234') {
            setIsAuthenticated(true);
        } else {
            alert('잘못된 비밀번호입니다.');
        }
    };

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const res = await fetch('http://localhost:3001/api/admin/stats', {
                headers: { 'x-admin-key': 'admin1234' }
            });
            const json = await res.json();
            if (json.success) {
                setStats(json.data);
            }
        } catch (err) {
            console.error("Failed to fetch stats", err);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchContents = async () => {
        setLoadingContents(true);
        try {
            const res = await fetch('http://localhost:3001/api/admin/contents', {
                headers: { 'x-admin-key': 'admin1234' }
            });
            const json = await res.json();
            if (json.success) {
                setContents(json.data);
            }
        } catch (err) {
            console.error("Failed to fetch contents", err);
        } finally {
            setLoadingContents(false);
        }
    };

    const fetchVocabularyDetail = async (level: string) => {
        setLoadingVocab(true);
        setSelectedLevel(level);
        try {
            const res = await fetch(`http://localhost:3001/api/admin/vocabulary/${level}`, {
                headers: { 'x-admin-key': 'admin1234' }
            });
            const json = await res.json();
            if (json.success) {
                setVocabData(json.data);
            }
        } catch (err) {
            console.error("Failed to fetch vocabulary", err);
            alert("삭제된 데이터거나 불러올 수 없습니다.");
            setSelectedLevel(null);
        } finally {
            setLoadingVocab(false);
        }
    };

    const saveVocabulary = async (newData: any[]) => {
        if (!selectedLevel) return;
        setIsSaving(true);
        try {
            const res = await fetch(`http://localhost:3001/api/admin/vocabulary/${selectedLevel}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': 'admin1234'
                },
                body: JSON.stringify(newData)
            });
            const json = await res.json();
            if (json.success) {
                setVocabData(newData);
                alert("저장되었습니다.");
            } else {
                alert("저장 실패: " + json.message);
            }
        } catch (err) {
            console.error("Failed to save", err);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveItem = () => {
        if (!editingItem.hungarian || !editingItem.korean) {
            alert("헝가리어와 한국어는 필수입니다.");
            return;
        }

        let newData;
        if (editingItem.index !== undefined) {
            // Update existing
            newData = [...vocabData];
            const { index, ...item } = editingItem;
            newData[index] = item;
        } else {
            // Add new
            newData = [...vocabData, editingItem];
        }

        saveVocabulary(newData);
        setIsEditModalOpen(false);
        setEditingItem({ hungarian: '', korean: '', example: '', example_kr: '' });
    };

    const handleDeleteItem = (index: number) => {
        if (confirm("정말로 이 단어를 삭제하시겠습니까?")) {
            const newData = vocabData.filter((_, i) => i !== index);
            saveVocabulary(newData);
        }
    };

    const openAddModal = () => {
        setEditingItem({ hungarian: '', korean: '', example: '', example_kr: '' });
        setIsEditModalOpen(true);
    };

    const openEditModal = (item: any, index: number) => {
        setEditingItem({ ...item, index });
        setIsEditModalOpen(true);
    };


    useEffect(() => {
        if (isAuthenticated) {
            fetchStats();
            if (activeTab === 'content') {
                fetchContents();
                setSelectedLevel(null); // Reset detail view when tab changes
            }
        }
    }, [isAuthenticated, activeTab]);

    const statCards = [
        { label: '총 사용자 수', value: stats?.users?.total || 'N/A', change: '+12% (12명)', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
        { label: '총 콘텐츠 수', value: stats?.vocabulary?.total || 'N/A', change: '+5% (2개)', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'API 호출 수', value: stats?.apiCalls?.total || 'N/A', change: '+8%', icon: Activity, color: 'text-orange-600 bg-orange-50' },
        { label: '서버 상태', value: stats?.serverStatus || 'N/A', change: 'Stable', icon: CheckCircle, color: 'text-purple-600 bg-purple-50' },
    ];

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <Card className="w-full max-w-md p-6 shadow-lg border-slate-200">
                    <CardHeader className="text-center">
                        <Lock className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
                        <CardTitle className="text-2xl font-bold text-slate-800">관리자 로그인</CardTitle>
                        <CardDescription className="text-slate-500">대시보드에 접근하려면 비밀번호를 입력하세요.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input
                                type="password"
                                placeholder="관리자 비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-md font-semibold">
                                로그인
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
                                    {statCards.map((stat, idx) => (
                                        <Card key={idx} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-6 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                                    {loadingStats ? (
                                                        <Loader2 className="w-6 h-6 animate-spin mt-2 text-slate-400" />
                                                    ) : (
                                                        <h3 className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</h3>
                                                    )}
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
                                        <CardDescription>
                                            {selectedLevel ? `${selectedLevel.toUpperCase()} 단어장 수정 모드` : '단어, 문법, 성경 데이터를 관리합니다.'}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        {selectedLevel ? (
                                            <Button variant="outline" onClick={() => setSelectedLevel(null)}>
                                                <ArrowLeft className="w-4 h-4 mr-2" /> 목록으로
                                            </Button>
                                        ) : (
                                            <>
                                                <Button variant="outline" className="text-slate-600" onClick={fetchContents}>
                                                    <Loader2 className={`w-4 h-4 mr-2 ${loadingContents ? 'animate-spin' : ''}`} /> 새로고침
                                                </Button>
                                                <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4 mr-2" /> 새 콘텐츠 작성</Button>
                                            </>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {!selectedLevel ? (
                                        <>
                                            <div className="flex gap-3 mb-6">
                                                <Button variant="secondary" className="bg-slate-100 text-slate-900 border border-slate-200 shadow-sm">전체 보기</Button>
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
                                                    {loadingContents ? (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                                                데이터를 불러오는 중입니다...
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : contents.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                                                등록된 콘텐츠가 없습니다.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        contents.map((content) => (
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
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-slate-400 hover:text-indigo-600"
                                                                        onClick={() => fetchVocabularyDetail(content.id)}
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </>
                                    ) : (
                                        // Editor View
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                                                <div className="text-sm text-slate-500">
                                                    총 <span className="font-bold text-slate-900">{vocabData.length}</span>개의 단어가 등록되어 있습니다.
                                                </div>
                                                <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700">
                                                    <Plus className="w-4 h-4 mr-2" /> 단어 추가
                                                </Button>
                                            </div>

                                            <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
                                                <Table>
                                                    <TableHeader className="bg-slate-50">
                                                        <TableRow>
                                                            <TableHead className="w-[200px]">헝가리어</TableHead>
                                                            <TableHead className="w-[200px]">한국어</TableHead>
                                                            <TableHead>예문</TableHead>
                                                            <TableHead className="text-right w-[100px]">관리</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {loadingVocab ? (
                                                            <TableRow>
                                                                <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                                                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
                                                                    단어장을 불러오는 중입니다...
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : vocabData.length === 0 ? (
                                                            <TableRow>
                                                                <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                                                                    등록된 단어가 없습니다.
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            vocabData.map((item, idx) => (
                                                                <TableRow key={idx} className="hover:bg-slate-50">
                                                                    <TableCell className="font-bold text-indigo-900">{item.hungarian}</TableCell>
                                                                    <TableCell>{item.korean}</TableCell>
                                                                    <TableCell className="text-xs text-slate-500">
                                                                        <div className="mb-1">{item.example}</div>
                                                                        <div className="text-slate-400">{item.example_kr}</div>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className="flex justify-end gap-1">
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => openEditModal(item, idx)}>
                                                                                <Edit className="w-4 h-4" />
                                                                            </Button>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDeleteItem(idx)}>
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                    </div>
                </main>
            </div>

            {/* Edit/Add Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem?.index !== undefined ? '단어 수정' : '새 단어 추가'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="hungarian" className="text-right">헝가리어</Label>
                            <Input
                                id="hungarian"
                                value={editingItem?.hungarian || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, hungarian: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="korean" className="text-right">한국어</Label>
                            <Input
                                id="korean"
                                value={editingItem?.korean || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, korean: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="example" className="text-right">예문 (헝)</Label>
                            <Input
                                id="example"
                                value={editingItem?.example || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, example: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="example_kr" className="text-right">예문 (한)</Label>
                            <Input
                                id="example_kr"
                                value={editingItem?.example_kr || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, example_kr: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>취소</Button>
                        <Button type="submit" onClick={handleSaveItem} disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : '저장'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
