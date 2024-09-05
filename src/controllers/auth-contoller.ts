import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { transporter } from "../libs/nodemailer";

import authService from "../services/auth-service";

async function login(req: Request, res: Response) {
  try {
    const user = await authService.login(req.body);

    res.json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
}

async function register(req: Request, res: Response) {
  try {
    const user = await authService.register(req.body);
    const token = jwt.sign(
      user.id.toString(),
      process.env.JWT_SECRET as string
    );
    const fullUrl = req.protocol + "://" + req.get("host");

    const info = await transporter.sendMail({
      from: '"PT Widya Matador Inovasi" <muhammadirfan2823@gmail.com>', // sender address
      to: user.email, // list of receivers
      subject: "Verification Link", // Subject line
      html: `
      <div style="background-color: #FFF; margin: auto; width: 50%; text-align: center; padding: 1rem; border-radius: 12px; font-family: Arial, Helvetica, sans-serif; color: black;">
          <H1 style="color: #04A51E; font-weight: bold;">PT Widya Matador Inovasi</H1>
          <p style="font-size: 0.8rem;">Welcome!<br> Click the button below to verify your account</p>
          <Button style="background-color: #04A51E; border: none; border-radius: 12px; height: 40px; margin: 1rem;"><a style="text-decoration: none; color: white; margin: 0.5rem; font-size: 1rem;" href="${fullUrl}/api/v1/auth/verify-email?token=${token}">Verify</a></Button>
          <p style="font-size: 0.8rem;">Please ignore this message if you feel that you are not registering to our services.</p>
          <p style="font-size: 0.8rem; margin-top: 0.33rem;"> Thank you for using our services.</p>
      </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);

    await authService.createVerification(token, "EMAIL");

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
}

async function verifyEmail(req: Request, res: Response) {
  try {
    const token = req.query.token as string;
    await authService.verify(token);
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/auth/login`);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
}

async function check(req: Request, res: Response) {
  try {
    res.json(res.locals.user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
}

async function resetPassword(req: Request, res: Response) {
  try {
    const body = req.body;
    const getUser = await authService.user(req.body);

    const token = jwt.sign(
      getUser!.id.toString(),
      process.env.JWT_SECRET as string
    );
    const fullUrl = req.protocol + "://" + req.get("host");

    const info = await transporter.sendMail({
      from: '"PT Widya Matador Inovasi" <muhammadirfan2823@gmail.com>',
      to: getUser!.email,
      subject: "Verification Link",
      html: `
      <div style="background-color: #FFF; margin: auto; width: 50%; text-align: center; padding: 1rem; border-radius: 12px; font-family: Arial, Helvetica, sans-serif; color: black;">
          <H1 style="color: #04A51E; font-weight: bold;">PT Widya Matador Inovasi</H1>
          <p style="font-size: 0.8rem;">Welcome!<br> Click the button below to verify your email</p>
          <Button style="background-color: #04A51E; border: none; border-radius: 12px; height: 40px; margin: 1rem;"><a style="text-decoration: none; color: white; margin: 0.5rem; font-size: 1rem;" href="${fullUrl}/api/v1/auth/verify-email-reset-password?token=${token}">Verify</a></Button>
          <p style="font-size: 0.8rem;">Please ignore this message if you feel that you are not registering to our services.</p>
          <p style="font-size: 0.8rem; margin-top: 0.33rem;"> Thank you for using our services.</p>
      </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);

    const user = await authService.reset(body);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
}

async function ResetPassword(req: Request, res: Response) {
  try {
    const reset = await authService.reset(req.body);

    res.status(200).json(reset);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
}

async function verifyEmailForForgotPassword(req: Request, res: Response) {
  try {
    const token = req.query.token as string;
    await authService.verifyEmailForForgotPassword(token);
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/auth/reset-password`);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: "An unknown error occurred",
      });
    }
  }
}

export default {
  login,
  register,
  check,
  verifyEmail,
  resetPassword,
  ResetPassword,
  verifyEmailForForgotPassword,
};