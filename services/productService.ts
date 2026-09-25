import { safeRequest } from "./apiSafe";
import protectedApi from "./protectedApi";

export const createProduct = async (product: {
  name: string;
  price: number;
  unit: string;
  imageUrl?: string;
  imageUri?: string;
}) => {
  if (product.imageUri) {
    const formData = new FormData();
    const file: any = {
      uri: product.imageUri,
      name: "producto.jpg",
      type: "image/jpeg",
    };
    formData.append("image", file);
    formData.append("name", product.name);
    formData.append("price", product.price.toString());
    formData.append("unit", product.unit);

    const result = await safeRequest(() =>
      protectedApi.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );
    return result.success ? result.data : { success: false, message: result.message };
  }

  const result = await safeRequest(() => protectedApi.post("/products", product));
  return result.success ? result.data : { success: false, message: result.message };
};

export const getProducts = async (search?: string) => {
  const result = await safeRequest(() => {
    if (search && search.trim()) {
      const encodedSearch = encodeURIComponent(search.trim());
      return protectedApi.get(`/products/search?search=${encodedSearch}`);
    }
    return protectedApi.get("/products");
  });

  if (result.success && result.data) {
    return result.data;
  }
  return { success: false, products: [], message: result.message };
};

export const updateProduct = async (
  id: string,
  product: Partial<{
    name: string;
    price: number;
    unit: string;
    imageUrl?: string;
  }>
) => {
  const response = await protectedApi.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await protectedApi.delete(`/products/${id}`);
  return response.data;
};
