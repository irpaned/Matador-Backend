import { Midtrans } from "@miwone/midtrans-client-typescript";
export const snap = new Midtrans.Snap({
  clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY || "",
  serverKey: process.env.VITE_MIDTRANS_CLIENT_KEY || "",
  isProduction: false,
});

export const coreMidtrans = new Midtrans.CoreApi({
  clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY,
  serverKey: process.env.VITE_MIDTRANS_CLIENT_KEY,
  isProduction: false,
});
