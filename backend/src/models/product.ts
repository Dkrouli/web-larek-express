import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  image: {
    fileName: string;
    originalName: string;
  };
  category: string;
  description?: string;
  price?: number | null;
}

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    required: [true, 'Название товара обязательно'],
    minlength: [2, 'Название должно быть минимум 2 символа'],
    maxlength: [30, 'Название не может быть длиннее 30 символов'],
    unique: true,
  },
  image: {
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
  },
  category: {
    type: String,
    required: [true, 'Категория обязательна'],
  },
  description: String,
  price: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true,
});

export default model<IProduct>('product', productSchema);
