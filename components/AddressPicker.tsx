import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddressPickerProps {
  initialValue?: string;
  onPlaceSelected: (data: {
    placeId: string;
    description: string;
    latitude: number;
    longitude: number;
  }) => void;
}

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function AddressPicker({ onPlaceSelected, initialValue = "" }: AddressPickerProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimerRef = useRef<any>(null);

  useEffect(() => {
    if (initialValue && initialValue !== query) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  const handleQueryChange = (text: string) => {
    setQuery(text);

    // Notificar inmediatamente al formulario la dirección escrita en tiempo real
    onPlaceSelected({
      placeId: `custom-${Date.now()}`,
      description: text,
      latitude: 18.4861,
      longitude: -69.9312,
    });

    if (text.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Opción principal: La dirección exacta ingresada por el usuario
    const exactUserOption = {
      id: "exact-user-input",
      description: text,
      isExact: true,
      latitude: 18.4861,
      longitude: -69.9312,
    };

    setResults([exactUserOption]);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debouncing de 300ms para consultar calles y puntos precisos
    debounceTimerRef.current = setTimeout(() => {
      fetchNetworkSuggestions(text, exactUserOption);
    }, 300);
  };

  const fetchNetworkSuggestions = async (text: string, exactOption: any) => {
    setLoading(true);

    try {
      // 1. Google Places Autocomplete API (si la API KEY está configurada)
      if (
        API_KEY &&
        API_KEY !== "your_google_maps_api_key_here" &&
        !API_KEY.includes("your_")
      ) {
        const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&components=country:do&language=es&key=${API_KEY}`;

        const res = await fetch(googleUrl);
        const json = await res.json();

        if (json.status === "OK" && json.predictions && json.predictions.length > 0) {
          const googleResults = json.predictions.map((p: any) => ({
            id: p.place_id,
            description: p.description,
            isGoogle: true,
            placeId: p.place_id,
          }));
          setResults([exactOption, ...googleResults]);
          setLoading(false);
          return;
        }
      }

      // 2. OpenStreetMap Nominatim API: Búsqueda precisa de calles, avenidas y números en RD
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        text + ", República Dominicana"
      )}&format=json&addressdetails=1&limit=6`;

      const nomRes = await fetch(nominatimUrl, {
        headers: {
          "User-Agent": "SuplicemApp/1.0 (contact@suplicem.com)",
          "Accept-Language": "es",
        },
      });

      if (nomRes.ok) {
        const nomJson = await nomRes.json();
        if (Array.isArray(nomJson) && nomJson.length > 0) {
          // Detectar si el usuario escribió un número de casa/calle (#7, No. 7, Apto 4, etc.)
          const numberMatch = text.match(/(?:#|no\.|num\.|n°|apto|casa)?\s*(\d+[a-z]?)/i);
          const houseNumStr = numberMatch ? `#${numberMatch[1]}` : "";

          const mapped = nomJson.map((item: any, idx: number) => {
            const addr = item.address || {};
            const streetName = addr.road || addr.pedestrian || addr.suburb || item.name || "";
            const sectorName = addr.neighbourhood || addr.suburb || addr.district || addr.quarter || "";
            const cityName = addr.city || addr.town || addr.state || "Santo Domingo";

            let formattedAddress = "";
            if (streetName) {
              const streetWithNum = houseNumStr ? `${streetName} ${houseNumStr}` : streetName;
              const parts = [streetWithNum, sectorName, cityName, "República Dominicana"].filter(
                (p, index, self) => p && self.indexOf(p) === index
              );
              formattedAddress = parts.join(", ");
            } else {
              formattedAddress = item.display_name;
            }

            return {
              id: `nom-${idx}-${item.place_id}`,
              description: formattedAddress,
              latitude: parseFloat(item.lat) || 18.4861,
              longitude: parseFloat(item.lon) || -69.9312,
              isGoogle: false,
            };
          });

          const finalResults = [exactOption];
          mapped.forEach((m) => {
            if (!finalResults.some((r) => r.description.toLowerCase() === m.description.toLowerCase())) {
              finalResults.push(m);
            }
          });

          setResults(finalResults);
          setLoading(false);
          return;
        }
      }

      // 3. Fallback: Photon Geocoder
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        text
      )}&bbox=-72.0,17.4,-68.3,20.0&lang=es&limit=5`;

      const photonRes = await fetch(photonUrl);
      const photonJson = await photonRes.json();

      if (photonJson && photonJson.features && photonJson.features.length > 0) {
        const mapped = photonJson.features.map((f: any, idx: number) => {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates || [-69.9312, 18.4861];

          const parts = [
            props.name,
            props.street,
            props.district || props.suburb || props.city || props.state,
            props.country || "República Dominicana",
          ].filter(Boolean);

          return {
            id: `photon-${idx}-${Date.now()}`,
            description: parts.join(", ") || props.name || text,
            latitude: coords[1],
            longitude: coords[0],
            isGoogle: false,
          };
        });

        const finalResults = [exactOption];
        mapped.forEach((m: any) => {
          if (!finalResults.some((r) => r.description.toLowerCase() === m.description.toLowerCase())) {
            finalResults.push(m);
          }
        });

        setResults(finalResults);
      }
    } catch (err) {
      // Silenciar errores de red
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = async (item: any) => {
    setResults([]);

    let finalDescription = item.description;

    // Si seleccionó una sugerencia de calle/sector y el usuario tenía un número de casa o detalle específico tecleado
    if (!item.isExact && query.trim()) {
      const lowerQuery = query.toLowerCase();
      const lowerItem = item.description.toLowerCase();

      // Si la sugerencia devuelta no incluye los detalles específicos (ej. #7, apto 3)
      if (!lowerItem.includes(lowerQuery)) {
        // Preservar la calle/número específicos ingresados por el usuario
        const numberMatch = query.match(/(?:#|no\.|num\.|n°|apto|casa)?\s*(\d+[a-z]?)/i);
        if (numberMatch && !lowerItem.includes(numberMatch[0].toLowerCase())) {
          finalDescription = `${query.trim()} (${item.description})`;
        }
      }
    }

    setQuery(finalDescription);

    if (item.isExact || !item.isGoogle) {
      onPlaceSelected({
        placeId: item.id || `loc-${Date.now()}`,
        description: finalDescription,
        latitude: item.latitude || 18.4861,
        longitude: item.longitude || -69.9312,
      });
      return;
    }

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
          item.placeId
        )}&fields=geometry,name,formatted_address&language=es&key=${API_KEY}`
      );
      const json = await res.json();
      const loc = json.result?.geometry?.location;

      onPlaceSelected({
        placeId: item.placeId,
        description: finalDescription,
        latitude: loc?.lat || 18.4861,
        longitude: loc?.lng || -69.9312,
      });
    } catch (error) {
      onPlaceSelected({
        placeId: item.placeId,
        description: finalDescription,
        latitude: 18.4861,
        longitude: -69.9312,
      });
    }
  };

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    onPlaceSelected({
      placeId: "",
      description: "",
      latitude: 18.4861,
      longitude: -69.9312,
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputBox}>
        <Ionicons name="location-outline" size={18} color="#E31E24" style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Calle, # casa/apto y sector (ej: Calle Isabel de Torres #7)"
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearQuery} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
        {loading && (
          <ActivityIndicator
            size="small"
            color="#E31E24"
            style={{ marginRight: 4 }}
          />
        )}
      </View>

      {/* Badge explicativo de confirmación de dirección guardada */}
      {query.trim().length > 0 && (
        <View style={styles.activeBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
          <Text style={styles.activeBadgeText} numberOfLines={1}>
            Dirección activa: "{query}"
          </Text>
        </View>
      )}

      {results.length > 0 && (
        <ScrollView
          style={styles.resultsContainer}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {results.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSelectSuggestion(item)}
              style={[styles.resultItem, item.isExact && styles.resultItemExact]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.isExact ? "checkmark-circle" : "pin-outline"}
                size={16}
                color={item.isExact ? "#16A34A" : "#E31E24"}
                style={styles.itemIcon}
              />
              <Text
                style={[styles.resultText, item.isExact && styles.resultTextExact]}
                numberOfLines={2}
              >
                {item.isExact ? `📌 Guardar esta dirección exacta: "${item.description}"` : item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    zIndex: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderColor: "#CBD5E1",
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  clearBtn: {
    padding: 4,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F294A",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "#F0FDF4",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  activeBadgeText: {
    fontSize: 12,
    color: "#15803D",
    fontWeight: "600",
    flex: 1,
  },
  resultsContainer: {
    maxHeight: 180,
    marginTop: 4,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderColor: "#CBD5E1",
    borderWidth: 1,
    elevation: 4,
    shadowColor: "#0F294A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomColor: "#F1F5F9",
    borderBottomWidth: 1,
  },
  resultItemExact: {
    backgroundColor: "#F0FDF4",
  },
  itemIcon: {
    marginRight: 8,
  },
  resultText: {
    fontSize: 13,
    color: "#334155",
    flex: 1,
    lineHeight: 18,
  },
  resultTextExact: {
    fontWeight: "bold",
    color: "#15803D",
  },
});
