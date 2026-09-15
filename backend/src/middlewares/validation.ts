import { celebrate, Joi } from 'celebrate';

export const validateCreateProduct = celebrate({
  body: Joi.object().keys({
    title: Joi.string().min(2).max(30).required(),
    image: Joi.object().keys({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).required(),
    category: Joi.string().required(),
    description: Joi.string().optional(),
    price: Joi.number().min(0).allow(null).optional(),
  }),
});

export const validateProductId = celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
});

export const validateCreateOrder = celebrate({
  body: Joi.object().keys({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    total: Joi.number().required(),
    items: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  }),
});