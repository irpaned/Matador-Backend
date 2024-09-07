import { Request, Response } from "express";
import productService from "../services/product-service";

async function findMany(req: Request, res: Response) {
  try {
    const data = await productService.findMany();
    res.status(200).json(data);
  } catch (error) {}
}

async function create(req: Request, res: Response) {
  try {
    const user = res.locals.user;
    const body = {
      ...req.body,
      price: Number(req.body.price),
      photoProduct: req.file?.path,
    };
    const createProduct = await productService.create(body, user.id);
    res.status(201).json(createProduct);
  } catch (error) {
    res.status(500).json({
      message: "An unknown error occurred",
    });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = await productService.remove(Number(id));
    res.status(200).json(data);
  } catch (error) {}
}

async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = res.locals.user;
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    const body = {
      ...req.body,
      photoProduct: files?.["photoProduct"]?.[0]?.path,
      price: Number(req.body.price),
    };

    const data = await productService.edit(Number(id), body, user.id);
    res.status(200).json(data);
  } catch (error) {}
}

export default {
  create,
  findMany,
  remove,
  update,
};
