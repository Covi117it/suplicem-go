import protectedApi from "./protectedApi";

export const createProduct = async (product: {
  name: string;
  price: number;
  unit: string;
  imageUrl?: string;
}) => {
  const response = await protectedApi.post("/products", product);
  return response.data;
};

export const getProducts = async () => {
  const response = await protectedApi.get("/products");
  return response.data;
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
