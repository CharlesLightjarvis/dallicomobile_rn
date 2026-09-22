import { Chip } from "heroui-native/chip";
import { useThemeColor } from "heroui-native/hooks";
import { useMemo } from "react";
import { Linking, Text, View } from "react-native";
import Markdown, {
  blockPlugin,
  PluginContainer,
  type MarkdownStyles,
  type RenderRules,
} from "react-native-markdown-renderer";

type LessonMarkdownProps = {
  content: string;
};

const LANGUAGE_FLAGS: Record<string, string> = {
  DE: "🇩🇪",
  EN: "🇬🇧",
  FR: "🇫🇷",
};

const NOTICE_TYPES = ["danger", "info", "success", "warning"] as const;

type NoticeType = (typeof NOTICE_TYPES)[number];

const MARKDOWN_PLUGINS = [
  new PluginContainer(blockPlugin, "notice", {
    marker: ":::",
    marker_end: ":::",
    validate: (params: string) =>
      NOTICE_TYPES.includes(params.trim().split(/\s+/, 1)[0] as NoticeType),
  }),
];

function getNoticeType(sourceInfo: string): NoticeType {
  const type = sourceInfo.trim().split(/\s+/, 1)[0] as NoticeType;

  return NOTICE_TYPES.includes(type) ? type : "info";
}

