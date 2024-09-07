import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import UserController from "./controllers/user-contoller";
import AuthController from "./controllers/auth-contoller";
import ProductController from "./controllers/product-controller";
import dotenv from "dotenv";
import { authenticate } from "./middleware/authenticate";
import { upload } from "./libs/upload-file";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const routerv1 = express.Router();

app.use(cors());
app.use(express.json());
app.use("/api/v1", routerv1);
app.use("/uploads", express.static("uploads"));

// v1
routerv1.get("/", async (req: Request, res: Response) => {
  res.send("Welcome to v1");
});

// AUTH
routerv1.post("/auth/login", AuthController.login);
routerv1.get("/auth/check", authenticate, AuthController.check);
routerv1.post("/auth/register", AuthController.register);
routerv1.post("/auth/reset-password", AuthController.resetPassword);
routerv1.patch("/auth/resetpassword", AuthController.ResetPassword);
routerv1.get("/auth/verify-email", AuthController.verifyEmail);
routerv1.get(
  "/auth/verify-email-reset-password",
  AuthController.verifyEmailForForgotPassword
);

// USER
routerv1.get("/user/:id", UserController.findOneProfile);
routerv1.get("/user", authenticate, UserController.find);
routerv1.get("/users", authenticate, UserController.findMany);
routerv1.patch(
  "/user/:id",
  authenticate,
  upload.fields([
    { name: "photoProfile", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  UserController.updateProfile
);

//PRODUCT
routerv1.get("/product", authenticate, ProductController.findMany);
routerv1.delete("/product/:id", authenticate, ProductController.remove);
routerv1.patch(
  "/product/:id",
  authenticate,
  upload.fields([{ name: "photoProduct", maxCount: 1 }]),
  ProductController.update
);
routerv1.post(
  "/product",
  authenticate,
  upload.single("photoProduct"),
  ProductController.create
);

app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});
