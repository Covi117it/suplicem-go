import { AuthContext } from "@/context/authContext";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { getCurrentUser } from "@/services/authService";
import { getAuthSession } from "@/utils/authStorage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PendingApprovalScreen() {
  const authContext = useContext(AuthContext);
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCheckStatus = async () => {
    try {
      show();
      setIsRefreshing(true);

      const session = await getAuthSession();
      if (!session?.token) {
        showAlert({
          message: "No hay sesión activa. Por favor, inicia sesión de nuevo.",
          type: "warning",
        });
        authContext.logOut();
        return;
      }

      const resUser = await getCurrentUser(session.token);
      if (resUser?.data?.success) {
        const updatedUser = resUser.data.user;

        if (updatedUser?.status === "active") {
          showAlert({
            message: "🎉 ¡Tu cuenta ha sido aprobada y habilitada con éxito! Bienvenido a Suplicem.",
            type: "success",
          });
          authContext.logIn(updatedUser);
          return;
        } else if (updatedUser?.status === "inactive") {
          showAlert({
            message: "Tu solicitud ha sido rechazada o suspendida por la administración.",
            type: "error",
          });
        } else {
          showAlert({
            message: "Tu solicitud continúa en proceso de revisión por el Administrador.",
            type: "info",
          });
        }
      } else {
        showAlert({
          message: "No se pudo actualizar el estado de tu cuenta.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
      hide();
    }
  };

  const handleLogout = () => {
    authContext.logOut();
  };

  const userName = authContext.user?.names
    ? `${authContext.user.names} ${authContext.user.lastNames || ""}`
    : "Usuario";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Encabezado con Logo y Marca */}
      <View style={styles.header}>
        <Image
          source={require("../assets/images/logo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Tarjeta de Estado de Espera (Aesthetic Sharp & Dull) */}
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={54} color="#E31E24" />
        </View>

        <Text style={styles.title}>Solicitud en Revisión</Text>
        <Text style={styles.greeting}>¡Hola, {userName}!</Text>

        <Text style={styles.description}>
          Tu solicitud de registro ha sido recibida correctamente y tu documento de identificación (cédula/pasaporte) está en proceso de verificación por el Administrador.
        </Text>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#22c55e" />
            <Text style={styles.infoText}>Datos del registro recibidos</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={20} color="#0F294A" />
            <Text style={styles.infoText}>Cédula e imagen adjunta guardadas</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-unread-outline" size={20} color="#E31E24" />
            <Text style={styles.infoText}>
              Recibirás un correo cuando el admin active tu cuenta
            </Text>
          </View>
        </View>

        {/* Botón para Comprobar Estado */}
        <TouchableOpacity
          style={styles.checkButton}
          onPress={handleCheckStatus}
          disabled={isRefreshing}
        >
          <Ionicons name="refresh-outline" size={20} color="#ffffff" />
          <Text style={styles.checkButtonText}>Comprobar Estado de Activación</Text>
        </TouchableOpacity>

        {/* Botón para Cerrar Sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#0F294A" />
          <Text style={styles.logoutButtonText}>Volver al Inicio / Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Pie de página */}
      <Text style={styles.footerNote}>
        Suplicem Logística & Distribución • Sistema de Aprobación de Cuentas
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 70,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 24,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#0F294A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#FCA5A5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 6,
    textAlign: "center",
  },
  greeting: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E31E24",
    marginBottom: 14,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#0F294A",
    padding: 14,
    width: "100%",
    marginBottom: 24,
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
    flex: 1,
  },
  checkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 4,
    width: "100%",
    marginBottom: 12,
  },
  checkButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    width: "100%",
  },
  logoutButtonText: {
    color: "#0F294A",
    fontSize: 14,
    fontWeight: "600",
  },
  footerNote: {
    marginTop: 24,
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },
});
