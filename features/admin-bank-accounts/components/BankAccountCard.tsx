import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BankAccount } from "@/services/configService";
import { ACCOUNT_TYPE_LABELS } from "../types";

interface BankAccountCardProps {
  account: BankAccount;
  onEdit: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
}

export const BankAccountCard: React.FC<BankAccountCardProps> = ({
  account,
  onEdit,
  onDelete,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.bankIconContainer}>
          <Ionicons name="business-outline" size={22} color="#0F294A" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardBankName}>{account.bankName}</Text>
          <Text style={styles.cardHolder}>{account.accountHolder}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            account.isActive ? styles.statusActive : styles.statusInactive,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              account.isActive ? styles.statusTextActive : styles.statusTextInactive,
            ]}
          >
            {account.isActive ? "Activa" : "Inactiva"}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={15} color="#64748B" />
          <Text style={styles.infoLabel}>Número:</Text>
          <Text style={styles.infoValue}>{account.accountNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="swap-horizontal-outline" size={15} color="#64748B" />
          <Text style={styles.infoLabel}>Tipo:</Text>
          <Text style={styles.infoValue}>
            {ACCOUNT_TYPE_LABELS[account.accountType] ?? account.accountType}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={15} color="#64748B" />
          <Text style={styles.infoLabel}>Moneda:</Text>
          <Text style={styles.infoValue}>{account.currency}</Text>
        </View>
        {account.swiftCode ? (
          <View style={styles.infoRow}>
            <Ionicons name="globe-outline" size={15} color="#64748B" />
            <Text style={styles.infoLabel}>SWIFT:</Text>
            <Text style={styles.infoValue}>{account.swiftCode}</Text>
          </View>
        ) : null}
        {account.routingNumber ? (
          <View style={styles.infoRow}>
            <Ionicons name="git-branch-outline" size={15} color="#64748B" />
            <Text style={styles.infoLabel}>Routing:</Text>
            <Text style={styles.infoValue}>{account.routingNumber}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(account)}>
          <Ionicons name="create-outline" size={17} color="#0F294A" />
          <Text style={styles.editBtnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(account)}>
          <Ionicons name="trash-outline" size={17} color="#E31E24" />
          <Text style={styles.deleteBtnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 10,
  },
  bankIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBankName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F294A",
  },
  cardHolder: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "#DCFCE7",
  },
  statusInactive: {
    backgroundColor: "#F1F5F9",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTextActive: {
    color: "#16A34A",
  },
  statusTextInactive: {
    color: "#94A3B8",
  },
  cardBody: {
    padding: 14,
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    minWidth: 70,
  },
  infoValue: {
    fontSize: 13,
    color: "#1E293B",
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#0F294A",
    borderRadius: 8,
    paddingVertical: 9,
    backgroundColor: "#F8FAFC",
  },
  editBtnText: {
    color: "#0F294A",
    fontWeight: "700",
    fontSize: 14,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    paddingVertical: 9,
    backgroundColor: "#FEF2F2",
  },
  deleteBtnText: {
    color: "#E31E24",
    fontWeight: "700",
    fontSize: 14,
  },
});
