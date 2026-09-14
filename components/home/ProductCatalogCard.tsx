import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { formatRD } from "@/utils/currencyUtils";

export type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  unit: string;
};

type ProductCatalogCardProps = {
  product: Product;
  onSelectQuantity: (product: Product) => void;
};

export const ProductCatalogCard: React.FC<ProductCatalogCardProps> = ({
  product,
  onSelectQuantity,
}) => {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{formatRD(product.price)}</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => onSelectQuantity(product)}
      >
        <Ionicons name="cart" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.addButtonText}>Elegir cantidad</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProductCatalogCard;

const styles = StyleSheet.create({
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
    color: Palette.primaryDark,
  },
  price: {
    textAlign: "center",
    color: Palette.primary,
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: Palette.primary,
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
});
