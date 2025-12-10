import { User as PrismaUser, CEFRLevel, LearningGoal } from '@prisma/client';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  currentLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  learningGoals: LearningGoal[];
}

export interface UpdateUserInput {
  name?: string;
  currentLevel?: CEFRLevel;
  targetLevel?: CEFRLevel;
  learningGoals?: LearningGoal[];
  dailyGoal?: number;
  timezone?: string;
  profileImage?: string;
  bio?: string;
}

export class UserModel {
  /**
   * 새 사용자 생성
   */
  static async create(userData: CreateUserInput): Promise<PrismaUser> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
  }

  /**
   * 이메일로 사용자 조회
   */
  static async findByEmail(email: string): Promise<PrismaUser | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * ID로 사용자 조회
   */
  static async findById(id: string): Promise<PrismaUser | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * 사용자 정보 업데이트
   */
  static async update(id: string, updateData: UpdateUserInput): Promise<PrismaUser> {
    return prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * 비밀번호 확인
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * 사용자 삭제 (계정 비활성화)
   */
  static async deactivate(id: string): Promise<PrismaUser> {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * 마지막 로그인 시간 업데이트
   */
  static async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * 이메일 인증 처리
   */
  static async verifyEmail(id: string): Promise<PrismaUser> {
    return prisma.user.update({
      where: { id },
      data: { emailVerified: true },
    });
  }

  /**
   * 사용자 통계 조회
   */
  static async getUserStats(userId: string) {
    const [user, stats, progress] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.learningStats.findUnique({ where: { userId } }),
      prisma.progress.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return { user, stats, progress };
  }

  /**
   * 사용자 학습 경로 조회
   */
  static async getUserLearningPaths(userId: string) {
    return prisma.learningPath.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}