import joi from "joi";
import { LoginDTO } from "../dto/auth-dto";

export const loginSchema = joi.object<LoginDTO>({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

export const registerSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
  sex: joi.string(),
  fullName: joi.string().required().min(3).max(20),
});
