import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BankAccount } from "@/constants/cartConstants";
import { Palette } from "@/constants/theme";
import { TransferPaymentCard } from "./TransferPaymentCard";
import { CreditPaymentCard } from "./CreditPaymentCard";

export type CartPaymentSectionProps = {
  paymentMethod: "transfer" | "credit";
  onPaymentMethodChange: (method: "transfer" | "credit") => void;
  selectedBankId: string;
  onSelectBankId: (id: string) => void;
  selectedBank?: BankAccount;
  bankAccounts?: BankAccount[];
  receiptImage: string | null;
  onPickReceipt: (useCamera: boolean) => void;
  onRemoveReceipt: () => void;
  creditNote: string;
  onChangeCreditNote: (note: string) => void;
  bankReferenceNumber?: string;
  onChangeBankReferenceNumber?: (ref: string) => void;
  hasAssignedSeller?: boolean;
};

export const CartPaymentSection: React.FC<CartPaymentSectionProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  selectedBankId,
  onSelectBankId,
  selectedBank,
  bankAccounts = [],
  receiptImage,
  onPickReceipt,
  onRemoveReceipt,
  creditNote,
  onChangeCreditNote,
  bankReferenceNumber = "",
  onChangeBankReferenceNumber,
  hasAssignedSeller = true,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Opción de Pago</Text>
      <View style={styles.paymentSelectorContainer}>
        <TouchableOpacity
          style={[
            styles.paymentOptionTab,
            paymentMethod === "transfer" && styles.paymentOptionTabActive,
          ]}
          onPress={() => onPaymentMethodChange("transfer")}
        >
          <Ionicons
            name="card-outline"
            size={18}
            color={paymentMethod === "transfer" ? "#fff" : Palette.accent}
          />
          <Text
            style={[
              styles.paymentOptionText,
              paymentMethod === "transfer" && styles.paymentOptionTextActive,
            ]}
            numberOfLines={2}
          >
            Transferencia / Comprobante
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOptionTab,
            paymentMethod === "credit" && styles.paymentOptionTabActive,
            !hasAssignedSeller && styles.paymentOptionTabDisabled,
          ]}
          onPress={() => {
            if (hasAssignedSeller) {
              onPaymentMethodChange("credit");
            }
          }}
          activeOpacity={hasAssignedSeller ? 0.7 : 1}
        >
          <Ionicons
            name="hand-left-outline"
            size={18}
            color={
              !hasAssignedSeller
                ? "#94A3B8"
                : paymentMethod === "credit"
                ? "#fff"
                : Palette.accent
            }
          />
          <Text
            style={[
              styles.paymentOptionText,
              paymentMethod === "credit" && styles.paymentOptionTextActive,
              !hasAssignedSeller && styles.paymentOptionTextDisabled,
            ]}
            numberOfLines={2}
          >
            Pago a Crédito {!hasAssignedSeller && "(Restringido)"}
          </Text>
        </TouchableOpacity>
      </View>

      {!hasAssignedSeller && (
        <View style={styles.creditRestrictedNotice}>
          <Ionicons name="information-circle-outline" size={16} color="#B45309" />
          <Text style={styles.creditRestrictedText}>
            El pago a crédito requiere un vendedor asignado a tu cartera.
          </Text>
        </View>
      )}

      {paymentMethod === "transfer" ? (
        <TransferPaymentCard
          bankAccounts={bankAccounts}
          selectedBankId={selectedBankId}
          onSelectBankId={onSelectBankId}
          selectedBank={selectedBank}
          receiptImage={receiptImage}
          onPickReceipt={onPickReceipt}
          onRemoveReceipt={onRemoveReceipt}
          bankReferenceNumber={bankReferenceNumber}
          onChangeBankReferenceNumber={onChangeBankReferenceNumber}
        />
      ) : (
        <CreditPaymentCard
          creditNote={creditNote}
          onChangeCreditNote={onChangeCreditNote}
        />
      )}
    </View>
  );
};

export default CartPaymentSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: Palette.primaryDark,
  },
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
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Palette.accent,
    backgroundColor: Palette.surface,
  },
  paymentOptionTabActive: {
    backgroundColor: Palette.accent,
  },
  paymentOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.accent,
    flexShrink: 1,
  },
  paymentOptionTextActive: {
    color: "#fff",
  },
  paymentOptionTabDisabled: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
    opacity: 0.65,
  },
  paymentOptionTextDisabled: {
    color: "#94A3B8",
  },
  creditRestrictedNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  creditRestrictedText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "600",
    flex: 1,
  },
});
