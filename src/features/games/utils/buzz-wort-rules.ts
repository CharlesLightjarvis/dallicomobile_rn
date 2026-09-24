export const BUZZ_WORT_MATCH_WORDS = 10;
export const BUZZ_WORT_TRANSLATION_SECONDS = 15;
export const BUZZ_WORT_BONUS_SECONDS = 15;
export const BUZZ_WORT_STEAL_SECONDS = 10;
export const BUZZ_WORT_REVEAL_SECONDS = 3;

export function getBuzzWortLeaders(scores: Record<string, number>) {
  const highestScore = Math.max(...Object.values(scores));

  return Object.entries(scores)
    .filter(([, score]) => score === highestScore)
    .map(([playerId]) => playerId);
}

export function getEligibleBuzzWortPlayers(
  playerIds: string[],
  lockedPlayerIds: string[],
  allowedPlayerIds?: string[],
) {
  return playerIds.filter(
    (playerId) =>
      !lockedPlayerIds.includes(playerId) &&
      (!allowedPlayerIds || allowedPlayerIds.includes(playerId)),
  );
}
