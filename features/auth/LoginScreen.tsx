import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useLogin } from "./hooks/useLogin";
import { LoginHeader } from "./components/LoginHeader";
import { LoginForm } from "./components/LoginForm";
import { ForgotPasswordModal } from "./components/ForgotPasswordModal";
import { ResendVerificationModal } from "./components/ResendVerificationModal";
<<<<<<< Updated upstream
=======
import { TermsDisclaimerModal } from "./components/TermsDisclaimerModal";
>>>>>>> Stashed changes

export const LoginScreen: React.FC = () => {
  const {
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
    resendModalVisible,
    setResendModalVisible,
<<<<<<< Updated upstream
    resendEmail,
    setResendEmail,
=======
    verificationEmail,
    setVerificationEmail,
    termsDisclaimerVisible,
    hasScrolledToBottom,
    isCheckedAccepted,
    setIsCheckedAccepted,
>>>>>>> Stashed changes
    handleLogin,
    handlePasswordReset,
    handleResendVerification,
<<<<<<< Updated upstream
=======
    openResendVerificationModal,
>>>>>>> Stashed changes
  } = useLogin();

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LoginHeader />

        <LoginForm
          email={email}
          onChangeEmail={setEmail}
          password={password}
          onChangePassword={setPassword}
          showPassword={showPassword}
          onToggleShowPassword={() => setShowPassword(!showPassword)}
          onLogin={handleLogin}
          onOpenForgotPassword={() => setModalVisible(true)}
<<<<<<< Updated upstream
          onOpenResendVerification={() => {
            setResendEmail(email || "");
            setResendModalVisible(true);
          }}
=======
          onOpenResendVerification={openResendVerificationModal}
>>>>>>> Stashed changes
        />

        <ForgotPasswordModal
          visible={modalVisible}
          email={recoveryEmail}
          onChangeEmail={setRecoveryEmail}
          onSubmit={handlePasswordReset}
          onClose={() => setModalVisible(false)}
        />

        <ResendVerificationModal
          visible={resendModalVisible}
<<<<<<< Updated upstream
          email={resendEmail}
          onChangeEmail={setResendEmail}
          onSubmit={handleResendVerification}
          onClose={() => setResendModalVisible(false)}
=======
          email={verificationEmail}
          onChangeEmail={setVerificationEmail}
          onSubmit={handleResendVerification}
          onClose={() => setResendModalVisible(false)}
        />

        <TermsDisclaimerModal
          visible={termsDisclaimerVisible}
          hasScrolledToBottom={hasScrolledToBottom}
          isCheckedAccepted={isCheckedAccepted}
          onScrollTerms={handleScrollTerms}
          onToggleCheckbox={() => setIsCheckedAccepted(!isCheckedAccepted)}
          onAccept={handleAcceptTerms}
          onDecline={handleDeclineTerms}
>>>>>>> Stashed changes
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
});
