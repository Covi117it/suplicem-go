import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

export interface PickImageOptions {
  useCamera?: boolean;
  maxWidth?: number;
  quality?: number;
  includeBase64?: boolean;
}

export interface PickImageResult {
  success: boolean;
  uri?: string;
  base64?: string | null;
  cancelled?: boolean;
  errorMessage?: string;
}

/**
 * Función utilitaria centralizada para solicitar permisos, abrir cámara o galería
 * y comprimir/redimensionar la imagen resultante.
 */
export const pickAndCompressImage = async (
  options: PickImageOptions = {}
): Promise<PickImageResult> => {
  const {
    useCamera = false,
    maxWidth = 800,
    quality = 0.5,
    includeBase64 = false,
  } = options;

  try {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return {
        success: false,
        errorMessage: `Se requiere permiso para acceder a la ${useCamera ? "cámara" : "galería de fotos"}.`,
      };
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality,
          allowsEditing: true,
          base64: includeBase64,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality,
          allowsEditing: true,
          base64: includeBase64,
        });

    if (result.canceled || !result.assets || !result.assets[0]) {
      return { success: false, cancelled: true };
    }

    const asset = result.assets[0];

    // Redimensionar y comprimir la imagen
    if (maxWidth && maxWidth > 0) {
      const manipResult = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: maxWidth } }],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: includeBase64,
        }
      );

      return {
        success: true,
        uri: manipResult.uri,
        base64: manipResult.base64 || asset.base64,
      };
    }

    return {
      success: true,
      uri: asset.uri,
      base64: asset.base64,
    };
  } catch (error: any) {
    console.error("Error al capturar o procesar la imagen:", error);
    return {
      success: false,
      errorMessage: error?.message || "Error al procesar la imagen",
    };
  }
};
