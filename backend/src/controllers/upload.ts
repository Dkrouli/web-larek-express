import { Request, Response } from 'express';

interface UploadResponse {
  fileName: string;
  originalName: string;
}

const uploadFile = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      error:
        'Файл не загружен. Проверьте тип файла (только jpg, png, gif, webp) и размер (макс. 5 МБ).',
    });
  }

  const responseData: UploadResponse = {
    fileName: `/images/${req.file.filename}`,
    originalName: req.file.originalname,
  };

  return res.status(201).json(responseData);
};

export default uploadFile;
