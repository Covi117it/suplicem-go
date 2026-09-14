import ProductCatalogCard, { Product } from "@/components/home/ProductCatalogCard";
import ProductQuantityModal from "@/components/home/ProductQuantityModal";
import PromoBannerCarousel from "@/components/home/PromoBannerCarousel";
import { Palette } from "@/constants/theme";
import { useAlert } from "@/context/alertContext";
import { CartContext } from "@/context/cartContext";
import { useLoading } from "@/context/loadingContext";
import { useMountEffect } from "@/hooks/lifeCicle";
import { getProducts } from "@/services/productService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ClientHomeScreen: React.FC = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductForQty, setSelectedProductForQty] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("1");

  const router = useRouter();
  const { show, hide } = useLoading();
  const { addToCart, cart, updateProductInCart } = useContext(CartContext);
  const { showAlert } = useAlert();

  useMountEffect(async () => {
    show();
    const productsResponse = await getProducts();
    hide();
    setProducts(productsResponse?.products || []);
  });

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const openQuantityModal = (product: Product) => {
    setSelectedProductForQty(product);
    setQuantity("100");
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProductForQty) return;
    const numQty = parseInt(quantity, 10);

    if (isNaN(numQty) || numQty < 1) {
      showAlert({
        message: "Por favor, ingresa una cantidad válida mayor a cero.",
        type: "warning",
      });
      return;
    }

    if (numQty > 1000) {
      showAlert({
        message: "La cantidad máxima permitida por producto es de 1,000 unidades.",
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={styles.topLogoContainer}>
        <Image
          source={require("@/assets/images/logo2.png")}
          style={styles.topLogo}
          resizeMode="contain"
        />
      </View>

      {/* Barra de Búsqueda y Carrito */}
      <View style={styles.header}>
        <TextInput
          placeholder="Buscar producto de construcción..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

        <TouchableOpacity style={styles.cartIcon} onPress={goToCart}>
          <Ionicons name="cart-outline" size={28} color={Palette.primary} />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Banner Publicitario Rotativo */}
      <PromoBannerCarousel />

      {/* Lista de Productos */}
      <View style={styles.list}>
        {filteredProducts?.map((item) => (
          <ProductCatalogCard
            key={item.id}
            product={item}
            onSelectQuantity={openQuantityModal}
          />
        ))}
      </View>

      {/* Modal de Selección de Cantidad */}
      <ProductQuantityModal
        product={selectedProductForQty}
        quantity={quantity}
        setQuantity={setQuantity}
        onClose={() => setSelectedProductForQty(null)}
        onConfirm={handleConfirmAddToCart}
      />
    </ScrollView>
  );
};

export default ClientHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 30,
  },
  topLogoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  topLogo: {
    width: 180,
    height: 60,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    height: 45,
    backgroundColor: "#FAFAFA",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Palette.primaryDark,
  },
  cartIcon: {
    marginLeft: 12,
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: Palette.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cartBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
});