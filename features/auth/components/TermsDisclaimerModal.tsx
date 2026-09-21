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

interface TermsDisclaimerModalProps {
  visible: boolean;
  hasScrolledToBottom: boolean;
  isCheckedAccepted: boolean;
  onScrollTerms: (event: any) => void;
  onToggleCheckbox: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

export const TermsDisclaimerModal: React.FC<TermsDisclaimerModalProps> = ({
  visible,
  hasScrolledToBottom,
  isCheckedAccepted,
  onScrollTerms,
  onToggleCheckbox,
  onAccept,
  onDecline,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={() => {}}
    >
      <View style={styles.termsModalOverlay}>
        <View style={styles.termsModalCardSharp}>
          <View style={styles.termsHeader}>
            <Ionicons name="shield-checkmark-outline" size={30} color="#E31E24" />
            <Text style={styles.termsTitleLarge}>Términos y Condiciones de Suplicem</Text>
          </View>
          <Text style={styles.termsSubtitleLarge}>
            Por favor, desplázate hasta el final para leer el acuerdo de servicio antes de continuar.
          </Text>

          <View style={styles.termsScrollBox}>
            <ScrollView
              onScroll={onScrollTerms}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={true}
              style={styles.termsScrollViewArea}
            >
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
                - <Text style={{ fontWeight: "bold" }}>Transferencia Bancaria:</Text> El cliente debe adjuntar la captura del comprobante oficial emitido por el banco para validar el pedido.
                {"\n\n"}- <Text style={{ fontWeight: "bold" }}>Pago a Crédito:</Text> La modalidad de crédito se otorga sujeta a acuerdos comerciales previos y límites de cuenta autorizados por la administración de Suplicem.
              </Text>

              <Text style={styles.contractSectionHeader}>4. Recepción de Mercancía y Garantía</Text>
              <Text style={styles.contractParagraph}>
                Al momento del descargue en la obra o almacén, el cliente o su representante debe verificar la cantidad de fundas recibidas y su estado. Cualquier novedad debe ser notificada de inmediato a través de los canales de atención.
              </Text>

              <Text style={styles.contractSectionHeader}>5. Política de Privacidad y Protección de Datos</Text>
              <Text style={styles.contractParagraph}>
                Los datos recabados se utilizan exclusivamente para la gestión de compras, emisión de facturas y coordinación logística de despacho. Suplicem no comparte información personal con terceros ajenos a la operación.
              </Text>

              <View style={styles.endOfDocumentContainer}>
                <Ionicons
                  name={hasScrolledToBottom ? "checkmark-circle" : "arrow-down-circle-outline"}
                  size={22}
                  color={hasScrolledToBottom ? "#2e7d32" : "#999"}
                />
                <Text
                  style={[
                    styles.endOfDocumentText,
                    hasScrolledToBottom && { color: "#2e7d32" },
                  ]}
                >
                  {hasScrolledToBottom
                    ? "Has leído todo el contrato de servicio."
                    : "Continúa desplazándote hasta el final..."}
                </Text>
              </View>
            </ScrollView>
          </View>

          {/* Casilla de verificación */}
          <TouchableOpacity
            disabled={!hasScrolledToBottom}
            style={[
              styles.checkboxRow,
              !hasScrolledToBottom && styles.checkboxRowDisabled,
            ]}
            onPress={onToggleCheckbox}
          >
            <Ionicons
              name={isCheckedAccepted ? "checkbox" : "square-outline"}
              size={24}
              color={
                !hasScrolledToBottom
                  ? "#b0bec5"
                  : isCheckedAccepted
                  ? "#E31E24"
                  : "#333"
              }
            />
            <Text
              style={[
                styles.checkboxLabel,
                !hasScrolledToBottom && { color: "#b0bec5" },
              ]}
            >
              He leído y acepto los Términos y Condiciones de Suplicem.
            </Text>
          </TouchableOpacity>

          {/* Botones de Aceptar y Declinar */}
          <View style={styles.modalActionRow}>
            <TouchableOpacity
              disabled={!hasScrolledToBottom}
              style={[
                styles.declineButtonSharp,
                !hasScrolledToBottom && styles.buttonDisabledSharp,
              ]}
              onPress={onDecline}
            >
              <Text
                style={[
                  styles.declineButtonText,
                  !hasScrolledToBottom && { color: "#90a4ae" },
                ]}
              >
                Declinar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!hasScrolledToBottom || !isCheckedAccepted}
              style={[
                styles.acceptButtonSharp,
                (!hasScrolledToBottom || !isCheckedAccepted) &&
                  styles.buttonDisabledSharp,
              ]}
              onPress={onAccept}
            >
              <Text style={styles.acceptButtonTextSharp}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  termsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 41, 74, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  termsModalCardSharp: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 0,
    borderWidth: 2,
    borderColor: "#0F294A",
    padding: 20,
    elevation: 8,
  },
  termsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  termsTitleLarge: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
    flex: 1,
  },
  termsSubtitleLarge: {
    fontSize: 13,
    color: "#607d8b",
    marginBottom: 12,
    lineHeight: 18,
  },
  termsScrollBox: {
    height: 320,
    borderWidth: 1,
    borderColor: "#cfd8dc",
    backgroundColor: "#fafafa",
    padding: 12,
    marginBottom: 12,
  },
  termsScrollViewArea: {
    flex: 1,
  },
  contractSectionHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F294A",
    marginTop: 8,
    marginBottom: 4,
  },
  contractParagraph: {
    fontSize: 12.5,
    color: "#37474f",
    lineHeight: 18,
    textAlign: "justify",
  },
  endOfDocumentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  endOfDocumentText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#78909c",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  checkboxRowDisabled: {
    opacity: 0.6,
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#0F294A",
    fontWeight: "600",
    flex: 1,
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  declineButtonSharp: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#cfd8dc",
    backgroundColor: "#eceff1",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
  },
  declineButtonText: {
    color: "#546e7a",
    fontSize: 14,
    fontWeight: "700",
  },
  acceptButtonSharp: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#E31E24",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
  },
  acceptButtonTextSharp: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  buttonDisabledSharp: {
    backgroundColor: "#cfd8dc",
    borderColor: "#cfd8dc",
  },
});
