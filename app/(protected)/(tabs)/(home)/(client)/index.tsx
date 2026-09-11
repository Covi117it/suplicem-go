import { useAlert } from "@/context/alertContext";
import { CartContext } from "@/context/cartContext";
import { useLoading } from "@/context/loadingContext";
import { useMountEffect } from "@/hooks/lifeCicle";
import { getProducts } from "@/services/productService";
import { formatRD } from "@/utils/currencyUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  unit: string;
};

// 3 Banners de publicidad rotativos (estilo PedidosYa / Ofertas Suplicem)
const PROMO_BANNERS = [
  {
    id: "b1",
    title: "🏗️ ¡Gran Oferta en Cemento!",
    subtitle: "Descuento especial del 15% en compras al por mayor con despacho a obra.",
    bgGradient: "#E31E24",
    badge: "OFERTA DEL MES",
    icon: "construct",
  },
  {
    id: "b2",
    title: "🚚 Despacho Exprés Gratis",
    subtitle: "Envíos inmediatos y directos a tu construcción en 24 horas.",
    bgGradient: "#0F294A",
    badge: "ENVÍO GRATIS",
    icon: "car-sport",
  },
  {
    id: "b3",
    title: "🤝 Pago a Crédito Disponible",
    subtitle: "Financia tus materiales de construcción con cuotas flexibles y tasa preferencial.",
    bgGradient: "#A04A0E",
    badge: "CRÉDITO FLEXIBLE",
    icon: "cash",
  },

  
];

const QUANTITY_OPTIONS = [
  { fundas: 100, label: "4.25 t (100 fundas)" },
  { fundas: 200, label: "8.5 t (200 fundas)" },
  { fundas: 300, label: "12.75 t (300 fundas)" },
  { fundas: 400, label: "17 t (400 fundas)" },
  { fundas: 500, label: "20.25 t (500 fundas)" },
  { fundas: 600, label: "25.5 t (600 fundas)" },
  { fundas: 1000, label: "42.5 t (1000 fundas)" },
];

