import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { Platform, useColorScheme } from "react-native";

import { DB_NAME } from "@/constants/app-contants";
import { initDb } from "@/utils/dbUtils";
import { Paths } from "expo-file-system";
import { SQLiteProvider, defaultDatabaseDirectory } from "expo-sqlite";
import { useMemo } from "react";

export default function StackLayout() {
  const dbDirectory = useMemo(() => {
    if (Platform.OS === "ios") {
      return Object.values(Paths.appleSharedContainers)?.[0]?.uri;
    }
    return defaultDatabaseDirectory;
  }, []);

  const colorScheme = useColorScheme();
  return (
    <SQLiteProvider
      databaseName={DB_NAME}
      directory={dbDirectory}
      onInit={initDb}
    >
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </ThemeProvider>
    </SQLiteProvider>
  );
}
