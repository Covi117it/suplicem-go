import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Product } from "@/components/home/ProductCatalogCard";
import { useAlert } from "@/context/alertContext";
import { AuthContext } from "@/context/authContext";
import { CartContext } from "@/context/cartContext";
import { getProducts } from "@/services/productService";

export const useClientCatalog = () => {
  const [searchInput, setSearchInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProductForQty, setSelectedProductForQty] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("50");

  const latestRequestIdRef = useRef(0);
  const router = useRouter();
  const { addToCart, cart, updateProductInCart, assistedClient } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showAlert } = useAlert();

  const isWholesaleAllowed =
    user?.userType === "admin" ||
    user?.userType === "seller" ||
    Boolean(assistedClient);

  const fetchProductsFromBackend = useCallback(async (query: string, isPullToRefresh = false) => {
    const requestId = ++latestRequestIdRef.current;
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getProducts(query);
      if (requestId !== latestRequestIdRef.current) return;
      if (response && response.products && Array.isArray(response.products)) {
        setProducts(response.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error al buscar productos:", error);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductsFromBackend(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, fetchProductsFromBackend]);

  const openQuantityModal = (product: Product) => {
    setSelectedProductForQty(product);
    setQuantity("50");
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProductForQty) return;
    const numQty = parseInt(quantity, 10);

    const isCement =
      selectedProductForQty.unit === "fundas" ||
      selectedProductForQty.name.toLowerCase().includes("cemento");

    if (isCement && (numQty < 50 || numQty % 50 !== 0)) {
      setSelectedProductForQty(null);
      showAlert({
        message: "La compra mínima de cemento es de 50 fundas (en múltiplos de 50).",
        type: "warning",
      });
      return;
    }

    if (!isWholesaleAllowed && numQty > 1000) {
      setSelectedProductForQty(null);
      showAlert({
        message:
          "La cantidad máxima para compras directas es de 1,000 unidades. Para compras de mayor escala, contacte a su vendedor.",
        type: "warning",
      });
      return;
    }

    if (isNaN(numQty) || numQty < 1) {
      setSelectedProductForQty(null);
      showAlert({
        message: "Por favor, ingresa una cantidad válida mayor a cero.",
        type: "warning",
      });
      return;
    }

    const exists = cart.some((item) => item.id === selectedProductForQty.id);

    if (exists) {
      updateProductInCart(selectedProductForQty.id, { fundas: numQty });
      showAlert({
        message: `¡Se actualizó la cantidad de ${selectedProductForQty.name} a ${numQty} unidades en el carrito!`,
        type: "success",
      });
    } else {
      addToCart({
        id: selectedProductForQty.id,
        name: selectedProductForQty.name,
        price: selectedProductForQty.price,
        fundas: numQty,
      });
    }

    setSelectedProductForQty(null);
  };

  const goToCart = () => {
    if (cart.length === 0) {
      showAlert({
        message: "Agrega productos antes de ir al carrito.",
        type: "warning",
      });
      return;
    }
    router.push("/client-cart");
  };

  const totalItems = cart.length;

  return {
    searchInput,
    setSearchInput,
    products,
    loading,
    refreshing,
    selectedProductForQty,
    setSelectedProductForQty,
    quantity,
    setQuantity,
    totalItems,
    openQuantityModal,
    handleConfirmAddToCart,
    goToCart,
    fetchProductsFromBackend,
  };
};
