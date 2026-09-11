import AddressPicker from "@/components/AddressPicker";
import CustomPickerModal from "@/components/CustomPickerModal";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { useAlert } from "@/context/alertContext";
import { AuthContext } from "@/context/authContext";
import { CartContext } from "@/context/cartContext";
import { useLoading } from "@/context/loadingContext";
import { createOrder } from "@/services/orderService";
import { formatRD } from "@/utils/currencyUtils";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Address } from "@/types/users";

type Delivery = {
  address: Address;
  products: { id: string; fundas: number }[];
};

const TON_OPTIONS = [
  { fundas: 100, toneladas: 4.25 },
  { fundas: 200, toneladas: 8.5 },
  { fundas: 300, toneladas: 12.75 },
  { fundas: 400, toneladas: 17 },
  { fundas: 500, toneladas: 20.25 },
  { fundas: 600, toneladas: 25.5 },
  { fundas: 1000, toneladas: 42.5 },
];

const DELIVERY_OPTIONS = [
  { label: "Almacén", value: "almacen" },
  { label: "Domicilio", value: "domicilio" },
];

// Opciones de Bancos Múltiples con RNC, Tipo de Cuenta y Moneda
const BANK_ACCOUNTS = [
  {
    id: "banreservas",
    bankName: "Banreservas",
    accountNumber: "960-123456-7",
    accountType: "Cuenta Corriente",
    rnc: "131-45678-9",
    currency: "DOP (Pesos Dominicanos)",
    holder: "SUPLICEM S.R.L.",
  },
  {
    id: "bhd",
    bankName: "Banco BHD",
    accountNumber: "240-987654-3",
    accountType: "Cuenta Corriente",
    rnc: "131-45678-9",
    currency: "DOP (Pesos Dominicanos)",
    holder: "SUPLICEM S.R.L.",
  },
  {
    id: "popular",
    bankName: "Banco Popular",
    accountNumber: "780-451239-1",
    accountType: "Cuenta Corriente",
    rnc: "131-45678-9",
    currency: "DOP (Pesos Dominicanos)",
    holder: "SUPLICEM S.R.L.",
  },
  {
    id: "santacruz",
    bankName: "Banco Santa Cruz",
    accountNumber: "550-882314-9",
    accountType: "Cuenta de Ahorros",
    rnc: "131-45678-9",
    currency: "DOP (Pesos Dominicanos)",
    holder: "SUPLICEM S.R.L.",
  },
];

