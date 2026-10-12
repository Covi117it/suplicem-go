import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface ContactButtonsProps {
  phone?: string | null;
  callLabel?: string;
  whatsappLabel?: string;
  layout?: "row" | "column";
  style?: ViewStyle;
}

const formatWhatsAppPhone = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length === 10) {
    return `1${digitsOnly}`;
  }
  return digitsOnly;
};

export const ContactButtons: React.FC<ContactButtonsProps> = ({
  phone,
  callLabel = "Llamar",
  whatsappLabel = "Chat en WhatsApp",
  layout = "column",
  style,
}) => {
  if (!phone) return null;

  const handleCall = () => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = () => {
    const formatted = formatWhatsAppPhone(phone);
    Linking.openURL(`whatsapp://send?phone=${formatted}`);
  };

  const isRow = layout === "row";

  return (
    <View style={[isRow ? styles.rowContainer : styles.columnContainer, style]}>
      <TouchableOpacity
        style={[styles.button, styles.callButton, isRow && styles.flexButton]}
        onPress={handleCall}
        activeOpacity={0.8}
      >
        <Ionicons name="call" size={16} color="#ffffff" style={styles.icon} />
        <Text style={styles.buttonText}>{callLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.whatsappButton, isRow && styles.flexButton]}
        onPress={handleWhatsApp}
        activeOpacity={0.8}
      >
        <Ionicons name="logo-whatsapp" size={16} color="#ffffff" style={styles.icon} />
        <Text style={styles.buttonText}>{whatsappLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactButtons;

const styles = StyleSheet.create({
  columnContainer: {
    gap: 8,
    marginVertical: 6,
  },
  rowContainer: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 6,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  flexButton: {
    flex: 1,
  },
  callButton: {
    backgroundColor: "#2563EB",
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  icon: {
    marginRight: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
