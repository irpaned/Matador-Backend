import { PrismaClient } from "@prisma/client";
import { ProductDTO } from "../dto/product-dto";
import { cloudinaryDelete, cloudinaryUpload } from "../utils/cloudinaryHandler";
import { productSchema } from "../validators/product";

const prisma = new PrismaClient();

async function findMany() {
  return await prisma.product.findMany();
}

async function create(dto: ProductDTO, userId: number) {
  try {
    const photoProductData = productSchema.validate(dto);
    if (photoProductData.error) throw new Error(photoProductData.error.message);

    if (dto.photoProduct) {
      const upload = await cloudinaryUpload(dto.photoProduct);
      dto.photoProduct = upload.secure_url;
    }

    return await prisma.product.create({
      data: {
        ...dto,
        userId: userId,
      },
    });
  } catch (error) {
    throw new Error(
      "Failed to create product: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
}

async function remove(id: number) {
  try {
    const product = await prisma.product.findFirst({
      where: { id: Number(id) },
    });

    if (product) {
      return await prisma.product.delete({
        where: {
          id: Number(id),
        },
      });
    } else {
      throw new Error("You can't delete product");
    }
  } catch (error) {
    throw new String(error);
  }
}

async function edit(id: number, dto: ProductDTO, userId: number) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
    });

    const user = await prisma.user.findFirst({
      where: { id: Number(userId) },
    });

    if (dto.photoProduct) {
      if (product?.photoProduct) {
        await cloudinaryDelete(product.photoProduct);
      }
      const photoProduct = await cloudinaryUpload(dto.photoProduct);
      dto.photoProduct = photoProduct?.secure_url;
    }

    if (dto.price) {
      product!.price = dto.price;
    }

    if (dto.productName) {
      product!.productName = dto.productName;
    }

    if (product?.userId === user?.id) {
      return await prisma.product.update({
        where: {
          id: Number(id),
        },
        data: { ...dto },
      });
    } else {
      throw new Error("You can't edit product other people");
    }
  } catch (error) {
    throw new String(error);
  }
}

export default { findMany, create, remove, edit };
