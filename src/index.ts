import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import UserController from "./controllers/user-contoller";
import AuthController from "./controllers/auth-contoller";
import ProductController from "./controllers/product-controller";
import dotenv from "dotenv";
import { authenticate } from "./middleware/authenticate";
import { upload } from "./libs/upload-file";
import {
  createTransactionHandler,
  midtransNotificationHandler,
} from "./controllers/midtrans-controller";
import { google } from "googleapis";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const routerv1 = express.Router();
// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   "http://localhost:5000/auth/google/callback"
// );

// const scope = [
//   "https://www.googleapis.com/auth/userinfo.email",
//   "https://www.googleapis.com/auth/userinfo.profile",
// ];

// const authorizationUrl = oauth2Client.generateAuthUrl({
//   access_type: "offline",
//   scope: scope,
//   include_granted_scopes: true,
// });

// app.get("/auth/google", (req, res) => {
//   res.redirect(authorizationUrl);
// });

// app.get("/auth/google/callback", async (req, res) => {
//   const { code } = req.query;
//   const { tokens } = await oauth2Client.getToken(code as string);
//   oauth2Client.setCredentials(tokens);

//   const oauth2 = google.oauth2({
//     auth: oauth2Client,
//     version: "v2",
//   });

//   const { data } = await oauth2.userinfo.get();

//   if (!data.email || !data.name) {
//     return res.json({
//       data: data,
//     });
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
//     id: user?.id,
//     fullName: user.fullName,
//   };

//   const secret = process.env.JWT_SECRET;

//   if (typeof secret !== "string") {
//     throw new Error(
//       "JWT_SECRET environment variable is not set or is not a string."
//     );
//   }

//   const expiresIn = 60 * 60 * 1 || "default_secret_key";

//   const token = jwt.sign(payload, secret, {
//     expiresIn: expiresIn,
//   });

//   const cekData = res.json({
//     data: {
//       id: user.id,
//       fullName: user.fullName,
//     },
//     token: token,
//   });

//   return cekData;
// });

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
//OAUTH
routerv1.get("/auth/google", AuthController.googleView);
routerv1.get("/auth/google/callback", AuthController.googleAuthCallback);

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
routerv1.get("/products", authenticate, ProductController.findMany);
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

// MIDTRANS
routerv1.post(
  "/create-transaction/:id",
  authenticate,
  createTransactionHandler
);
routerv1.post("/midtrans-notification", midtransNotificationHandler);

app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});
