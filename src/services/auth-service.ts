import { PrismaClient, VerificationType } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginDTO, registerDTO, ResetDTO } from "../dto/auth-dto";
import { loginSchema, registerSchema } from "../validators/auth";

const prisma = new PrismaClient();

async function register(dto: registerDTO) {
  try {
    const validate = registerSchema.validate(dto);

    const salt = 10;
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    dto.password = hashedPassword;

    if (validate.error) {
      throw new String("User not found!");
    }

    return await prisma.user.create({
      data: { ...dto },
    });
  } catch (error) {
    throw new String(error);
  }
}

async function login(dto: LoginDTO) {
  try {
    const validate = loginSchema.validate(dto);

    if (validate.error) {
      throw new String(validate.error.message);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user?.isVerified) throw new Error("User is not verified");
    if (!user) throw new String("User not found!");

    const isValidPassword = await bcrypt.compare(dto.password, user.password);

    if (!isValidPassword) throw new Error("User not found!");

    const { password, ...restUser } = user;

    const jwtSecret = process.env.JWT_SECRET as string;

    const token = jwt.sign(restUser, jwtSecret);

    return { token, restUser };
  } catch (error) {
    throw new String(error);
  }
}

async function createVerification(token: string, type: VerificationType) {
  try {
    return await prisma.verification.create({
      data: {
        token,
        type,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to create verification");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

async function verify(token: string) {
  try {
    const verification = await prisma.verification.findUnique({
      where: { token },
    });
    const userId = jwt.verify(
      verification!.token,
      process.env.JWT_SECRET as string
    );

    if (verification!.type === "FORGOT_PASSWORD") {
      return await prisma.user.update({
        data: {
          isVerifiedEmail: true,
        },
        where: {
          id: Number(userId),
        },
      });
    } else {
      return await prisma.user.update({
        data: {
          isVerified: true,
        },
        where: {
          id: Number(userId),
        },
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to verify email");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

async function verifyEmailForForgotPassword(token: string) {
  try {
    const verification = await prisma.verification.findUnique({
      where: { token },
    });
    const userId = jwt.verify(
      verification!.token,
      process.env.JWT_SECRET as string
    );

    return await prisma.user.update({
      data: {
        isVerifiedEmail: true,
      },
      where: {
        id: Number(userId),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to verify email");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}
async function reset(dto: ResetDTO) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: String(dto.email),
        isVerifiedEmail: true,
      },
    });

    if (dto.password) {
      const salt = 10;
      const hashedPassword = await bcrypt.hash(dto.password, salt);
      user!.password = hashedPassword;
    }

    if (user!.isVerifiedEmail == true) {
      return await prisma.user.update({
        where: { email: String(dto.email) },
        data: {
          password: user!.password,
          isVerifiedEmail: false,
        },
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to reset password");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

async function user(dto: ResetDTO) {
  try {
    return await prisma.user.findFirst({
      where: {
        email: String(dto.email),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to find user");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

export default {
  login,
  register,
  verify,
  createVerification,
  reset,
  verifyEmailForForgotPassword,
  user,
};
