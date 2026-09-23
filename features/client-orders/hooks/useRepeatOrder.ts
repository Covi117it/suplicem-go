import { useContext } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { CartContext, Product } from "@/context/cartContext";

export const useRepeatOrder = (selectedOrder?: any) => {
  const { cart, setCartItems, addToCart } = useContext(CartContext);
  const router = useRouter();

  const handleRepeatOrder = () => {
    if (!selectedOrder?.items || selectedOrder.items.length === 0) return;

    const formattedProducts: Product[] = selectedOrder.items.map((item: any) => {
      const qty = Number(item.quantity) || 100;
      const unitPrice =
        Number(item.unitPrice) ||
        Number(item.price) ||
        (item.subtotal ? Math.round(Number(item.subtotal) / qty) : 480);

      return {
        id: item.productId || item.id || `prod-${Math.random()}`,
        name: item.name,
        price: unitPrice,
        fundas: qty,
      };
    });

    const executeReorder = (replace: boolean) => {
      if (replace) {
        setCartItems(formattedProducts);
      } else {
        formattedProducts.forEach((p: Product) => addToCart(p));
      }
      router.push("/client-cart");
    };

    if (cart.length > 0) {
      Alert.alert(
        "Carrito con productos",
        "Ya tienes materiales en tu carrito. ¿Deseas reemplazar el carrito con los productos de este pedido o sumarlos?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sumar al carrito", onPress: () => executeReorder(false) },
          {
            text: "Reemplazar carrito",
            style: "destructive",
            onPress: () => executeReorder(true),
          },
        ]
      );
    } else {
      executeReorder(true);
    }
  };

  return { handleRepeatOrder };
};
