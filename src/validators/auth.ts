import joi from "joi";
import { LoginDTO } from "../dto/auth-dto";

export const loginSchema = joi.object<LoginDTO>({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

export const registerSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
  userName: joi.string().regex(/^\S+$/).required(),
  fullName: joi.string().required().min(3).max(20),
});