const CartScreen: React.FC = () => {
  const {
    cart,
    clearCart,
    removeFromCart,
    updateProductInCart,
    deliveryType,
    updateDeliveryType,
  } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { show, hide } = useLoading();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [reference, setReference] = useState("");

  // Opciones de pago (Transferencia / Crédito)
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "credit">(
    "transfer",
  );
  const [selectedBankId, setSelectedBankId] = useState("banreservas");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [creditNote, setCreditNote] = useState<string>("");

  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState("");

  useFocusEffect(
    useCallback(() => {
      setDeliveries([]);
      setSelectedDeliveryAddress("");
      setReference("");
      setPaymentMethod("transfer");
      setSelectedBankId("banreservas");
      setReceiptImage(null);
      setCreditNote("");
    }, []),
  );

  const selectedBank =
    BANK_ACCOUNTS.find((b) => b.id === selectedBankId) || BANK_ACCOUNTS[0];

  const handleSelectDeliveryAddress = (addressDesc: string) => {
    setSelectedDeliveryAddress(addressDesc);
    if (!addressDesc) {
      setDeliveries([]);
      return;
    }
    const fullAddress = user?.addresses?.find(
      (addr) => addr?.description === addressDesc,
    );
    if (!fullAddress) {
      setDeliveries([]);
      return;
    }

    const allProducts = Object.values(groupedCart).map((item) => ({
      id: item.id,
      fundas: item.fundas || 1000,
    }));

    setDeliveries([
      {
        address: fullAddress,
        products: allProducts,
      },
    ]);
  };

  const addressOptions =
    user?.addresses?.map((addr) => ({
      label: `${addr?.description}${addr?.additionalInfo ? ", " + addr.additionalInfo : ""}`,
      value: addr?.description,
    })) || [];

  const groupedCart = cart.reduce<Record<string, any>>((acc, product) => {
    const key = product.id;
    if (acc[key]) {
      acc[key].quantity += 1;
    } else {
      acc[key] = {
        ...product,
        basePrice: product.price,
        quantity: 1,
      };
    }
    return acc;
  }, {});

  const total = Object.values(groupedCart).reduce((sum, item) => {
    const fundas = item.fundas || 1;
    return sum + fundas * item.basePrice * item.quantity;
  }, 0);

  const handlePickReceipt = async (useCamera = false) => {
    try {
      const perm = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!perm.granted) {
        showAlert({
          message:
            "Se requiere permiso para acceder a la " +
            (useCamera ? "cámara" : "galería de fotos"),
          type: "warning",
        });
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            quality: 0.5,
            base64: true,
            allowsEditing: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
            base64: true,
            allowsEditing: true,
          });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const imageString = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setReceiptImage(imageString);
        showAlert({
          message: "¡Foto del comprobante adjuntada correctamente!",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      showAlert({
        message: "No se pudo seleccionar la imagen",
        type: "error",
      });
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptImage(null);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showAlert({
        message: "Agrega productos antes de confirmar.",
        type: "warning",
      });
      return;
    }
    if (deliveryType === "domicilio" && deliveries.length === 0) {
      showAlert({
        message: "Debes asignar al menos una entrega",
        type: "error",
      });
      return;
    }

    show();

    const formattedDeliveries = deliveries.flatMap((d) =>
      d.products.map((p) => ({
        productId: p.id,
        address: d.address,
        quantity: p.fundas,
        unit: "fundas",
      })),
    );

    const formattedItems = Object.values(groupedCart).map((item) => {
      const quantity = item.quantity;
      const unitPrice = item.basePrice;
      const fundas = item.fundas || 1;
      const subtotal = fundas * unitPrice * quantity;
      return {
        productId: item.id,
        name: item.name,
        unit: "fundas",
        quantity: fundas,
        unitPrice,
        subtotal,
      };
    });

    // Formatear observaciones incluyendo el banco seleccionado, RNC y tipo de transferencia
    let finalComments = "";
    if (paymentMethod === "transfer") {
      finalComments = `Transferencia Bancaria a ${selectedBank.bankName} (No. ${selectedBank.accountNumber}, RNC: ${selectedBank.rnc})`;
      if (receiptImage) finalComments += " - Comprobante adjunto";
    } else {
      finalComments =
        "Pago a Crédito" + (creditNote ? ` - Nota: ${creditNote}` : "");
    }
    if (reference) {
      finalComments += `. Observación: ${reference}`;
    }

    const dataToSend: any = {
      deliveryType,
      deliveries: formattedDeliveries,
      items: formattedItems,
      comments: finalComments.trim(),
    };

    if (receiptImage) {
      dataToSend.receiptImage = receiptImage;
    }

    try {
      const response = await createOrder(dataToSend);
      hide();

      showAlert({
        message: `Tu pedido fue enviado exitosamente.\n Número de Orden: ${ORDER_PREFIX.ORD}${response.orderNumber}`,
        type: "success",
      });

      clearCart();
      router.back();
    } catch (error: any) {
      console.error("Error enviando pedido:", error);
      hide();

      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo enviar el pedido. Intenta nuevamente.";

      showAlert({
        message: errMsg,
        type: "error",
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 250 }}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>Mi Carrito</Text>
            {cart.length > 0 && (
              <TouchableOpacity style={styles.clearAllBtn} onPress={clearCart}>
                <Ionicons name="trash-bin-outline" size={16} color="#E31E24" />
                <Text style={styles.clearAllBtnText}>Vaciar Carrito</Text>
              </TouchableOpacity>
            )}
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                No hay productos en tu carrito.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {Object.values(groupedCart).map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.itemCardHeader}>
                    <Text style={styles.name}>{item.name}</Text>
                    {/* Botón de Borrar Artículo Específico */}
                    <TouchableOpacity
                      style={styles.deleteItemBtn}
                      onPress={() => removeFromCart(item.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#E31E24"
                      />
                      <Text style={styles.deleteItemBtnText}>Borrar</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.details}>
                    Precio por unidad: {formatRD(item.basePrice)}
                  </Text>

                  <Text style={styles.label}>Cantidad / Toneladas:</Text>
                  <View style={styles.tonContainer}>
                    {TON_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.fundas}
                        onPress={() =>
                          updateProductInCart(item.id, {
                            fundas: option.fundas,
                          })
                        }
                        style={[
                          styles.tonButton,
                          item.fundas === option.fundas &&
                            styles.tonButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tonButtonText,
                            item.fundas === option.fundas && { color: "#fff" },
                          ]}
                        >
                          {option.toneladas} t ({option.fundas} fundas)
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.subtotalItemText}>
                    Subtotal del producto:{" "}
                    <Text style={{ fontWeight: "bold", color: "#E31E24" }}>
                      {formatRD(
                        (item.fundas || 1) * item.basePrice * item.quantity,
                      )}
                    </Text>
                  </Text>
                </View>
              ))}
            </View>
          )}

          {cart.length > 0 && (
            <View style={styles.footer}>
              <CustomPickerModal
                label="Tipo de entrega"
                selectedValue={deliveryType}
                onValueChange={updateDeliveryType}
                options={DELIVERY_OPTIONS}
              />

              {deliveryType === "domicilio" && (
                <View style={{ marginTop: 14 }}>
                  <CustomPickerModal
                    label="Dirección de entrega"
                    selectedValue={selectedDeliveryAddress}
                    onValueChange={handleSelectDeliveryAddress}
                    options={[
                      { label: "Seleccionar dirección registrada", value: "" },
                      ...addressOptions,
                    ]}
                  />

                  <Text style={[styles.label, { marginTop: 10 }]}>
                    O buscar/ingresar nueva dirección para este pedido:
                  </Text>
                  <AddressPicker
                    onPlaceSelected={(place) => {
                      if (place?.description) {
                        setDeliveries([
                          {
                            address: {
                              placeId: place.placeId || `custom-${Date.now()}`,
                              description: place.description,
                              latitude: place.latitude,
                              longitude: place.longitude,
                              additionalInfo: "",
                            },
                            products: [],
                          },
                        ]);
                        setSelectedDeliveryAddress(place.description);
                      }
                    }}
                  />

                  {deliveries.length > 0 && (
                    <View style={styles.deliveriesContainer}>
                      <Text style={styles.deliveriesTitle}>
                        📍 Dirección asignada para el despacho:
                      </Text>
                      {deliveries.map((delivery, idx) => (
                        <View key={idx} style={styles.deliveryCard}>
                          <Text style={styles.deliveryAddress}>
                            {delivery.address.description}
                            {delivery.address.additionalInfo
                              ? `, ${delivery.address.additionalInfo}`
                              : ""}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Opción de Método de Pago */}
              <Text style={styles.label}>Opción de Pago</Text>
              <View style={styles.paymentSelectorContainer}>
                <TouchableOpacity
                  style={[
                    styles.paymentOptionTab,
                    paymentMethod === "transfer" &&
                      styles.paymentOptionTabActive,
                  ]}
                  onPress={() => setPaymentMethod("transfer")}
                >
                  <Ionicons
                    name="card-outline"
                    size={18}
                    color={paymentMethod === "transfer" ? "#fff" : "#A04A0E"}
                  />
                  <Text
                    style={[
                      styles.paymentOptionText,
                      paymentMethod === "transfer" &&
                        styles.paymentOptionTextActive,
                    ]}
                  >
                    Transferencia / Comprobante
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentOptionTab,
                    paymentMethod === "credit" && styles.paymentOptionTabActive,
                  ]}
                  onPress={() => setPaymentMethod("credit")}
                >
                  <Ionicons
                    name="hand-left-outline"
                    size={18}
                    color={paymentMethod === "credit" ? "#fff" : "#A04A0E"}
                  />
                  <Text
                    style={[
                      styles.paymentOptionText,
                      paymentMethod === "credit" &&
                        styles.paymentOptionTextActive,
                    ]}
                  >
                    Pago a Crédito
                  </Text>
                </TouchableOpacity>
              </View>

              {paymentMethod === "transfer" ? (
                <View style={styles.paymentDetailCard}>
                  <Text style={styles.paymentDetailTitle}>
                    Datos para Transferencia Bancaria
                  </Text>

                  {/* Selector Dinámico de Bancos */}
                  <Text style={styles.bankSelectorLabel}>
                    Selecciona el Banco de Destino:
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 12 }}
                  >
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {BANK_ACCOUNTS.map((bank) => (
                        <TouchableOpacity
                          key={bank.id}
                          style={[
                            styles.bankTab,
                            selectedBankId === bank.id && styles.bankTabActive,
                          ]}
                          onPress={() => setSelectedBankId(bank.id)}
                        >
                          <Text
                            style={[
                              styles.bankTabText,
                              selectedBankId === bank.id &&
                                styles.bankTabTextActive,
                            ]}
                          >
                            {bank.bankName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  {/* Detalle del Banco Seleccionado con RNC, Cuenta y Moneda */}
                  <View style={styles.bankInfoBox}>
                    <Text style={styles.paymentDetailText}>
                      Banco:{" "}
                      <Text style={{ fontWeight: "bold", color: "#0F294A" }}>
                        {selectedBank.bankName}
                      </Text>
                    </Text>
                    <Text style={styles.paymentDetailText}>
                      No. de Cuenta:{" "}
                      <Text style={{ fontWeight: "bold", color: "#E31E24" }}>
                        {selectedBank.accountNumber}
                      </Text>
                    </Text>
                    <Text style={styles.paymentDetailText}>
                      Tipo de Cuenta:{" "}
                      <Text style={{ fontWeight: "bold" }}>
                        {selectedBank.accountType}
                      </Text>
                    </Text>
                    <Text style={styles.paymentDetailText}>
                      RNC:{" "}
                      <Text style={{ fontWeight: "bold" }}>
                        {selectedBank.rnc}
                      </Text>
                    </Text>
                    <Text style={styles.paymentDetailText}>
                      Moneda:{" "}
                      <Text style={{ fontWeight: "bold" }}>
                        {selectedBank.currency}
                      </Text>
                    </Text>
                    <Text style={styles.paymentDetailText}>
                      Titular:{" "}
                      <Text style={{ fontWeight: "bold" }}>
                        {selectedBank.holder}
                      </Text>
                    </Text>
                  </View>

                  <Text style={styles.paymentDetailSubtext}>
                    Adjunta una foto o captura de tu comprobante de pago para
                    procesar tu orden.
                  </Text>

                  {receiptImage ? (
                    <View style={styles.receiptPreviewContainer}>
                      <Image
                        source={{ uri: receiptImage }}
                        style={styles.receiptImagePreview}
                      />
                      <TouchableOpacity
                        style={styles.removeReceiptButton}
                        onPress={handleRemoveReceipt}
                      >
                        <Ionicons name="trash-outline" size={16} color="#fff" />
                        <Text style={styles.removeReceiptText}>
                          Quitar comprobante
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.uploadOptionsRow}>
                      <TouchableOpacity
                        style={styles.uploadReceiptButtonHalf}
                        onPress={() => handlePickReceipt(false)}
                      >
                        <Ionicons
                          name="images-outline"
                          size={18}
                          color="#A04A0E"
                        />
                        <Text style={styles.uploadReceiptButtonText}>
                          Galería
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.uploadReceiptButtonHalf}
                        onPress={() => handlePickReceipt(true)}
                      >
                        <Ionicons
                          name="camera-outline"
                          size={18}
                          color="#A04A0E"
                        />
                        <Text style={styles.uploadReceiptButtonText}>
                          Cámara
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.paymentDetailCardCredit}>
                  <Text style={styles.paymentDetailTitleCredit}>
                    🤝 Solicitud de Pago a Crédito
                  </Text>
                  <Text style={styles.paymentDetailSubtext}>
                    Tu pedido se registrará en tu cuenta corriente según los
                    acuerdos de crédito autorizados.
                  </Text>
                  <TextInput
                    style={styles.creditNoteInput}
                    placeholder="Observación (Ej: Pago el próximo viernes o quincena)"
                    placeholderTextColor="#999"
                    value={creditNote}
                    onChangeText={setCreditNote}
                  />
                </View>
              )}

              <Text style={styles.totalText}>
                Total del Pedido: {formatRD(total.toFixed(2))}
              </Text>
              <Text style={styles.label}>Comentarios adicionales</Text>
              <TextInput
                style={styles.input}
                value={reference}
                onChangeText={setReference}
                placeholderTextColor="#999"
                placeholder="Ej. Por favor entregar por la mañana"
              />
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutButtonText}>Realizar pedido</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8f3",
    paddingHorizontal: 16,
    paddingTop: 5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 35,
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#0F294A" },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearAllBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#E31E24",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  list: { paddingBottom: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: { fontSize: 16, fontWeight: "bold", color: "#0F294A", flex: 1 },
  deleteItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  deleteItemBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#E31E24",
  },
  details: { marginTop: 2, fontSize: 13, color: "#64748B" },
  subtotalItemText: { marginTop: 10, fontSize: 14, color: "#334155" },
  tonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  tonButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#A04A0E",
    marginRight: 4,
    marginBottom: 4,
  },
  tonButtonActive: { backgroundColor: "#A04A0E" },
  tonButtonText: { fontSize: 12, color: "#A04A0E", fontWeight: "500" },
  footer: { marginTop: 10, paddingVertical: 14, backgroundColor: "#fff8f3" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: "#0F294A",
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    marginTop: 4,
    color: "#0F294A",
  },
  checkoutButton: {
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  checkoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
    color: "#0F294A",
  },
  deliveriesContainer: {
    marginTop: 14,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  deliveriesTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 8,
    color: "#0F294A",
  },
  deliveryCard: {
    marginBottom: 8,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
  },
  deliveryAddress: { fontWeight: "600", fontSize: 13, color: "#334155" },

  // Selector e Información de Pago
  paymentSelectorContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    marginBottom: 10,
  },
  paymentOptionTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#A04A0E",
    backgroundColor: "#fff",
  },
  paymentOptionTabActive: {
    backgroundColor: "#A04A0E",
  },
  paymentOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#A04A0E",
  },
  paymentOptionTextActive: {
    color: "#fff",
  },

  // Tarjeta Bancaria con Múltiples Bancos, RNC y Moneda
  paymentDetailCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 10,
    elevation: 2,
  },
  paymentDetailTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#0F294A",
    marginBottom: 10,
  },
  bankSelectorLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
  },
  bankTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  bankTabActive: {
    backgroundColor: "#0F294A",
    borderColor: "#0F294A",
  },
  bankTabText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#475569",
  },
  bankTabTextActive: {
    color: "#ffffff",
  },
  bankInfoBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  paymentDetailText: {
    fontSize: 13,
    color: "#334155",
    marginBottom: 4,
  },
  paymentDetailSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 10,
    lineHeight: 16,
  },

  paymentDetailCardCredit: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 10,
  },
  paymentDetailTitleCredit: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#A04A0E",
    marginBottom: 6,
  },
  creditNoteInput: {
    backgroundColor: "#FAF8F5",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 42,
    fontSize: 13,
    color: "#0F294A",
  },

  uploadOptionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  uploadReceiptButtonHalf: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#A04A0E",
    borderStyle: "dashed",
    backgroundColor: "#fff8f3",
  },
  uploadReceiptButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#A04A0E",
  },
  receiptPreviewContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  receiptImagePreview: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeReceiptButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E31E24",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeReceiptText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
