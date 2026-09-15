import { ProductCatalogCard, Product } from "@/components/home/ProductCatalogCard";
import { ProductQuantityModal } from "@/components/home/ProductQuantityModal";
import { ProductSkeletonCard } from "@/components/home/ProductSkeletonCard";
import { PromoBannerCarousel } from "@/components/home/PromoBannerCarousel";
import { Palette } from "@/constants/theme";
import { useAlert } from "@/context/alertContext";
import { CartContext } from "@/context/cartContext";
import { useMountEffect } from "@/hooks/lifeCicle";
import { getProducts } from "@/services/productService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SKELETON_ITEMS = ["sk-1", "sk-2", "sk-3", "sk-4"];

const ClientHomeScreen: React.FC = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProductForQty, setSelectedProductForQty] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("1");

  const router = useRouter();
  const { addToCart, cart, updateProductInCart } = useContext(CartContext);
  const { showAlert } = useAlert();

  const fetchProducts = async (isPullToRefresh = false) => {
    try {
      if (isPullToRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const productsResponse = await getProducts();
      setProducts(productsResponse?.products || []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useMountEffect(() => {
    fetchProducts();
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

  const renderHeader = () => (
    <View>
      <View style={styles.topLogoContainer}>
        <Image
          source={require("@/assets/images/logo2.png")}
          style={styles.topLogo}
          resizeMode="contain"
        />
      </View>

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

      <PromoBannerCarousel />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={loading ? (SKELETON_ITEMS as any) : filteredProducts}
        keyExtractor={(item) => (loading ? item : item.id)}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            {loading ? (
              <ProductSkeletonCard />
            ) : (
              <ProductCatalogCard
                product={item}
                onSelectQuantity={openQuantityModal}
              />
            )}
          </View>
        )}
        ListHeaderComponent={renderHeader()}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={46} color="#999" />
              <Text style={styles.emptyTitle}>No se encontraron productos</Text>
              <Text style={styles.emptySubtitle}>
                {`No hay resultados para "${search}". Intenta con otro término.`}
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProducts(true)}
            colors={[Palette.primary]}
            tintColor={Palette.primary}
          />
        }
      />

      {/* Modal de Selección de Cantidad */}
      <ProductQuantityModal
        product={selectedProductForQty}
        quantity={quantity}
        setQuantity={setQuantity}
        onClose={() => setSelectedProductForQty(null)}
        onConfirm={handleConfirmAddToCart}
      />
    </View>
  );
};

export default ClientHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 30,
  },
  listContent: {
    paddingBottom: 100,
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
  itemWrapper: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginTop: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 6,
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
});