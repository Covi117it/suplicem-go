import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

export const ProductSkeletonCard: React.FC = () => {
  const [opacityAnim] = useState(() => new Animated.Value(0.3));
  useEffect(() => {

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <View style={styles.card}>

      <Animated.View style={[styles.imageSkeleton, { opacity: opacityAnim }]} />


      <Animated.View style={[styles.nameSkeleton, { opacity: opacityAnim }]} />


      <Animated.View style={[styles.priceSkeleton, { opacity: opacityAnim }]} />


      <Animated.View style={[styles.buttonSkeleton, { opacity: opacityAnim }]} />
    </View>
  );
};

export default ProductSkeletonCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderColor: "#eee",
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  imageSkeleton: {
    width: "100%",
    height: 140,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 12,
  },
  nameSkeleton: {
    width: "70%",
    height: 18,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 8,
  },
  priceSkeleton: {
    width: "35%",
    height: 16,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 14,
  },
  buttonSkeleton: {
    width: "100%",
    height: 42,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
  },
});