import { Linking, Platform, Alert, ActionSheetIOS } from "react-native";

export interface NavigationCoords {
  latitude: number;
  longitude: number;
  label?: string;
}

/**
 * Abre la app de navegación preferida (Google Maps, Waze, Apple Maps)
 */
export const openExternalNavigation = (
  coords: NavigationCoords,
  appName?: "google" | "waze" | "apple"
) => {
  const { latitude, longitude, label } = coords;
  const encodedLabel = encodeURIComponent(label || "Destino de Entrega");

  if (appName === "google") {
    const googleUrl = Platform.select({
      ios: `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`,
      android: `google.navigation:q=${latitude},${longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`,
    });
    const webFallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

    Linking.canOpenURL(googleUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(googleUrl);
        } else {
          Linking.openURL(webFallbackUrl);
        }
      })
      .catch(() => Linking.openURL(webFallbackUrl));
    return;
  }

  if (appName === "waze") {
    const wazeUrl = `waze://?ll=${latitude},${longitude}&navigate=yes`;
    const wazeWebUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;

    Linking.canOpenURL(wazeUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(wazeUrl);
        } else {
          Linking.openURL(wazeWebUrl);
        }
      })
      .catch(() => Linking.openURL(wazeWebUrl));
    return;
  }

  if (appName === "apple" && Platform.OS === "ios") {
    const appleUrl = `maps://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d&q=${encodedLabel}`;
    Linking.openURL(appleUrl);
    return;
  }

  // Si no se especifica appName, mostrar menú selector para que el usuario elija
  promptNavigationOptions(coords);
};

export const promptNavigationOptions = (coords: NavigationCoords) => {
  const { latitude, longitude, label } = coords;

  const options = [
    { text: "Google Maps 🗺️", onPress: () => openExternalNavigation(coords, "google") },
    { text: "Waze 🚗", onPress: () => openExternalNavigation(coords, "waze") },
  ];

  if (Platform.OS === "ios") {
    options.push({
      text: "Apple Maps 🍎",
      onPress: () => openExternalNavigation(coords, "apple"),
    });
  }

  options.push({ text: "Cancelar", onPress: () => {} });

  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: "Selecciona App de Navegación GPS",
        message: label ? `Navegar hacia: ${label}` : undefined,
        options: options.map((opt) => opt.text),
        cancelButtonIndex: options.length - 1,
      },
      (buttonIndex) => {
        if (buttonIndex < options.length - 1) {
          options[buttonIndex].onPress();
        }
      }
    );
  } else {
    Alert.alert(
      "Navegación GPS 📍",
      `Elija una aplicación para navegar hacia ${label || "el destino"}:`,
      options.map((opt) => ({
        text: opt.text,
        onPress: opt.onPress,
        style: opt.text === "Cancelar" ? "cancel" : "default",
      }))
    );
  }
};