export function LessonMarkdown({ content }: LessonMarkdownProps) {
  const [
    foreground,
    muted,
    accent,
    surface,
    surfaceSecondary,
    surfaceTertiary,
    border,
    link,
    accentSoft,
    dangerSoft,
    successSoft,
    warningSoft,
  ] = useThemeColor([
    "foreground",
    "muted",
    "accent",
    "surface",
    "surface-secondary",
    "surface-tertiary",
    "border",
    "link",
    "accent-soft",
    "danger-soft",
    "success-soft",
    "warning-soft",
  ]);

  const rules = useMemo<RenderRules>(
    () => ({
      strong: (node, children, parentNodes) => {
        const isWarning = parentNodes.some((parent) => parent.type === "em");

        return (
          <Chip
            key={node.key}
            animation="disable-all"
            color={isWarning ? "warning" : "danger"}
            size="sm"
            variant="secondary"
          >
            <Chip.Label>{children}</Chip.Label>
          </Chip>
        );
      },
      em: (node, children) => {
        const wrapsStrong = node.children.some(
          (child) => child.type === "strong",
        );

        if (wrapsStrong) {
          return children;
        }

        return (
          <Text key={node.key} style={{ color: muted, fontStyle: "italic" }}>
            {children}
          </Text>
        );
      },
      text: (node) => {
        const language = node.content.match(/^(DE|FR|EN):\s*/);

        if (!language) {
          return <Text key={node.key}>{node.content}</Text>;
        }

        const languageCode = language[1];

        return (
          <Text key={node.key}>
            {LANGUAGE_FLAGS[languageCode]}{" "}
            {node.content.slice(language[0].length)}
          </Text>
        );
      },
      container_notice: (node, children) => {
        const type = getNoticeType(node.sourceInfo);
        const backgrounds: Record<NoticeType, string> = {
          danger: dangerSoft,
          info: accentSoft,
          success: successSoft,
          warning: warningSoft,
        };

        return (
          <View
            key={node.key}
            className="mb-4 rounded-2xl p-1"
            style={{
              backgroundColor: backgrounds[type],
              borderCurve: "continuous",
            }}
          >
            {children}
          </View>
        );
      },
    }),
    [accentSoft, dangerSoft, muted, successSoft, warningSoft],
  );

  const styles = useMemo<Partial<MarkdownStyles>>(
    () => ({
      root: {
        color: foreground,
        fontFamily: "SpaceGrotesk_400Regular",
        width: "100%",
      },
      text: {
        color: foreground,
        fontFamily: "SpaceGrotesk_400Regular",
        fontSize: 16,
        lineHeight: 25,
        textAlign: "justify",
      },
      heading: {
        color: foreground,
        fontFamily: "SpaceGrotesk_600SemiBold",
      },
      heading1: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 28,
        lineHeight: 34,
      },
      heading1Container: {
        borderBottomColor: border,
        borderBottomWidth: 1,
        marginBottom: 18,
        paddingBottom: 12,
      },
      heading2: {
        color: accent,
        fontSize: 21,
        lineHeight: 28,
      },
      heading2Container: {
        borderBottomColor: border,
        borderBottomWidth: 1,
        marginBottom: 10,
        marginTop: 20,
        paddingBottom: 8,
      },
      heading3: {
        fontSize: 18,
        lineHeight: 25,
      },
      heading3Container: {
        marginBottom: 8,
        marginTop: 16,
      },
      paragraph: {
        marginBottom: 12,
        marginTop: 0,
        textAlign: "justify",
      },
      blockquote: {
        borderLeftWidth: 0,
        marginLeft: 0,
        paddingLeft: 0,
      },
      strong: {
        color: foreground,
        fontFamily: "SpaceGrotesk_600SemiBold",
      },
      em: {
        color: muted,
        fontStyle: "italic",
      },
      list: {
        marginBottom: 14,
      },
      listUnorderedItemText: {
        color: foreground,
        fontFamily: "SpaceGrotesk_400Regular",
        fontSize: 16,
        lineHeight: 25,
        textAlign: "justify",
      },
      listOrderedItemText: {
        color: foreground,
        fontFamily: "SpaceGrotesk_400Regular",
        fontSize: 16,
        lineHeight: 25,
        textAlign: "justify",
      },
      listUnorderedItemIcon: {
        color: accent,
      },
      listOrderedItemIcon: {
        color: accent,
      },
      table: {
        backgroundColor: surface,
        borderColor: border,
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 18,
        overflow: "hidden",
        width: "100%",
      },
      tableHeader: {
        backgroundColor: surfaceSecondary,
      },
      tableHeaderCell: {
        alignItems: "center",
        borderColor: border,
        color: foreground,
        fontFamily: "SpaceGrotesk_600SemiBold",
        paddingHorizontal: 8,
        paddingVertical: 10,
      },
      tableRow: {
        borderColor: border,
        borderTopWidth: 1,
      },
      tableRowCell: {
        alignItems: "center",
        borderColor: border,
        color: foreground,
        fontFamily: "SpaceGrotesk_400Regular",
        paddingHorizontal: 8,
        paddingVertical: 10,
        textAlign: "justify",
      },
      link: {
        color: link,
        fontFamily: "SpaceGrotesk_600SemiBold",
        textDecorationLine: "underline",
      },
      codeInline: {
        backgroundColor: surfaceSecondary,
        borderRadius: 6,
        color: accent,
        fontFamily: process.env.EXPO_OS === "ios" ? "Menlo" : "monospace",
        paddingHorizontal: 5,
        paddingVertical: 2,
      },
      codeBlock: {
        backgroundColor: surfaceTertiary,
        borderColor: border,
        borderRadius: 12,
        borderWidth: 1,
        color: foreground,
        fontFamily: process.env.EXPO_OS === "ios" ? "Menlo" : "monospace",
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 18,
        padding: 16,
      },
      pre: {
        marginBottom: 18,
      },
      hr: {
        backgroundColor: border,
        height: 1,
        marginBottom: 20,
        marginTop: 8,
      },
      image: {
        borderRadius: 12,
        marginBottom: 18,
      },
    }),
    [
      accent,
      border,
      foreground,
      link,
      muted,
      surface,
      surfaceSecondary,
      surfaceTertiary,
    ],
  );

  function openSafeLink(url: string): void {
    if (!url.toLowerCase().startsWith("https://")) {
      return;
    }

    void Linking.openURL(url).catch(() => undefined);
  }

  return (
    <Markdown
      plugins={MARKDOWN_PLUGINS}
      rules={rules}
      style={styles}
      allowedImageHandlers={["https://"]}
      defaultImageHandler={null}
      onLinkPress={openSafeLink}
    >
      {content}
    </Markdown>
  );
}
