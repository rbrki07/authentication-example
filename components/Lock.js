import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * @param {Object} params
 * @param {boolean} params.locked
 * @param {(locked: boolean) => void} params.onPress
 *
 * @returns {Object} React Component
 */
const Lock = ({ locked, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        onPress(locked);
      }}
      style={styles.container}
    >
      {locked === true ? (
        <View style={styles.lock}>
          <Ionicons name={"lock-closed"} size={32} />
          <Text>Unlock</Text>
        </View>
      ) : (
        <View style={styles.lock}>
          <Ionicons name={"lock-open"} size={32} />
          <Text>Lock</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 65,
    width: 65,
    margin: 16,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  lock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export { Lock };
