import { Request, Response } from "express";
import UserService from "../services/user-service";

async function find(req: Request, res: Response) {
  try {
    const userLogged = res.locals.user;
    const search = req.query.search as string;
    const users = await UserService.find(search, userLogged.id);

    return res.json(users);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to create verification");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

async function findOneProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await UserService.findOneProfile(Number(id));

    if (!user) {
      return res.status(404).json({ message: "User not found ya" });
    }

    res.json(user);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to create verification");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

async function findMany(req: Request, res: Response) {
  try {
    const user = await UserService.findMany();

    if (!user) {
      return res.status(404).json({ message: "User not found ya" });
    }

    res.json(user);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to create verification");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

async function updateProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const body = {
      ...req.body,
      photoProfile: files?.["photoProfile"]?.[0]?.path,
      coverImage: files?.["coverImage"]?.[0]?.path,
    };

    const user = await UserService.findOneProfile(Number(id));
    if (!user)
      res.status(404).json({
        message: "Thread not found!",
      });

    const editedProfile = await UserService.updateProfile(Number(id), body);
    res.json(editedProfile);
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
}

export default {
  find,
  updateProfile,
  findOneProfile,
  //   follow,
  //   getDataFollowers,
  //   getDataFollowings,
  //   CountDataFollowers,
  findMany,
};
