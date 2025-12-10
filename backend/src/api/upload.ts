import express from 'express';
import { asyncHandler } from '../lib/errorHandler';
import { authenticateToken } from '../lib/auth';
import { audioUpload, imageUpload, pdfUpload, generateFileUrl } from '../lib/upload';

export const uploadRoutes = express.Router();

// 오디오 파일 업로드
uploadRoutes.post('/audio', authenticateToken, audioUpload.single('audio'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: '오디오 파일이 업로드되지 않았습니다.',
    });
  }

  const audioUrl = generateFileUrl(req.file.filename, 'audio');

  res.json({
    success: true,
    message: '오디오 파일이 성공적으로 업로드되었습니다.',
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: audioUrl,
    },
  });
}));

// 이미지 파일 업로드
uploadRoutes.post('/image', authenticateToken, imageUpload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: '이미지 파일이 업로드되지 않았습니다.',
    });
  }

  const imageUrl = generateFileUrl(req.file.filename, 'image');

  res.json({
    success: true,
    message: '이미지 파일이 성공적으로 업로드되었습니다.',
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: imageUrl,
    },
  });
}));

// PDF 파일 업로드
uploadRoutes.post('/pdf', authenticateToken, pdfUpload.single('pdf'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'PDF 파일이 업로드되지 않았습니다.',
    });
  }

  const pdfUrl = generateFileUrl(req.file.filename, 'pdf');

  res.json({
    success: true,
    message: 'PDF 파일이 성공적으로 업로드되었습니다.',
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: pdfUrl,
    },
  });
}));

// 파일 정적 제공을 위한 미들웨어 설정
uploadRoutes.use('/files', express.static(process.env.UPLOAD_PATH || './uploads'));