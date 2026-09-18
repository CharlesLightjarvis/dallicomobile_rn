import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "dallico.auth-token";

export const tokenStorage = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string) =>
    SecureStore.setItemAsync(TOKEN_KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }),
  remove: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};
