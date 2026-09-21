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
import { TermsDisclaimerModal } from "./components/TermsDisclaimerModal";

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
    termsDisclaimerVisible,
    hasScrolledToBottom,
    isCheckedAccepted,
    setIsCheckedAccepted,
    handleLogin,
    handleAcceptTerms,
    handleDeclineTerms,
    handleScrollTerms,
    handlePasswordReset,
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
        />

        <ForgotPasswordModal
          visible={modalVisible}
          email={recoveryEmail}
          onChangeEmail={setRecoveryEmail}
          onSubmit={handlePasswordReset}
          onClose={() => setModalVisible(false)}
        />

        <TermsDisclaimerModal
          visible={termsDisclaimerVisible}
          hasScrolledToBottom={hasScrolledToBottom}
          isCheckedAccepted={isCheckedAccepted}
          onScrollTerms={handleScrollTerms}
          onToggleCheckbox={() => setIsCheckedAccepted(!isCheckedAccepted)}
          onAccept={handleAcceptTerms}
          onDecline={handleDeclineTerms}
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
