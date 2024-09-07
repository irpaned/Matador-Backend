import { PrismaClient } from "@prisma/client";
// import { editProfileDTO } from "../dto/auth-dto";
import { v2 as cloudinary } from "cloudinary";
import { updateProfileSchema } from "../validators/user";
import { cloudinaryDelete, cloudinaryUpload } from "../utils/cloudinaryHandler";
import { UserProfileDto } from "../dto/auth-dto";

const prisma = new PrismaClient();

async function find(search: string, userId: number) {
  try {
    const data = await prisma.user.findMany({
      where: {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    return DataView;
  } catch (error) {
    throw new String(error);
  }
}

async function findMany() {
  try {
    const user = await prisma.user.findMany();
    return user;
  } catch (error) {}
}

async function findOneProfile(id: number) {
  try {
    const profile = await prisma.user.findFirst({
      where: { id },
    });

    if (!profile) {
      throw new Error("Profile not found!");
    }

    return {
      ...profile,
    };
  } catch (error) {
    throw new String(error);
  }
}

async function updateProfile(userId: number, dto: UserProfileDto) {
  try {
    const userValidate = updateProfileSchema.validate(dto);
    if (userValidate.error) throw new Error(userValidate.error.message);

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    if (dto.photoProfile) {
      if (user.photoProfile) {
        await cloudinaryDelete(user.photoProfile);
      }
      const photoProfile = await cloudinaryUpload(dto.photoProfile);
      dto.photoProfile = photoProfile?.secure_url;
    }

    if (dto.coverImage) {
      if (user.coverImage) {
        await cloudinaryDelete(user.coverImage);
      }
      const coverImage = await cloudinaryUpload(dto.coverImage);
      dto.coverImage = coverImage?.secure_url;
    }

    if (dto.fullName) {
      user!.fullName = dto.fullName;
    }

    if (dto.sex) {
      user!.sex = dto.sex;
    }

    if (dto.bio) {
      user!.bio = dto.bio;
    }

    return await prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });
  } catch (error) {
    throw new String(error);
  }
}

export default { find, updateProfile, findOneProfile, findMany };
