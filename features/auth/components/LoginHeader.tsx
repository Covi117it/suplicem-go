import React from "react";
import { Image, StyleSheet, View } from "react-native";

export const LoginHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo2.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 250,
    height: 100,
  },
});
