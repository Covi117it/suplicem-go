import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const PROMO_BANNERS = [
  {
    id: "b1",
    title: "🏗️ ¡Gran Oferta en Cemento!",
    subtitle: "Descuento especial del 15% en compras al por mayor con despacho a obra.",
    bgGradient: "#E31E24",
    badge: "OFERTA DEL MES",
    icon: "construct",
  },
  {
    id: "b2",
    title: "🚚 Despacho Exprés Gratis",
    subtitle: "Envíos inmediatos y directos a tu construcción en 24 horas.",
    bgGradient: "#0F294A",
    badge: "ENVÍO GRATIS",
    icon: "car-sport",
  },
  {
    id: "b3",
    title: "🤝 Pago a Crédito Disponible",
    subtitle: "Financia tus materiales de construcción con cuotas flexibles y tasa preferencial.",
    bgGradient: "#A04A0E",
    badge: "CRÉDITO FLEXIBLE",
    icon: "cash",
  },
];

export const PromoBannerCarousel: React.FC = () => {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setActiveBannerIndex((prevIndex) => (prevIndex + 1) % PROMO_BANNERS.length);
    }, 4000);
    return () => clearInterval(bannerTimer);
  }, []);

  const currentBanner = PROMO_BANNERS[activeBannerIndex];

  return (
    <View style={styles.bannerWrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.bannerCard, { backgroundColor: currentBanner.bgGradient }]}
        onPress={() =>
          setActiveBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length)
        }
      >
        <View style={styles.bannerBadgeContainer}>
          <Text style={styles.bannerBadgeText}>{currentBanner.badge}</Text>
        </View>

        <View style={styles.bannerContentRow}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>{currentBanner.title}</Text>
            <Text style={styles.bannerSubtitle}>{currentBanner.subtitle}</Text>
          </View>
          <Ionicons
            name={currentBanner.icon as any}
            size={48}
            color="#ffffff"
            style={{ opacity: 0.9 }}
          />
        </View>

        <View style={styles.dotsRow}>
          {PROMO_BANNERS.map((banner, idx) => (
            <TouchableOpacity
              key={banner.id}
              onPress={() => setActiveBannerIndex(idx)}
              style={[
                styles.dot,
                idx === activeBannerIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default PromoBannerCarousel;

const styles = StyleSheet.create({
  bannerWrapper: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  bannerCard: {
    borderRadius: 16,
    padding: 22,
    minHeight: 165,
    justifyContent: "space-between",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  bannerBadgeContainer: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 10,
  },
  bannerBadgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  bannerContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  bannerTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: 28,
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 14,
    lineHeight: 20,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#ffffff",
  },
});
