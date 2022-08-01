import { useTheme } from "@chakra-ui/react";

export function useColorScheme() {
  const colorScheme = useTheme().name;
  const tone = (value: number | undefined) => (value ? `${colorScheme}.${value}` : colorScheme);

  return { tone, colorScheme };
}
