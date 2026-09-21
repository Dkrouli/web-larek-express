import multer from 'multer';
import path from 'path';
import fs from 'fs';

const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, tempDir);
  },

  filename: (_req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const validExt = allowed.test(path.extname(file.originalname).toLowerCase());
  const validMime = allowed.test(file.mimetype);

  if (validExt && validMime) {
    cb(null, true);
  } else {
    cb(new Error('Только изображения!'));
  }
};

const limits = { fileSize: 5 * 1024 * 1024 };

export default multer({ storage, fileFilter, limits });
