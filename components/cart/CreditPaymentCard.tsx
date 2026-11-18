import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Palette } from "@/constants/theme";

interface CreditPaymentCardProps {
  creditNote: string;
  onChangeCreditNote: (note: string) => void;
}

export const CreditPaymentCard: React.FC<CreditPaymentCardProps> = ({
  creditNote,
  onChangeCreditNote,
}) => {
  return (
    <View style={styles.paymentDetailCardCredit}>
      <Text style={styles.paymentDetailTitleCredit}>
        🤝 Solicitud de Pago a Crédito
      </Text>
      <Text style={styles.paymentDetailSubtext}>
        Tu pedido se registrará en tu cuenta corriente según los acuerdos de crédito autorizados.
      </Text>
      <TextInput
        style={styles.creditNoteInput}
        placeholder="Observación (Ej: Pago el próximo viernes o quincena)"
        placeholderTextColor={Palette.placeholder}
        value={creditNote}
        onChangeText={onChangeCreditNote}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  paymentDetailCardCredit: {
    backgroundColor: Palette.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 10,
  },
  paymentDetailTitleCredit: {
    fontWeight: "bold",
    fontSize: 15,
    color: Palette.accent,
    marginBottom: 6,
  },
  paymentDetailSubtext: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 4,
    marginBottom: 10,
    lineHeight: 16,
  },
  creditNoteInput: {
    backgroundColor: "#FAF8F5",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 42,
    fontSize: 13,
    color: Palette.primaryDark,
  },
});
