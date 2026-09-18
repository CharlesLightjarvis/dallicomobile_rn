export const queryKeys = {
  levels: { all: ["levels"] as const, list: () => ["levels", "list"] as const },
  chapters: { all: ["chapters"] as const, list: (level: string) => ["chapters", level] as const },
  lessons: {
    all: ["lessons"] as const,
    list: (chapter: string) => ["lessons", "list", chapter] as const,
    detail: (lesson: string) => ["lessons", "detail", lesson] as const,
  },
  progress: { all: ["progress"] as const },
};
