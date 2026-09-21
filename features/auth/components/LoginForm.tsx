import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface LoginFormProps {
  email: string;
  onChangeEmail: (text: string) => void;
  password: string;
  onChangePassword: (text: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  onLogin: () => void;
  onOpenForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  onChangeEmail,
  password,
  onChangePassword,
  showPassword,
  onToggleShowPassword,
  onLogin,
  onOpenForgotPassword,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons
          name="person-outline"
          size={24}
          color="#999"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Usuario"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={onChangeEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={24}
          color="#999"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={onChangePassword}
        />
        <TouchableOpacity onPress={onToggleShowPassword}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#999"
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={onLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.push("/register")}
      >
        <Text style={styles.linkText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={onOpenForgotPassword}
      >
        <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          Al acceder demuestras tu conformidad con nuestros{" "}
          <Text
            style={styles.linkInline}
            onPress={() => router.push("/terms")}
          >
            Términos de Uso
          </Text>{" "}
          y{" "}
          <Text
            style={styles.linkInline}
            onPress={() => router.push("/privacy")}
          >
            Política de Privacidad
          </Text>
          .
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#0F294A",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkButton: {
    alignItems: "center",
    marginVertical: 5,
  },
  linkText: {
    color: "#0F294A",
    fontSize: 16,
  },
  termsContainer: {
    marginTop: 25,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  linkInline: {
    color: "#0F294A",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
