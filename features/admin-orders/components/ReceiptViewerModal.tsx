import React from "react";
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ReceiptViewerModalProps {
  visible: boolean;
  imageUrl?: string | null;
  onClose: () => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  visible,
  imageUrl,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.receiptViewerModalOverlay}>
        <TouchableOpacity
          style={styles.receiptViewerCloseButton}
          onPress={onClose}
        >
          <Ionicons name="close-circle" size={38} color="#ffffff" />
        </TouchableOpacity>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.receiptViewerFullImage}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  receiptViewerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  receiptViewerCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  receiptViewerFullImage: {
    width: "100%",
    height: "85%",
  },
});
