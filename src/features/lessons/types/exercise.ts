export type Exercise = {
  id: string;
  exercise_type: "mcq" | "fill_blank" | "transformation";
  question: string;
  options: string[] | null;
};

export type ExerciseAttemptResult = {
  attempt_id: string;
  is_correct: boolean;
  correct_answer: string | null;
  explanation: string | null;
  lesson_progress: number;
};
