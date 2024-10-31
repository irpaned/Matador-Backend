import { PrismaClient } from "@prisma/client";
import { snap } from "../libs/midtrans";

const prisma = new PrismaClient();

export async function payment(userId: number, productId: number) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const product = await prisma.productPackage.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (!product.price || product.price <= 0) {
    throw new Error("Harga produk tidak valid");
  }

  const TotalPrice = product.price;

  const dbTransaction = await prisma.transaction.create({
    data: {
      status: "pending",
      paymentType: "Midtrans",
      amount: TotalPrice,
      user: { connect: { id: userId } },
      transactionId: "tempTransactionId",
    },
  });

  const orderId = dbTransaction.id.toString();

  const customerDetail = {
    email: user.email,
  };

  const itemDetails = [
    {
      id: product.id,
      name: product.productName,
      price: product.price,
      quantity: 1,
    },
  ];

  console.log("item", itemDetails);

  const transaction = await snap.createTransaction({
    transaction_details: {
      order_id: orderId,
      gross_amount: TotalPrice,
    },
    item_details: itemDetails,
    customer_details: customerDetail,
  });

  console.log("transaction", transaction);

  const { token, order_id, redirect_url } = transaction;
  return { token, order_id, redirect_url };
}

// import { PrismaClient } from "@prisma/client";
// import { snap } from "../libs/midtrans";

// const prisma = new PrismaClient();

// export async function payment(userId: number, productId: number) {
//   // Mendapatkan data user
//   const user = await prisma.user.findUnique({
//     where: {
//       id: userId,
//     },
//   });

//   if (!user) {
//     throw new Error("User tidak ditemukan");
//   }

//   // Mendapatkan data produk
//   const product = await prisma.productPackage.findUnique({
//     where: {
//       id: productId,
//     },
//   });

//   if (!product) {
//     throw new Error("Produk tidak ditemukan");
//   }

//   if (!product.price || product.price <= 0) {
//     throw new Error("Harga produk tidak valid");
//   }

//   const totalPrice = product.price;

//   // Membuat transaksi di database dengan status "pending"
//   const dbTransaction = await prisma.transaction.create({
//     data: {
//       status: "pending",
//       paymentType: "Midtrans",
//       amount: totalPrice,
//       user: { connect: { id: userId } },
//       transactionId: "tempTransactionId", // ID sementara
//     },
//   });

//   const orderId = dbTransaction.id.toString();

//   // Detail customer
//   const customerDetail = {
//     email: user.email,
//   };

//   // Detail item
//   const itemDetails = [
//     {
//       id: product.id,
//       name: product.productName,
//       price: product.price,
//       quantity: 1,
//     },
//   ];

//   console.log("item", itemDetails);

//   // Membuat transaksi dengan Midtrans Snap
//   const transaction = await snap.createTransaction({
//     transaction_details: {
//       order_id: orderId,
//       gross_amount: totalPrice,
//     },
//     item_details: itemDetails,
//     customer_details: customerDetail,
//   });

//   console.log("transaction", transaction);

//   const { token, order_id, redirect_url } = transaction;

//   // Mengembalikan token, order ID, dan URL redirect dari Midtrans
//   return { token, order_id, redirect_url };
// }
