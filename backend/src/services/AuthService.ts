import { User, CEFRLevel, LearningGoal } from '@prisma/client';
import { CustomError } from '../lib/errorHandler';
import { UserModel } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../lib/jwt';
import Joi from 'joi';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  currentLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  learningGoals: LearningGoal[];
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

// 유효성 검사 스키마
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '유효한 이메일 주소를 입력해주세요.',
    'any.required': '이메일은 필수 항목입니다.',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': '비밀번호는 최소 8자 이상이어야 합니다.',
    'any.required': '비밀번호는 필수 항목입니다.',
  }),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': '이름은 최소 2자 이상이어야 합니다.',
    'string.max': '이름은 최대 50자까지 가능합니다.',
    'any.required': '이름은 필수 항목입니다.',
  }),
  email: Joi.string().email().required().messages({
    'string.email': '유효한 이메일 주소를 입력해주세요.',
    'any.required': '이메일은 필수 항목입니다.',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': '비밀번호는 최소 8자 이상이어야 합니다.',
      'string.pattern.base': '비밀번호는 대소문자와 숫자를 포함해야 합니다.',
      'any.required': '비밀번호는 필수 항목입니다.',
    }),
  currentLevel: Joi.string().valid('A1', 'A2', 'B1', 'B2').required(),
  targetLevel: Joi.string().valid('A1', 'A2', 'B1', 'B2').required(),
  learningGoals: Joi.array().items(
    Joi.string().valid(
      'SERMON_WRITING',
      'CONVERSATION',
      'READING_COMPREHENSION',
      'PRONUNCIATION',
      'GRAMMAR',
      'VOCABULARY'
    )
  ).min(1).required().messages({
    'array.min': '최소 하나의 학습 목표를 선택해주세요.',
  }),
});

export class AuthService {
  /**
   * 사용자 로그인
   */
  static async login(loginData: LoginInput): Promise<AuthResponse> {
    // 입력 데이터 유효성 검사
    const { error } = loginSchema.validate(loginData);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const { email, password } = loginData;

    // 사용자 조회
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new CustomError('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
    }

    // 계정 활성화 상태 확인
    if (!user.isActive) {
      throw new CustomError('비활성화된 계정입니다.', 401);
    }

    // 비밀번호 확인
    const isPasswordValid = await UserModel.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
    }

    // 마지막 로그인 시간 업데이트
    await UserModel.updateLastLogin(user.id);

    // 토큰 생성
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 비밀번호 제거 후 반환
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * 사용자 회원가입
   */
  static async register(registerData: RegisterInput): Promise<AuthResponse> {
    // 입력 데이터 유효성 검사
    const { error } = registerSchema.validate(registerData);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const { email, currentLevel, targetLevel } = registerData;

    // 레벨 순서 검증
    const levels = ['A1', 'A2', 'B1', 'B2'];
    const currentLevelIndex = levels.indexOf(currentLevel);
    const targetLevelIndex = levels.indexOf(targetLevel);

    if (targetLevelIndex <= currentLevelIndex) {
      throw new CustomError('목표 레벨은 현재 레벨보다 높아야 합니다.', 400);
    }

    // 이메일 중복 확인
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new CustomError('이미 가입된 이메일 주소입니다.', 400);
    }

    // 사용자 생성
    const newUser = await UserModel.create(registerData);

    // 토큰 생성
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // 비밀번호 제거 후 반환
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * 토큰 새로고침
   */
  static async refreshToken(refreshTokenStr: string): Promise<{ accessToken: string }> {
    try {
      const payload = verifyToken(refreshTokenStr);

      // 리프레시 토큰인지 확인
      if (payload.type !== 'refresh') {
        throw new CustomError('잘못된 토큰 타입입니다.', 401);
      }

      // 사용자 존재 여부 확인
      const user = await UserModel.findById(payload.userId);
      if (!user || !user.isActive) {
        throw new CustomError('유효하지 않은 사용자입니다.', 401);
      }

      // 새 액세스 토큰 생성
      const accessToken = generateAccessToken(user);

      return { accessToken };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('토큰 새로고침에 실패했습니다.', 401);
    }
  }

  /**
   * 사용자 프로필 조회
   */
  static async getProfile(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new CustomError('사용자를 찾을 수 없습니다.', 404);
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * 프로필 업데이트
   */
  static async updateProfile(userId: string, updateData: Partial<RegisterInput>) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new CustomError('사용자를 찾을 수 없습니다.', 404);
    }

    // 이메일 변경 시 중복 확인
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await UserModel.findByEmail(updateData.email);
      if (existingUser) {
        throw new CustomError('이미 사용 중인 이메일 주소입니다.', 400);
      }
    }

    const updatedUser = await UserModel.update(userId, updateData);
    const { password: _, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }

  /**
   * 비밀번호 변경
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new CustomError('사용자를 찾을 수 없습니다.', 404);
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await UserModel.verifyPassword(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new CustomError('현재 비밀번호가 올바르지 않습니다.', 400);
    }

    // 새 비밀번호 유효성 검사
    const passwordSchema = Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required();

    const { error } = passwordSchema.validate(newPassword);
    if (error) {
      throw new CustomError('새 비밀번호는 8자 이상이며 대소문자와 숫자를 포함해야 합니다.', 400);
    }

    // 비밀번호 업데이트 (UserModel에서 해시 처리)
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserModel.update(userId, { password: hashedPassword } as any);
  }

  /**
   * 이메일 인증
   */
  static async verifyEmail(userId: string): Promise<void> {
    await UserModel.verifyEmail(userId);
  }
}