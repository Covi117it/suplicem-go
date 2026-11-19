import React from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { ProductCatalogCard } from "@/components/home/ProductCatalogCard";
import { ProductQuantityModal } from "@/components/home/ProductQuantityModal";
import { ProductSkeletonCard } from "@/components/home/ProductSkeletonCard";
import { PromoBannerCarousel } from "@/components/home/PromoBannerCarousel";
import { Palette } from "@/constants/theme";
import { useClientCatalog } from "../hooks/useClientCatalog";

const SKELETON_ITEMS = ["sk-1", "sk-2", "sk-3", "sk-4"];

export const ClientHomeScreen: React.FC = () => {
  const {
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
  } = useClientCatalog();

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
          value={searchInput}
          onChangeText={setSearchInput}
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
        data={loading ? (SKELETON_ITEMS as any) : products}
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
        ListHeaderComponent={renderHeader}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={46} color="#999" />
              <Text style={styles.emptyTitle}>No se encontraron productos</Text>
              <Text style={styles.emptySubtitle}>
                {searchInput
                  ? `No hay resultados para "${searchInput}". Intenta con otro término.`
                  : "No se encontraron productos disponibles."}
              </Text>
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProductsFromBackend(searchInput, true)}
            colors={[Palette.primary]}
            tintColor={Palette.primary}
          />
        }
      />

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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FAFAFA",
    fontSize: 16,
    marginRight: 10,
  },
  cartIcon: {
    position: "relative",
    padding: 6,
  },
  cartBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: Palette.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  itemWrapper: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F294A",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
});
