# Bootstrap Expo Router + Uniwind + HeroUI Native

Ce guide reprend la configuration validée dans Dallico pour Expo SDK 57. Pour un futur projet utilisant un autre SDK Expo, consulter d'abord la documentation correspondant à sa version et laisser `expo install` choisir les versions natives compatibles.

## Principes importants

- Utiliser **Uniwind**, pas NativeWind, car HeroUI Native repose sur Uniwind.
- Garder les routes dans `src/app/` et le reste du code hors de ce dossier.
- Ne pas ajouter de preset Babel pour Uniwind.
- Dans un projet Bun, utiliser `bunx` au lieu de `npx`.
- Installer les bibliothèques React Native avec `expo install` afin de respecter le SDK courant.
- Après une modification de `global.css`, de Metro ou des thèmes, redémarrer Metro avec `--clear`.

## 1. Installer les dépendances

```bash
bunx expo install \
  uniwind \
  tailwindcss \
  heroui-native \
  react-native-reanimated \
  react-native-worklets \
  react-native-gesture-handler \
  react-native-safe-area-context \
  react-native-svg \
  @gorhom/bottom-sheet \
  tailwind-merge \
  tailwind-variants
```

Pour Space Grotesk :

```bash
bunx expo install expo-font @expo-google-fonts/space-grotesk
```

Vérifier ensuite les versions natives :

```bash
bunx expo install --check
```

Pour Expo SDK 57, les incompatibilités rencontrées étaient notamment :

```text
react-native-worklets attendu : 0.10.1
react-native-svg attendu      : 15.15.4
```

Ne pas forcer des versions mémorisées : `expo install --check` reste la source de vérité.

## 2. Configurer Metro

Créer `metro.config.js` à la racine :

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
  extraThemes: ["sky-light", "sky-dark", "ocean-light", "ocean-dark"],
});
```

`withUniwindConfig` doit rester le wrapper Metro le plus extérieur.

Le fichier `src/uniwind-types.d.ts` est généré par Metro. Il ne faut pas le modifier manuellement.

## 3. Configurer `global.css`

Créer `src/global.css` :

```css
@import "tailwindcss";
@import "uniwind";
@import "heroui-native/styles";
```

Avec HeroUI Native 1.0.8 ou supérieur, il n'est plus nécessaire d'ajouter manuellement :

```css
@source "../node_modules/heroui-native/lib";
```

## 4. Déclarer les thèmes personnalisés

Toutes les variantes doivent être placées dans le même bloc `:root` :

```css
@layer theme {
  :root {
    @variant light {
      /* variables propres au thème light */
    }

    @variant dark {
      /* variables propres au thème dark */
    }

    @variant sky-light {
      /* toutes les variables HeroUI */
    }

    @variant sky-dark {
      /* toutes les variables HeroUI */
    }

    @variant ocean-light {
      /* toutes les variables HeroUI */
    }

    @variant ocean-dark {
      /* toutes les variables HeroUI */
    }
  }
}
```

Ne jamais placer une variante personnalisée hors de `:root`. Une variante mal placée peut compiler sur le web, mais produire au runtime une erreur comme :

```text
TypeError: Cannot convert undefined value to object
vars.colorAccentHover
```

Chaque thème personnalisé doit définir la liste complète des variables HeroUI, notamment :

```css
--background: ...;
--foreground: ...;
--surface: ...;
--surface-foreground: ...;
--surface-secondary: ...;
--surface-secondary-foreground: ...;
--surface-tertiary: ...;
--surface-tertiary-foreground: ...;
--overlay: ...;
--overlay-foreground: ...;
--backdrop: ...;
--muted: ...;
--default: ...;
--default-foreground: ...;
--accent: ...;
--accent-foreground: ...;
--field-background: ...;
--field-foreground: ...;
--field-placeholder: ...;
--field-border: ...;
--success: ...;
--success-foreground: ...;
--warning: ...;
--warning-foreground: ...;
--danger: ...;
--danger-foreground: ...;
--segment: ...;
--segment-foreground: ...;
--border: ...;
--separator: ...;
--focus: ...;
--link: ...;
--surface-shadow: ...;
--overlay-shadow: ...;
--field-shadow: ...;
```

## 5. Police et rayon par thème

Si une variable est définie dans une variante, Uniwind exige qu'elle existe dans toutes les variantes. Chaque thème doit donc déclarer les quatre graisses et `--radius` :

```css
@variant light {
  --font-normal: "SpaceGrotesk_400Regular";
  --font-medium: "SpaceGrotesk_500Medium";
  --font-semibold: "SpaceGrotesk_600SemiBold";
  --font-bold: "SpaceGrotesk_700Bold";
  --radius: 0.5rem;
}

