import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ContactButtons from "@/components/common/ContactButtons";

interface AdminTripDriverCardProps {
  driver: {
    names?: string;
    lastNames?: string;
    phone?: string;
    driverCode?: string;
  };
  title?: string;
  badge?: string;
}

export const AdminTripDriverCard: React.FC<AdminTripDriverCardProps> = ({
  driver,
  title = "Datos del conductor",
  badge,
}) => {
  return (
    <View style={[styles.container, badge ? styles.containerAlert : null]}>
      {Boolean(badge) && (
        <View style={styles.badgeBox}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Text style={[styles.sectionTitle, badge ? styles.titleAlert : null]}>
        {title}
      </Text>
      <Text style={styles.value}>
        👤 {driver.names} {driver.lastNames} {driver.driverCode ? `[${driver.driverCode}]` : ""}
      </Text>
      <Text style={styles.value}>📞 {driver.phone || "Sin teléfono"}</Text>

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
  containerAlert: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  badgeBox: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F87171",
  },
  badgeText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 6,
  },
  titleAlert: {
    color: "#991B1B",
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
