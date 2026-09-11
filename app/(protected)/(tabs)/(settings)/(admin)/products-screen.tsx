import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import {
  deleteProduct,
  getProducts,
  updateProduct,
} from "@/services/productService";
import { formatRD } from "@/utils/currencyUtils";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  createdAt?: string;
};

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const router = useRouter();

  // Estado para el modal de edición
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    unit: "",
    imageUrl: "",
  });

  const fetchProductList = async () => {
    try {
      show();
      const productsResponse = await getProducts();
      setProducts(productsResponse?.products || []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      showAlert({
        message: "No se pudieron obtener los productos.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProductList();
    }, [])
  );

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      price: product.price ? String(product.price) : "",
      unit: product.unit || "fundas",
      imageUrl: product.imageUrl || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    if (!editForm.name.trim() || !editForm.price || Number(editForm.price) <= 0) {
      showAlert({
        message: "Por favor ingresa un nombre y precio válidos.",
        type: "warning",
      });
      return;
    }

    try {
      show();
      await updateProduct(editingProduct.id, {
        name: editForm.name.trim(),
        price: Number(editForm.price),
        unit: editForm.unit.trim() || "fundas",
        imageUrl: editForm.imageUrl.trim(),
      });

      showAlert({
        message: "¡Producto actualizado correctamente!",
        type: "success",
      });

      setEditingProduct(null);
      await fetchProductList();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      showAlert({
        message: "Ocurrió un error al actualizar el producto.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      "Eliminar Producto",
      `¿Estás seguro de que deseas eliminar permanentemente el producto "${product.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              show();
              await deleteProduct(product.id);
              showAlert({
                message: `El producto "${product.name}" fue eliminado.`,
                type: "success",
              });
              await fetchProductList();
            } catch (error) {
              console.error("Error al eliminar producto:", error);
              showAlert({
                message: "No se pudo eliminar el producto.",
                type: "error",
              });
            } finally {
              hide();
            }
          },
        },
      ]
    );
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.price.toString().includes(search)
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Gestión de productos</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/create-product")}
          >
            <Ionicons name="add-circle" size={24} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.addButtonText}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o precio..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="cube-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyStateText}>
              {search ? "No se encontraron productos coincidentes." : "No hay productos registrados."}
            </Text>
          </View>
        ) : (
          filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              {product.imageUrl ? (
                <Image
                  source={{ uri: product.imageUrl }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.productImagePlaceholder}>
                  <Ionicons name="cube-sharp" size={40} color="#94A3B8" />
                </View>
              )}

              <View style={styles.productContent}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPriceText}>
                  Precio: <Text style={styles.productPriceHighlight}>{formatRD(product.price)}</Text> / {product.unit || "unidad"}
                </Text>
              </View>

              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleOpenEdit(product)}
                >
                  <Ionicons name="create-outline" size={18} color="#0F294A" />
                  <Text style={styles.editBtnText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteProduct(product)}
                >
                  <Ionicons name="trash-outline" size={18} color="#E31E24" />
                  <Text style={styles.deleteBtnText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal para Editar Producto */}
      <Modal
        visible={editingProduct !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingProduct(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Producto</Text>
              <TouchableOpacity onPress={() => setEditingProduct(null)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nombre del Producto</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nombre del producto"
                placeholderTextColor="#999"
                value={editForm.name}
                onChangeText={(text) => setEditForm((prev) => ({ ...prev, name: text }))}
              />

              <Text style={styles.inputLabel}>Precio (RD$)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Precio ej. 450"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={editForm.price}
                onChangeText={(text) => setEditForm((prev) => ({ ...prev, price: text }))}
              />

              <Text style={styles.inputLabel}>Unidad de Medida</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej. fundas, m3, quintal"
                placeholderTextColor="#999"
                value={editForm.unit}
                onChangeText={(text) => setEditForm((prev) => ({ ...prev, unit: text }))}
              />

              <Text style={styles.inputLabel}>URL de la Imagen</Text>
              <TextInput
                style={styles.formInput}
                placeholder="https://ejemplo.com/imagen.jpg"
                placeholderTextColor="#999"
                value={editForm.imageUrl}
                onChangeText={(text) => setEditForm((prev) => ({ ...prev, imageUrl: text }))}
              />

              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setEditingProduct(null)}
                >
                  <Text style={styles.cancelModalBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveModalBtn}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.saveModalBtnText}>Guardar Cambios</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default ProductsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#ffffff",
    flexGrow: 1,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F294A",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E31E24",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    elevation: 2,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
    fontSize: 15,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 140,
    marginBottom: 10,
    alignSelf: "center",
  },
  productImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  productContent: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 4,
  },
  productPriceText: {
    fontSize: 14,
    color: "#64748B",
  },
  productPriceHighlight: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E31E24",
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#0F294A",
    borderRadius: 8,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: "#F8FAFC",
  },
  editBtnText: {
    color: "#0F294A",
    fontWeight: "bold",
    fontSize: 14,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: "#FEF2F2",
  },
  deleteBtnText: {
    color: "#E31E24",
    fontWeight: "bold",
    fontSize: 14,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
    marginTop: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#F8FAFC",
    marginBottom: 10,
    color: "#1E293B",
  },
  modalActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  cancelModalBtnText: {
    color: "#64748B",
    fontWeight: "bold",
    fontSize: 14,
  },
  saveModalBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#E31E24",
  },
  saveModalBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
