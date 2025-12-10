import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';
import { extractTokenFromHeader, verifyToken } from './jwt';
import { UserModel } from '../models/User';

// Request 인터페이스 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * 인증 미들웨어
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader || '');

    if (!token) {
      throw new CustomError('인증 토큰이 필요합니다.', 401);
    }

    const payload = verifyToken(token);

    // 토큰 타입 확인
    if (payload.type !== 'access') {
      throw new CustomError('잘못된 토큰 타입입니다.', 401);
    }

    // 사용자 존재 여부 확인
    const user = await UserModel.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new CustomError('유효하지 않은 사용자입니다.', 401);
    }

    // 요청에 사용자 정보 추가
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(new CustomError('인증에 실패했습니다.', 401));
    }
  }
};

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader || '');

    if (token) {
      const payload = verifyToken(token);

      if (payload.type === 'access') {
        const user = await UserModel.findById(payload.userId);
        if (user && user.isActive) {
          req.user = {
            id: user.id,
            email: user.email,
          };
        }
      }
    }

    next();
  } catch (error) {
    // 선택적 인증에서는 에러가 나도 통과
    next();
  }
};

/**
 * 권한 체크 미들웨어
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new CustomError('로그인이 필요합니다.', 401);
  }
  next();
};

/**
 * 사용자 자신의 리소스에만 접근 가능한지 체크
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const resourceUserId = req.params[userIdParam];

    if (!req.user) {
      throw new CustomError('로그인이 필요합니다.', 401);
    }

    if (req.user.id !== resourceUserId) {
      throw new CustomError('접근 권한이 없습니다.', 403);
    }

    next();
  };
};