import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RegisterIdUploadCardProps {
  identificationImage: string | null;
  onPickImage: (useCamera: boolean) => void;
  onRemoveImage: () => void;
}

export const RegisterIdUploadCard: React.FC<RegisterIdUploadCardProps> = ({
  identificationImage,
  onPickImage,
  onRemoveImage,
}) => {
  return (
    <View style={styles.idUploadCard}>
      <Text style={styles.idUploadTitle}>🪪 Foto de Cédula / Identificación</Text>
      <Text style={styles.idUploadSubtext}>
        Adjunta una foto clara del documento. El Administrador revisará la imagen para activar tu cuenta.
      </Text>

      {identificationImage ? (
        <View style={styles.idPreviewContainer}>
          <Image source={{ uri: identificationImage }} style={styles.idImagePreview} />
          <TouchableOpacity style={styles.removeIdButton} onPress={onRemoveImage}>
            <Ionicons name="trash-outline" size={16} color="#fff" />
            <Text style={styles.removeIdText}>Cambiar foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.uploadOptionsRow}>
          <TouchableOpacity
            style={styles.uploadIdButtonHalf}
            onPress={() => onPickImage(false)}
          >
            <Ionicons name="images-outline" size={18} color="#0F294A" />
            <Text style={styles.uploadIdButtonText}>Galería</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadIdButtonHalf}
            onPress={() => onPickImage(true)}
          >
            <Ionicons name="camera-outline" size={18} color="#0F294A" />
            <Text style={styles.uploadIdButtonText}>Cámara</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  idUploadCard: {
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    marginTop: 4,
  },
  idUploadTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F294A",
    marginBottom: 4,
  },
  idUploadSubtext: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 12,
  },
  uploadOptionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  uploadIdButtonHalf: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#0F294A",
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 10,
    gap: 6,
  },
  uploadIdButtonText: {
    color: "#0F294A",
    fontWeight: "700",
    fontSize: 13,
  },
  idPreviewContainer: {
    alignItems: "center",
    gap: 8,
  },
  idImagePreview: {
    width: "100%",
    height: 140,
    borderRadius: 6,
    resizeMode: "cover",
  },
  removeIdButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeIdText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
