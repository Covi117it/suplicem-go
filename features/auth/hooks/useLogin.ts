import { useContext, useState } from "react";
import { Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "@/context/authContext";
import { useLoading } from "@/context/loadingContext";
import { useAlert } from "@/context/alertContext";
import { getCurrentUser, login, recoverPassword } from "@/services/authService";
import {
  saveAuthSession,
  saveAcceptedTerms,
  checkAcceptedTerms,
} from "@/utils/authStorage";

export const useLogin = () => {
  const authContext = useContext(AuthContext);
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Modal de recuperación
  const [modalVisible, setModalVisible] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // Modal de Términos y Condiciones
  const [termsDisclaimerVisible, setTermsDisclaimerVisible] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isCheckedAccepted, setIsCheckedAccepted] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState<{
    session: any;
    user: any;
  } | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({
        message: "Por favor, complete todos los campos",
        type: "error",
      });
      return;
    }

    show();

    const responseLogin = await login(email, password);

    if (responseLogin?.data?.success) {
      const responseUser = await getCurrentUser(responseLogin?.data?.idToken);

      if (responseUser?.data?.success) {
        const user = responseUser?.data?.user;

        if (user?.status === "pending") {
          const now = Date.now();
          const newSession = {
            token: responseLogin?.data?.idToken,
            refreshToken: responseLogin?.data?.refreshToken,
            expiresAt: now + parseInt(responseLogin?.data?.expiresIn || "3600") * 1000,
          };
          await saveAuthSession(newSession);
          authContext.logIn(user);
          hide();
          router.replace("/pending-approval");
          return;
        }

        if (user?.status === "inactive") {
          showAlert({
            message: "Cuenta suspendida temporalmente.",
            type: "info",
          });
          hide();
          return;
        }

        if (!responseLogin?.data?.emailVerified) {
          showAlert({
            message:
              "Aún no has verificado tu cuenta. Por favor, revisa tu correo electrónico y haz clic en el enlace de verificación para activar tu cuenta.",
            type: "info",
          });
          hide();
          return;
        }

        const now = Date.now();
        const newSession = {
          token: responseLogin?.data?.idToken,
          refreshToken: responseLogin?.data?.refreshToken,
          expiresAt: now + parseInt(responseLogin?.data?.expiresIn || "3600") * 1000,
        };

        const alreadyAccepted = await checkAcceptedTerms(user.uid);

        if (alreadyAccepted) {
          await saveAuthSession(newSession);
          authContext.logIn(user);
        } else {
          setPendingSessionData({
            session: newSession,
            user,
          });
          setHasScrolledToBottom(false);
          setIsCheckedAccepted(false);
          setTermsDisclaimerVisible(true);
        }
      } else {
        showAlert({
          message:
            responseUser?.message ||
            responseUser?.data?.message ||
            "No se pudo cargar la información del usuario",
          type: "error",
        });
      }
    } else {
      showAlert({
        message: responseLogin?.message || "Credenciales inválidas",
        type: "error",
      });
    }

    hide();
  };

  const handleAcceptTerms = async () => {
    if (!pendingSessionData || !hasScrolledToBottom || !isCheckedAccepted) return;

    const session = pendingSessionData;
    setTermsDisclaimerVisible(false);
    setPendingSessionData(null);

    if (session.user?.uid) {
      await saveAcceptedTerms(session.user.uid);
    }
    await saveAuthSession(session.session);

    setTimeout(() => {
      authContext.logIn(session.user);
    }, Platform.OS === "ios" ? 300 : 50);
  };

  const handleDeclineTerms = () => {
    setTermsDisclaimerVisible(false);
    setPendingSessionData(null);
    showAlert({
      message: "Debes aceptar los Términos y Condiciones para poder ingresar a la plataforma Suplicem.",
      type: "warning",
    });
  };

  const handleScrollTerms = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 30;
    const isBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    if (isBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handlePasswordReset = async () => {
    if (!recoveryEmail) {
      showAlert({
        message: "Ingrese su correo electrónico",
        type: "error",
      });
      return;
    }

    setModalVisible(false);
    show();

    const responseRecovery = await recoverPassword(recoveryEmail);

    if (responseRecovery?.data?.success) {
      showAlert({
        message: `Se enviará un correo a ${recoveryEmail} para restablecer su contraseña.`,
        type: "info",
      });
      setRecoveryEmail("");
    } else {
      showAlert({
        message: "El correo no existe",
        type: "error",
      });
    }

    hide();
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    modalVisible,
    setModalVisible,
    recoveryEmail,
    setRecoveryEmail,
    termsDisclaimerVisible,
    hasScrolledToBottom,
    isCheckedAccepted,
    setIsCheckedAccepted,
    handleLogin,
    handleAcceptTerms,
    handleDeclineTerms,
    handleScrollTerms,
    handlePasswordReset,
  };
};
