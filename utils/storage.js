import AsyncStorage from "@react-native-async-storage/async-storage";

export const setOnboarded = async () => {
  await AsyncStorage.setItem("hasOnboarded", "true");
};

export const checkOnboarded = async () => {
  return await AsyncStorage.getItem("hasOnboarded");
};
