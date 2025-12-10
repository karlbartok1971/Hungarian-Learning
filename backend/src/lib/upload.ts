import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CustomError } from './errorHandler';

const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB

// 업로드 디렉토리 생성
const createUploadDirectories = () => {
  const directories = [
    path.join(UPLOAD_PATH, 'audio'),
    path.join(UPLOAD_PATH, 'images'),
    path.join(UPLOAD_PATH, 'pdfs'),
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 업로드 디렉토리 생성: ${dir}`);
    }
  });
};

// 초기화
createUploadDirectories();

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(UPLOAD_PATH, 'files');

    // 파일 타입에 따라 폴더 구분
    if (file.mimetype.startsWith('audio/')) {
      uploadPath = path.join(UPLOAD_PATH, 'audio');
    } else if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(UPLOAD_PATH, 'images');
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = path.join(UPLOAD_PATH, 'pdfs');
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 파일명 생성: timestamp_randomstring.extension
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}_${randomString}${extension}`;
    cb(null, filename);
  },
});

// 파일 필터링 함수
const createFileFilter = (allowedMimeTypes: string[]) => {
  return (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new CustomError(`지원하지 않는 파일 형식입니다. 허용된 형식: ${allowedMimeTypes.join(', ')}`, 400));
    }
  };
};

// 오디오 파일 업로드 설정
export const audioUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: createFileFilter([
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/m4a',
    'audio/webm',
  ]),
});

// 이미지 파일 업로드 설정
export const imageUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: createFileFilter([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ]),
});

// PDF 파일 업로드 설정
export const pdfUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE * 5, // PDF는 50MB까지 허용
  },
  fileFilter: createFileFilter([
    'application/pdf',
  ]),
});

// 일반 파일 업로드 설정 (모든 타입 허용)
export const generalUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// 파일 삭제 유틸리티
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('파일 삭제 실패:', err);
        reject(err);
      } else {
        console.log('파일 삭제 성공:', filePath);
        resolve();
      }
    });
  });
};

// 파일 정보 조회 유틸리티
export const getFileInfo = (filePath: string) => {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      exists: true,
    };
  } catch (error) {
    return {
      exists: false,
    };
  }
};

// 파일 URL 생성 유틸리티
export const generateFileUrl = (filename: string, type: 'audio' | 'image' | 'pdf' = 'audio'): string => {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  return `${baseUrl}/files/${type}/${filename}`;
};