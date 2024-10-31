import { PrismaClient, VerificationType } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginDTO, registerDTO, ResetDTO } from "../dto/auth-dto";
import { loginSchema, registerSchema } from "../validators/auth";
import { google } from "googleapis";

const prisma = new PrismaClient();
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/api/v1/auth/google/callback"
);

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

    const isValidPassword = await bcrypt.compare(dto.password, user.password!);

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

function generateGoogleAuthUrl() {
  const scope = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope,
    include_granted_scopes: true,
  });
}

async function handleGoogleCallback(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
  const { data } = await oauth2.userinfo.get();

  if (!data.email || !data.name) {
    throw new Error("Email or Name not provided by Google.");
  }

  let user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: data.email,
        fullName: data.name,
        isVerified: true,
      },
    });
  }

  const payload = { id: user.id, fullName: user.fullName };
  const secret = process.env.JWT_SECRET as string;

  const token = jwt.sign(payload, secret, { expiresIn: "1h" });

  return { user, token };
}

// async function authenticateGoogleUser(code: string) {
//   const { tokens } = await oauth2Client.getToken(code);
//   oauth2Client.setCredentials(tokens);

//   const oauth2 = google.oauth2({
//     auth: oauth2Client,
//     version: "v2",
//   });

//   const { data } = await oauth2.userinfo.get();

//   if (!data.email || !data.name) {
//     throw new Error("User data is incomplete.");
//   }

//   let user = await prisma.user.findUnique({
//     where: {
//       email: data.email,
//     },
//   });

//   if (!user) {
//     user = await prisma.user.create({
//       data: {
//         email: data.email,
//         fullName: data.name,
//         isVerified: true,
//       },
//     });
//   }

//   const payload = {
//     id: user.id,
//     fullName: user.fullName,
//   };

//   const secret = process.env.JWT_SECRET;

//   if (typeof secret !== "string") {
//     throw new Error(
//       "JWT_SECRET environment variable is not set or is not a string."
//     );
//   }

//   const expiresIn = 60 * 60 * 1;

//   const token = jwt.sign(payload, secret, {
//     expiresIn: expiresIn,
//   });

//   const cek = {
//     user: {
//       id: user.id,
//       fullName: user.fullName,
//     },
//     token,
//   };

//   console.log("cek", cek);

//   return cek;

//   // return {
//   //   user: {
//   //     id: user.id,
//   //     fullName: user.fullName,
//   //   },
//   //   token,
//   // };
// }

export default {
  login,
  register,
  verify,
  createVerification,
  reset,
  verifyEmailForForgotPassword,
  user,
  // authenticateGoogleUser,
  handleGoogleCallback,
  generateGoogleAuthUrl,
};