@variant sky-light {
  --font-normal: "SpaceGrotesk_400Regular";
  --font-medium: "SpaceGrotesk_500Medium";
  --font-semibold: "SpaceGrotesk_600SemiBold";
  --font-bold: "SpaceGrotesk_700Bold";
  --radius: 0.1rem;
}
```

Dans Dallico :

| Thème | Rayon |
| --- | --- |
| `light`, `dark` | `0.5rem` |
| `sky-light`, `sky-dark` | `0.1rem` |
| `ocean-light`, `ocean-dark` | `0.5rem` |

Une police différente peut être utilisée par thème. Il faut charger ses quatre fichiers dans le layout et remplacer les quatre noms dans chaque variante concernée. Toutes les variantes doivent néanmoins conserver les mêmes noms de variables.

## 6. Charger Space Grotesk et configurer les providers

Importer `global.css` depuis le layout racine Expo Router, pas depuis le fichier d'entrée `expo-router/entry`.

Exemple pour `src/app/_layout.tsx` :

```tsx
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import { useThemeColor } from "heroui-native/hooks";
import { useEffect } from "react";
import { Appearance } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUniwind } from "uniwind";

import "../global.css";

SplashScreen.preventAutoHideAsync();

const heroUIConfig = {
  devInfo: {
    stylingPrinciples: false,
  },
} as const;

export default function RootLayout() {
  const { theme } = useUniwind();
  const backgroundColor = useThemeColor("background");
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });
  const isDarkTheme = theme.endsWith("dark");

  // Synchronise le thème Uniwind avec les composants natifs iOS/Android.
  useEffect(() => {
    Appearance.setColorScheme(isDarkTheme ? "dark" : "light");
  }, [isDarkTheme]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor }}>
      <HeroUINativeProvider config={heroUIConfig}>
        <ThemeProvider value={isDarkTheme ? DarkTheme : DefaultTheme}>
          <StatusBar animated style={isDarkTheme ? "light" : "dark"} />
          {/* Navigateur Expo Router */}
        </ThemeProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
```

Points importants :

- `GestureHandlerRootView` doit entourer `HeroUINativeProvider`.
- Le rendu attend que les polices soient chargées.
- `theme.endsWith("dark")` couvre `dark`, `sky-dark` et `ocean-dark`.
- `Appearance.setColorScheme(...)` synchronise les composants natifs avec le thème Uniwind actif.
- `StatusBar` rend l'heure, la batterie et le réseau blancs en thème sombre.
- Le fond de `GestureHandlerRootView` évite une zone système blanche ou transparente sur Android.
- `devInfo.stylingPrinciples: false` masque uniquement le message de conseil HeroUI ; cela ne désactive pas les animations.

## 7. Utiliser les imports granulaires HeroUI

Préférer les points d'entrée par composant :

```tsx
import { Button } from "heroui-native/button";
```

Exemple :

```tsx
import { Button } from "heroui-native/button";
import { Text, View } from "react-native";

export function Example() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
      <Text className="text-3xl font-semibold text-foreground">
        Bonjour
      </Text>

      <Text className="text-base text-muted">
        Interface basée sur les tokens sémantiques HeroUI.
      </Text>

      <Button className="w-full" onPress={() => console.log("Pressed") }>
        Continuer
      </Button>
    </View>
  );
}
```

Utiliser les tokens sémantiques plutôt que des couleurs codées en dur :

```text
bg-background
text-foreground
bg-surface
text-surface-foreground
text-muted
bg-accent
text-accent-foreground
border-border
```

## 8. Changer de thème dans l'application

```tsx
import { Button } from "heroui-native/button";
import { Text, View } from "react-native";
import { Uniwind, useUniwind } from "uniwind";

const themeGroups = [
  {
    label: "Défaut",
    themes: [
      { name: "light", label: "Clair" },
      { name: "dark", label: "Sombre" },
    ],
  },
  {
    label: "Sky",
    themes: [
      { name: "sky-light", label: "Clair" },
      { name: "sky-dark", label: "Sombre" },
    ],
  },
  {
    label: "Ocean",
    themes: [
      { name: "ocean-light", label: "Clair" },
      { name: "ocean-dark", label: "Sombre" },
    ],
  },
] as const;

