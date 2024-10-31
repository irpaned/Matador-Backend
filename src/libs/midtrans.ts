import { Midtrans } from "@miwone/midtrans-client-typescript";
export const snap = new Midtrans.Snap({
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  isProduction: false,
});

export const coreMidtrans = new Midtrans.CoreApi({
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  isProduction: false,
});
