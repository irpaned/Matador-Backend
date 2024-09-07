import j from "joi";

export const productSchema = j.object({
  productName: j.string().required().min(3).max(20),
  price: j.number().required().min(1),
  photoProduct: j.required(),
});