//const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ClientHomeScreen: React.FC = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Modal para seleccionar la cantidad
  const [selectedProductForQty, setSelectedProductForQty] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("1");

  const router = useRouter();
  const { show, hide } = useLoading();
  const { addToCart, cart, updateProductInCart } = useContext(CartContext);
  const { showAlert } = useAlert();

  // Rotador automático del Banner Publicitario (cada 4 segundos)
  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setActiveBannerIndex((prevIndex) => (prevIndex + 1) % PROMO_BANNERS.length);
    }, 4000);
    return () => clearInterval(bannerTimer);
  }, []);

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
      // showAlert se ejecuta automáticamente dentro de addToCart
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

  useMountEffect(async () => {
    show();
    const productsResponse = await getProducts();
    hide();
    setProducts(productsResponse?.products || []);
  });

  const currentBanner = PROMO_BANNERS[activeBannerIndex];

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

      {/* Bar de Búsqueda y Carrito */}
      <View style={styles.header}>
        <TextInput
          placeholder="Buscar producto de construcción..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

        <TouchableOpacity style={styles.cartIcon} onPress={goToCart}>
          <Ionicons name="cart-outline" size={28} color="#E31E24" />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Banner Publicitario Rotativo (3 Imágenes / Ofertas tipo PedidosYa) */}
      <View style={styles.bannerWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.bannerCard, { backgroundColor: currentBanner.bgGradient }]}
          onPress={() =>
            setActiveBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length)
          }
        >
          <View style={styles.bannerBadgeContainer}>
            <Text style={styles.bannerBadgeText}>{currentBanner.badge}</Text>
          </View>

          <View style={styles.bannerContentRow}>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>{currentBanner.title}</Text>
              <Text style={styles.bannerSubtitle}>{currentBanner.subtitle}</Text>
            </View>
            <Ionicons name={currentBanner.icon as any} size={48} color="#ffffff" style={{ opacity: 0.9 }} />
          </View>

          {/* Indicadores de Paginación del Carousel (3 Puntos) */}
          <View style={styles.dotsRow}>
            {PROMO_BANNERS.map((banner, idx) => (
              <TouchableOpacity
                key={banner.id}
                onPress={() => setActiveBannerIndex(idx)}
                style={[
                  styles.dot,
                  idx === activeBannerIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </TouchableOpacity>
      </View>

      {/* Lista de Productos */}
      <View style={styles.list}>
        {filteredProducts?.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{formatRD(item.price)}</Text>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => openQuantityModal(item)}
            >
              <Ionicons name="cart" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.addButtonText}>Elegir cantidad</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Modal de Selección de Cantidad que se Cierra al Tocar Fuera del Encuadre */}
      <Modal
        visible={selectedProductForQty !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedProductForQty(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedProductForQty(null)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setSelectedProductForQty(null)}
            >
              <Ionicons name="close-circle" size={24} color="#94A3B8" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Seleccionar Cantidad</Text>
            <Text style={styles.modalProductName}>
              {selectedProductForQty?.name}
            </Text>
            <Text style={styles.modalProductPrice}>
              {selectedProductForQty ? formatRD(selectedProductForQty.price) : ""} c/u
            </Text>

              {/* Título de opciones fijas */}
            <Text style={styles.optionsSectionTitle}>Cantidad / Toneladas:</Text>

            {/* Grid de opciones fijas disponibles */}
            <View style={styles.optionsGrid}>
              {QUANTITY_OPTIONS.map((opt) => {
                const isSelected = parseInt(quantity, 10) === opt.fundas;
                return (
                  <TouchableOpacity
                    key={opt.fundas}
                    style={[
                      styles.fixedOptionChip,
                      isSelected && styles.fixedOptionChipSelected,
                    ]}
                    onPress={() => setQuantity(String(opt.fundas))}
                  >
                    <Text
                      style={[
                        styles.fixedOptionText,
                        isSelected && styles.fixedOptionTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.subtotalText}>
              Subtotal:{" "}
              <Text style={{ color: "#E31E24", fontWeight: "bold" }}>
                {selectedProductForQty
                  ? formatRD(selectedProductForQty.price * (parseInt(quantity, 10) || 100))
                  : "RD$ 0.00"}
              </Text>
            </Text>

            <TouchableOpacity
              style={styles.confirmAddBtn}
              onPress={handleConfirmAddToCart}
            >
              <Ionicons name="cart-sharp" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.confirmAddBtnText}>Agregar al Carrito</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
    color: "#0F294A",
  },
  cartIcon: {
    marginLeft: 12,
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#E31E24",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cartBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },

  // Banner Carousel Publicitario (Versión Grande y Destacada)
  bannerWrapper: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  bannerCard: {
    borderRadius: 16,
    padding: 22,
    minHeight: 165,
    justifyContent: "space-between",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  bannerBadgeContainer: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 10,
  },
  bannerBadgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  bannerContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  bannerTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: 28,
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 14,
    lineHeight: 20,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#ffffff",
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderColor: "#eee",
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 140,
    alignSelf: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    color: "#0F294A",
  },
  price: {
    textAlign: "center",
    color: "#E31E24",
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: "#E31E24",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  // Modal de Selección de Cantidad
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 41, 74, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  closeModalBtn: {
    position: "absolute",
    top: 14,
    right: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 6,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    marginBottom: 2,
  },
  modalProductPrice: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  qtyControlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  qtyButton: {
    width: 60,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnStepText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F294A",
  },
  qtyInput: {
    width: 100,
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F294A",
    backgroundColor: "#FAF8F5",
  },
   optionsSectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F294A",
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    rowGap: 10,
    marginBottom: 18,
  },
  fixedOptionChip: {
    width: "48%",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  fixedOptionChipSelected: {
    backgroundColor: "#0F294A",
    borderColor: "#0F294A",
    shadowColor: "#0F294A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  fixedOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
  },
  fixedOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

    subtotalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 18,
  },
  confirmAddBtn: {
    backgroundColor: "#E31E24",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
  },
  confirmAddBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});