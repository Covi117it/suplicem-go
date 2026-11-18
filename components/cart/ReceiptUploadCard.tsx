import React from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface ReceiptUploadCardProps {
  receiptImage: string | null;
  onPickReceipt: (useCamera: boolean) => void;
  onRemoveReceipt: () => void;
  bankReferenceNumber?: string;
  onChangeBankReferenceNumber?: (ref: string) => void;
}

export const ReceiptUploadCard: React.FC<ReceiptUploadCardProps> = ({
  receiptImage,
  onPickReceipt,
  onRemoveReceipt,
  bankReferenceNumber = "",
  onChangeBankReferenceNumber,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.subtext}>
        Adjunta una foto o captura de tu comprobante de pago para procesar tu orden.
      </Text>

      {receiptImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: receiptImage }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.removeButton} onPress={onRemoveReceipt}>
            <Ionicons name="trash-outline" size={16} color="#fff" />
            <Text style={styles.removeText}>Quitar comprobante</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.uploadOptionsRow}>
          <TouchableOpacity
            style={styles.uploadButtonHalf}
            onPress={() => onPickReceipt(false)}
          >
            <Ionicons name="images-outline" size={18} color={Palette.accent} />
            <Text style={styles.uploadButtonText}>Galería</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadButtonHalf}
            onPress={() => onPickReceipt(true)}
          >
            <Ionicons name="camera-outline" size={18} color={Palette.accent} />
            <Text style={styles.uploadButtonText}>Cámara</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ marginTop: 14 }}>
        <Text style={styles.label}>
          Número de Referencia / Comprobante *
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 102938475 o No. de Aprobación"
          placeholderTextColor={Palette.placeholder}
          value={bankReferenceNumber}
          onChangeText={onChangeBankReferenceNumber}
          autoCapitalize="characters"
        />
        <Text style={styles.helpText}>
          Ingresa el número de referencia oficial que emite tu banco en la transferencia.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  subtext: {
    fontSize: 12,
    color: Palette.textMuted,
    marginBottom: 10,
    lineHeight: 16,
  },
  uploadOptionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  uploadButtonHalf: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Palette.accent,
    borderStyle: "dashed",
    backgroundColor: Palette.background,
  },
  uploadButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: Palette.accent,
  },
  previewContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  imagePreview: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.danger,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  label: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "bold",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#FAF8F5",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 42,
    fontSize: 13,
    color: Palette.primaryDark,
  },
  helpText: {
    fontSize: 11,
    color: Palette.textMuted,
    marginTop: 4,
  },
});
