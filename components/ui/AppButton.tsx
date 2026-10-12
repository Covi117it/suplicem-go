import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ButtonVariant =
  | "primary"
  | "success"
  | "danger"
  | "danger-outline"
  | "secondary"
  | "outline";

export interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  variant = "primary",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...rest
}) => {
  const isActionDisabled = disabled || loading;

  const getVariantStyles = (): { button: ViewStyle; text: TextStyle; iconColor: string } => {
    switch (variant) {
      case "success":
        return {
          button: styles.successButton,
          text: styles.lightText,
          iconColor: "#ffffff",
        };
      case "danger":
        return {
          button: styles.dangerButton,
          text: styles.lightText,
          iconColor: "#ffffff",
        };
      case "danger-outline":
        return {
          button: styles.dangerOutlineButton,
          text: styles.dangerOutlineText,
          iconColor: "#B91C1C",
        };
      case "secondary":
        return {
          button: styles.secondaryButton,
          text: styles.lightText,
          iconColor: "#ffffff",
        };
      case "outline":
        return {
          button: styles.outlineButton,
          text: styles.outlineText,
          iconColor: "#374151",
        };
      case "primary":
      default:
        return {
          button: styles.primaryButton,
          text: styles.lightText,
          iconColor: "#ffffff",
        };
    }
  };

  const currentVariant = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        currentVariant.button,
        isActionDisabled && styles.disabledButton,
        style,
      ]}
      disabled={isActionDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={currentVariant.iconColor} />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={18}
              color={currentVariant.iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={[styles.baseText, currentVariant.text, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={18}
              color={currentVariant.iconColor}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  baseText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  lightText: {
    color: "#ffffff",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  successButton: {
    backgroundColor: "#16A34A",
  },
  dangerButton: {
    backgroundColor: "#DC2626",
  },
  dangerOutlineButton: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1.5,
    borderColor: "#EF4444",
  },
  dangerOutlineText: {
    color: "#B91C1C",
  },
  secondaryButton: {
    backgroundColor: "#6B7280",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  outlineText: {
    color: "#374151",
  },
});
