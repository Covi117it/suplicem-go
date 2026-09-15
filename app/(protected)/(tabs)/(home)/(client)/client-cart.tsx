import { ORDER_PREFIX } from "@/constants/UserConstants";
import { BANK_ACCOUNTS } from "@/constants/cartConstants";
import { Palette } from "@/constants/theme";
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

import CartDeliverySection, { DeliveryItem } from "@/components/cart/CartDeliverySection";
import CartItemCard from "@/components/cart/CartItemCard";
import CartPaymentSection from "@/components/cart/CartPaymentSection";

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

  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [reference, setReference] = useState("");

  // Opciones de pago (Transferencia / Crédito)
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "credit">("transfer");
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
    }, [])
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
      (addr) => addr?.description === addressDesc
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

    const formattedDeliveries =
      deliveryType === "domicilio"
        ? deliveries.flatMap((d) =>
            d.products.map((p) => ({
              productId: p.id,
              address: d.address,
              quantity: p.fundas,
              unit: "fundas",
            }))
          )
        : [];

    const formattedItems = Object.values(groupedCart).map((item) => ({
      productId: item.id,
      quantity: item.fundas || 1,
      name: item.name,
      unitPrice: item.basePrice,
    }));

    let finalComments = "";
    if (paymentMethod === "transfer") {
      finalComments = `Transferencia Bancaria a ${selectedBank.bankName} (No. ${selectedBank.accountNumber}, RNC: ${selectedBank.rnc})`;
      if (receiptImage) finalComments += " - Comprobante adjunto";
    } else {
      finalComments = "Pago a Crédito" + (creditNote ? ` - Nota: ${creditNote}` : "");
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
                <Ionicons name="trash-bin-outline" size={16} color={Palette.danger} />
                <Text style={styles.clearAllBtnText}>Vaciar Carrito</Text>
              </TouchableOpacity>
            )}
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>No hay productos en tu carrito.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {Object.values(groupedCart).map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onUpdateFundas={(fundas) =>
                    updateProductInCart(item.id, { fundas })
                  }
                  onRemove={() => removeFromCart(item.id)}
                />
              ))}
            </View>
          )}

          {cart.length > 0 && (
            <View style={styles.footer}>
              <CartDeliverySection
                deliveryType={deliveryType}
                onUpdateDeliveryType={updateDeliveryType}
                selectedDeliveryAddress={selectedDeliveryAddress}
                onSelectDeliveryAddress={handleSelectDeliveryAddress}
                addressOptions={addressOptions}
                deliveries={deliveries}
                onCustomPlaceSelected={(place) => {
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

              <CartPaymentSection
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                selectedBankId={selectedBankId}
                onSelectBankId={setSelectedBankId}
                selectedBank={selectedBank}
                receiptImage={receiptImage}
                onPickReceipt={handlePickReceipt}
                onRemoveReceipt={handleRemoveReceipt}
                creditNote={creditNote}
                onChangeCreditNote={setCreditNote}
              />

              <Text style={styles.totalText}>
                Total del Pedido: {formatRD(total.toFixed(2))}
              </Text>
              <Text style={styles.label}>Comentarios adicionales</Text>
              <TextInput
                style={styles.input}
                value={reference}
                onChangeText={setReference}
                placeholderTextColor={Palette.placeholder}
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
    backgroundColor: Palette.background,
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Palette.primaryDark,
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.dangerBg,
    borderWidth: 1,
    borderColor: Palette.dangerBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearAllBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Palette.danger,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: Palette.textMuted,
    textAlign: "center",
  },
  list: {
    paddingBottom: 10,
  },
  footer: {
    marginTop: 10,
    paddingVertical: 14,
    backgroundColor: Palette.background,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: Palette.primaryDark,
  },
  input: {
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    marginTop: 4,
    color: Palette.primaryDark,
  },
  checkoutButton: {
    backgroundColor: Palette.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
    color: Palette.primaryDark,
  },
});