export function ThemeSwitcher() {
  const { theme } = useUniwind();

  return (
    <View className="gap-4 rounded-2xl bg-surface p-5">
      <Text className="text-muted">Thème actif : {theme}</Text>

      {themeGroups.map((group) => (
        <View key={group.label} className="gap-2">
          <Text className="font-medium text-muted">{group.label}</Text>
          <View className="flex-row gap-3">
            {group.themes.map(({ name, label }) => (
              <Button
                key={name}
                className="flex-1"
                variant={theme === name ? "primary" : "secondary"}
                onPress={() => Uniwind.setTheme(name)}
              >
                {label}
              </Button>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
```

Les thèmes personnalisés doivent aussi être présents dans `extraThemes` dans Metro.

## 9. Native Tabs et surbrillance Android

Pour conserver les icônes PNG tout en utilisant un indicateur HeroUI plus visible uniquement sur Android :

```tsx
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useThemeColor } from "heroui-native/hooks";
import { Platform } from "react-native";

export default function AppTabs() {
  const [background, indicator, foreground, accent] = useThemeColor([
    "background",
    "segment",
    "foreground",
    "accent",
  ]);

  return (
    <NativeTabs
      backgroundColor={background}
      disableTransparentOnScrollEdge
      indicatorColor={Platform.OS === "android" ? accent : indicator}
      labelStyle={{ selected: { color: foreground } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/home.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

`indicatorColor` contrôle l'indicateur Android. Le token `segment` peut être trop proche du fond en thème clair ; `accent` offre un contraste plus visible.

Sur iOS, `NativeTabs` repose également sur l'apparence native du système. Changer uniquement le thème Uniwind ou le `ThemeProvider` Expo Router peut provoquer un flash blanc de la barre d'onglets lors d'un changement d'écran, jusqu'au prochain scroll. Il faut conserver la synchronisation suivante dans le layout racine :

```tsx
useEffect(() => {
  Appearance.setColorScheme(isDarkTheme ? "dark" : "light");
}, [isDarkTheme]);
```

`disableTransparentOnScrollEdge` évite en complément que la barre adopte automatiquement une apparence transparente au bord d'une liste. Après cette modification, fermer puis rouvrir Expo Go et redémarrer Metro avec `bunx expo start --clear`.

## 10. Retirer proprement le thème du template Expo

Après migration vers Uniwind/HeroUI, supprimer les anciens fichiers uniquement quand plus aucun import ne les utilise :

```text
src/constants/theme.ts
src/components/themed-text.tsx
src/components/themed-view.tsx
src/hooks/use-theme.ts
src/hooks/use-color-scheme.ts
src/hooks/use-color-scheme.web.ts
```

Remplacer :

```tsx
<ThemedView type="backgroundElement">
  <ThemedText themeColor="textSecondary">Texte</ThemedText>
</ThemedView>
```

par :

```tsx
<View className="bg-surface">
  <Text className="text-muted">Texte</Text>
</View>
```

Pour une API native qui exige une couleur JavaScript, utiliser `useThemeColor` :

```tsx
import { useThemeColor } from "heroui-native/hooks";

const backgroundColor = useThemeColor("background");
```

## 11. Dépannage

### `All themes must have the same variables`

Cause : une variable comme `--font-medium` ou `--radius` existe seulement dans certaines variantes.

Correction : déclarer la même liste de variables dans **tous** les thèmes. Les valeurs peuvent différer.

### `vars.colorAccentHover` ou valeur indéfinie

Causes possibles :

- une variante est hors du bloc `:root` ;
- un thème personnalisé ne contient pas toutes les variables HeroUI ;
- Metro utilise encore un ancien cache.

Vérifier la structure CSS, puis lancer :

```bash
bunx expo start --clear
```

### Route Expo Router annoncée sans export par défaut

Si le fichier exporte pourtant bien un composant par défaut, chercher d'abord une exception lors du chargement d'un module importé. Dans ce projet, une version incompatible de `react-native-worklets` faisait échouer `react-native-reanimated`, puis Expo Router affichait un avertissement trompeur sur les routes.

```bash
bunx expo install --check
```

### Heure et batterie invisibles en mode sombre

Ajouter :

```tsx
<StatusBar animated style={isDarkTheme ? "light" : "dark"} />
```

et appliquer la couleur du thème au conteneur racine.

### Flash blanc de la barre d'onglets iOS après un changement de thème

Ce comportement correspond au bug Expo Router accepté [expo/expo#40389](https://github.com/expo/expo/issues/40389) : sur iOS, un onglet peut repasser visuellement en mode clair après un aller-retour entre les tabs, alors que le reste de l'application demeure sombre. Android n'est pas affecté dans le cas reproduit par l'issue.

Cause côté application : le thème React/Uniwind est sombre, mais l'apparence native iOS peut encore être claire pendant la transition de `NativeTabs`.

Contournement : envelopper le navigateur dans le `ThemeProvider` Expo Router, appeler `Appearance.setColorScheme(isDarkTheme ? "dark" : "light")` dans un `useEffect` du layout racine et utiliser `disableTransparentOnScrollEdge` sur `NativeTabs`.

## 12. Validation finale

Toujours exécuter :

```bash
bunx expo install --check
bunx expo lint
bunx tsc --noEmit
```

Pour vérifier aussi le traitement CSS et le rendu statique web :

```bash
bunx expo export --platform web
```

Puis redémarrer le développement avec un cache propre :

```bash
bunx expo start --clear
```

## Documentation officielle

- Uniwind Quickstart : https://docs.uniwind.dev/quickstart
- Uniwind Global CSS : https://docs.uniwind.dev/theming/global-css
- HeroUI Native Theming : https://heroui.com/en/docs/native/getting-started/theming
- Expo Fonts : https://docs.expo.dev/develop/user-interface/fonts/
- Expo StatusBar SDK 57 : https://docs.expo.dev/versions/v57.0.0/sdk/status-bar/
- Expo Router Native Tabs : https://docs.expo.dev/router/advanced/native-tabs/
- React Native Appearance : https://reactnative.dev/docs/appearance
- Issue Expo Router NativeTabs iOS #40389 : https://github.com/expo/expo/issues/40389
- Discussion Expo NativeTabs dark mode : https://www.reddit.com/r/expo/comments/1pa82y2/nativetabs_dark_mode_issue/
