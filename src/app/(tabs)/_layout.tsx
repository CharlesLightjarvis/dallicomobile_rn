import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useThemeColor } from "heroui-native/hooks";

export default function TabsLayout() {
  const [background, foreground, accent] = useThemeColor([
    "background",
    "foreground",
    "accent",
  ]);

  return (
    <NativeTabs
      backgroundColor={background}
      labelVisibilityMode="labeled"
      tintColor={process.env.EXPO_OS === "ios" ? accent : undefined}
      labelStyle={{
        selected: {
          color: foreground,
        },
      }}
    >
      {/* <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={{
            default: require("@/assets/images/tabIcons/sofa-outline.png"),
            selected: require("@/assets/images/tabIcons/sofa-filled.png"),
          }}
          renderingMode="template"
        />
      </NativeTabs.Trigger> */}

      <NativeTabs.Trigger name="(learn)">
        <NativeTabs.Trigger.Label>Apprendre</NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={{
            default: require("@/assets/images/tabIcons/book-outline.png"),
            selected: require("@/assets/images/tabIcons/book-filled.png"),
          }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="practice">
        <NativeTabs.Trigger.Label>Pratiquer</NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={{
            default: require("@/assets/images/tabIcons/dumbbell2-outline.png"),
            selected: require("@/assets/images/tabIcons/dumbbell2-filled.png"),
          }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="games">
        <NativeTabs.Trigger.Label>Jeux</NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={{
            default: require("@/assets/images/tabIcons/gameboy-outline.png"),
            selected: require("@/assets/images/tabIcons/gameboy-filled.png"),
          }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={{
            default: require("@/assets/images/tabIcons/address-book-outline.png"),
            selected: require("@/assets/images/tabIcons/address-book-filled.png"),
          }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
