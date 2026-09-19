export type VocabularyExercise =
  | {
      id: string;
      type: "choice";
      instruction: string;
      prompt: string;
      answer: string;
      choices: string[];
      explanation?: string;
    }
  | {
      id: string;
      type: "reverse";
      instruction: string;
      prompt: string;
      answer: string;
      choices: string[];
      explanation?: string;
    }
  | {
      id: string;
      type: "input";
      instruction: string;
      prompt: string;
      answer: string;
      placeholder?: string;
      explanation?: string;
    }
  | {
      id: string;
      type: "listen";
      instruction: string;
      audioText: string;
      answer: string;
      choices: string[];
      explanation?: string;
    };

export type VocabularySession = {
  id: string;
  title: string;
  subtitle: string;
  exercises: VocabularyExercise[];
};

export const VOCABULARY_SESSIONS: Record<string, VocabularySession> = {
  airport: {
    id: "airport",
    title: "À l'aéroport",
    subtitle: "Voyage, bagages et embarquement",
    exercises: [
      {
        id: "airport-1",
        type: "choice",
        instruction: "FRANÇAIS → ALLEMAND",
        prompt: "la valise",
        answer: "der Koffer",
        choices: ["der Koffer", "der Pass", "das Flugzeug", "der Flughafen"],
        explanation: "Koffer est masculin : der Koffer.",
      },

      {
        id: "airport-2",
        type: "reverse",
        instruction: "ALLEMAND → FRANÇAIS",
        prompt: "der Flughafen",
        answer: "l'aéroport",
        choices: ["la gare", "l'aéroport", "l'avion", "le passeport"],
        explanation: "Flughafen signifie « aéroport ».",
      },

      {
        id: "airport-3",
        type: "input",
        instruction: "COMPLÈTE",
        prompt: "Ich habe meinen ______ verloren.",
        answer: "Pass",
        placeholder: "Écris le mot allemand…",
        explanation: "mein Pass = mon passeport.",
      },

      {
        id: "airport-4",
        type: "listen",
        instruction: "ÉCOUTE",
        audioText: "das Gepäck",
        answer: "les bagages",
        choices: ["les bagages", "le billet", "la porte", "la douane"],
        explanation: "das Gepäck signifie « les bagages ».",
      },

      {
        id: "airport-5",
        type: "choice",
        instruction: "FRANÇAIS → ALLEMAND",
        prompt: "l'avion",
        answer: "das Flugzeug",
        choices: ["der Flug", "das Flugzeug", "der Ausgang", "das Ticket"],
        explanation: "Flugzeug est neutre : das Flugzeug.",
      },

      {
        id: "airport-6",
        type: "reverse",
        instruction: "ALLEMAND → FRANÇAIS",
        prompt: "der Ausgang",
        answer: "la sortie",
        choices: [
          "l'entrée",
          "la sortie",
          "la porte d'embarquement",
          "le contrôle",
        ],
      },
    ],
  },
};
