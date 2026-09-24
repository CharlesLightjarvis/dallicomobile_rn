export type BuzzWortPhase =
  | "buzz"
  | "translation"
  | "bonus-buzz"
  | "bonus"
  | "reveal"
  | "finished";

export type BuzzWortPlayer = {
  id: string;
  name: string;
  avatarIcon: "person" | "person-circle" | "happy" | "sparkles";
  color: string;
};

export type BuzzWortBonus = {
  label: string;
  choices: string[];
  correctAnswer: string;
};

export type BuzzWortQuestion = {
  id: string;
  word: string;
  translation: string;
  acceptedTranslations: string[];
  translationChoices: string[];
  bonuses: BuzzWortBonus[];
};
