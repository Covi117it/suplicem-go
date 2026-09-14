import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

type TermsAndConditionsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.termsModalOverlay}>
        <View style={styles.termsModalCard}>
          <View style={styles.termsHeader}>
            <Ionicons name="shield-checkmark-outline" size={28} color={Palette.primary} />
            <Text style={styles.termsTitle}>Términos y Condiciones Suplicem</Text>
          </View>
          <Text style={styles.termsSubtitle}>
            Acuerdo legal y políticas de servicio de distribución y logística.
          </Text>

          <ScrollView style={styles.termsScrollView} showsVerticalScrollIndicator={true}>
            <Text style={styles.contractSectionHeader}>1. Descripción del Servicio Suplicem</Text>
            <Text style={styles.contractParagraph}>
              Suplicem es una plataforma de distribución y logística para la compra y despacho de cemento, agregados y materiales de construcción. Los pedidos se gestionan por fundas y toneladas con entregas directas a domicilio/obra o retiro en almacén.
            </Text>

            <Text style={styles.contractSectionHeader}>2. Registro y Responsabilidad de Cuenta</Text>
            <Text style={styles.contractParagraph}>
              El usuario garantiza que la información de registro (dirección de obra, número de cédula/RNC y contacto) es verídica. Cada cliente es responsable de garantizar un acceso adecuado para los vehículos pesados de transporte en el lugar de entrega designado.
            </Text>

            <Text style={styles.contractSectionHeader}>3. Modalidades de Pago y Comprobantes</Text>
            <Text style={styles.contractParagraph}>
              - Transferencia Bancaria: El cliente debe adjuntar la captura del comprobante oficial emitido por el banco para validar el pedido.
              {"\n\n"}- Pago a Crédito: La modalidad de crédito se otorga sujeta a acuerdos comerciales previos y límites de cuenta autorizados por la administración de Suplicem.
            </Text>

            <Text style={styles.contractSectionHeader}>4. Recepción de Mercancía y Garantía</Text>
            <Text style={styles.contractParagraph}>
              Al momento del descargue en la obra o almacén, el cliente o su representante debe verificar la cantidad de fundas recibidas y su estado. Cualquier novedad debe ser notificada de inmediato.
            </Text>

            <Text style={styles.contractSectionHeader}>5. Política de Privacidad y Protección de Datos</Text>
            <Text style={styles.contractParagraph}>
              Los datos recabados se utilizan exclusivamente para la gestión de compras, emisión de facturas y coordinación logística de despacho. Suplicem no comparte información personal con terceros ajenos a la operación.
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={styles.termsCloseButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.termsCloseButtonText}>Entendido y Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TermsAndConditionsModal;

const styles = StyleSheet.create({
  termsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  termsModalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 22,
    width: "100%",
    maxHeight: "85%",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  termsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Palette.primaryDark,
    flex: 1,
  },
  termsSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 14,
    lineHeight: 18,
  },
  termsScrollView: {
    maxHeight: 380,
    marginVertical: 6,
  },
  contractSectionHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: Palette.primaryDark,
    marginTop: 12,
    marginBottom: 4,
  },
  contractParagraph: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
  },
  termsCloseButton: {
    backgroundColor: Palette.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  termsCloseButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
