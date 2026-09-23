import type { BuzzWortPlayer, BuzzWortQuestion } from "../types/buzz-wort";

export const BUZZ_WORT_PLAYERS: BuzzWortPlayer[] = [
  {
    id: "maya",
    name: "Maya",
    avatarIcon: "sparkles",
    color: "#E99B68",
  },
  {
    id: "lucas",
    name: "Lucas",
    avatarIcon: "happy",
    color: "#7EB5D6",
  },
  {
    id: "sarah",
    name: "Sarah",
    avatarIcon: "person-circle",
    color: "#C58BEA",
  },
  {
    id: "william",
    name: "William",
    avatarIcon: "person",
    color: "#F4C95D",
  },
];

export const BUZZ_WORT_QUESTIONS: BuzzWortQuestion[] = [
  {
    id: "fahren",
    word: "fahren",
    translation: "conduire",
    acceptedTranslations: ["conduire", "aller", "se déplacer"],
    translationChoices: ["conduire", "manger", "attendre", "réserver"],
    bonuses: [
      {
        label: "Ce verbe est…",
        choices: ["Fort", "Faible"],
        correctAnswer: "Fort",
      },
      {
        label: "Complète : er …",
        choices: ["fahrt", "fährt", "gefahrt", "fahren"],
        correctAnswer: "fährt",
      },
    ],
  },
  {
    id: "tisch",
    word: "Tisch",
    translation: "table",
    acceptedTranslations: ["table"],
    translationChoices: ["table", "chaise", "porte", "fenêtre"],
    bonuses: [
      {
        label: "Quel est son article ?",
        choices: ["der", "die", "das", "den"],
        correctAnswer: "der",
      },
      {
        label: "Quel est son pluriel ?",
        choices: ["die Tischen", "die Tische", "die Tischer", "die Tisch"],
        correctAnswer: "die Tische",
      },
    ],
  },
  {
    id: "bestellen",
    word: "bestellen",
    translation: "commander",
    acceptedTranslations: ["commander", "passer commande"],
    translationChoices: ["commander", "payer", "écouter", "partir"],
    bonuses: [
      {
        label: "Ce verbe est…",
        choices: ["Fort", "Faible"],
        correctAnswer: "Faible",
      },
      {
        label: "Complète : er …",
        choices: ["bestellt", "bestelltet", "bestellen", "bestellte"],
        correctAnswer: "bestellt",
      },
    ],
  },
];
