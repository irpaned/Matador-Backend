import { Request, Response } from "express";
import { payment } from "../services/midtrans-service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fungsi untuk membuat transaksi
export async function createTransactionHandler(req: Request, res: Response) {
  try {
    const productId = req.params.id;
    const userId = res.locals.user.id;

    if (!userId) {
      return res.status(400).json({
        message: "User ID harus disertakan",
      });
    }

    if (!productId) {
      return res.status(400).json({
        message: "Product ID harus disertakan",
      });
    }
    const transaction = await payment(userId, parseInt(productId));
    console.log("AAAAAAAAAAAAAAAAA", transaction.token);
    res.status(200).json({
      message: "Transaction created successfully",
      redirect_url: transaction.redirect_url,
      token: transaction.token,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Transaction creation failed",
      error: error.message,
    });
  }
}

export async function midtransNotificationHandler(req: Request, res: Response) {
  const notification = req.body;

  console.log(req.body);

  try {
    const orderId = notification.order_id;
    const status = notification.transaction_status; // Update status transaksi

    // Update status transaksi di database berdasarkan order_id
    await prisma.transaction.update({
      where: { id: Number(orderId) },
      data: { status },
    });

    res.status(200).json({ message: "Transaction updated" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update transaction status",
      error: error.message,
    });
  }
}
