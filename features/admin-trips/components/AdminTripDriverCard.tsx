import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ContactButtons from "@/components/common/ContactButtons";

interface AdminTripDriverCardProps {
  driver: {
    names?: string;
    lastNames?: string;
    phone?: string;
  };
}

export const AdminTripDriverCard: React.FC<AdminTripDriverCardProps> = ({ driver }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Datos del conductor</Text>
      <Text style={styles.value}>
        👤 {driver.names} {driver.lastNames}
      </Text>
      <Text style={styles.value}>📞 {driver.phone}</Text>

      <ContactButtons
        phone={driver.phone}
        callLabel="Llamar al conductor"
        whatsappLabel="Chat en WhatsApp"
        layout="column"
        style={styles.contactButtons}
      />
    </View>
  );
};

export default AdminTripDriverCard;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 6,
  },
  value: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 3,
  },
  contactButtons: {
    marginTop: 10,
  },
});
