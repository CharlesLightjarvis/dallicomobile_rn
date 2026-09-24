import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { NavigationBar } from "expo-navigation-bar";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { withUniwind } from "uniwind";

import { GameBuzzer } from "@/components/ui/game-buzzer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BUZZ_WORT_PLAYERS,
  BUZZ_WORT_QUESTIONS,
} from "../data/buzz-wort-round";
import type { BuzzWortPhase } from "../types/buzz-wort";

const StyledLinearGradient = withUniwind(LinearGradient);
const StyledAnimatedView = withUniwind(Animated.View);

const C = {
  bg: "#090C1C",
  navy: "#121735",
  navy2: "#171D3F",
  card: "#252C61",
  card2: "#141A3D",
  gold: "#FFB703",
  amber: "#FB8500",
  cyan: "#00E5FF",
  emerald: "#06D6A0",
  crimson: "#EF476F",
  purple: "#7B2CBF",
  white: "#FFFFFF",
  muted: "#A7AEC9",
};

const BUZZER_ACCENTS: Record<string, string> = {
  maya: "#F4141C",
  lucas: "#FFB703",
  sarah: "#8B5CF6",
  william: "#22D3EE",
};

const INITIAL_SCORES = Object.fromEntries(
  BUZZ_WORT_PLAYERS.map((player) => [player.id, 0]),
);

const AVATARS = ["👾", "🐸", "🦊", "😼"];
const REACTIONS = ["😂", "🔥", "😱"];
const CENTER_ANSWER_PLACEHOLDER = "— — —";

type HistoryTone = "neutral" | "buzz" | "success" | "danger" | "bonus";

type HistoryEvent = {
  id: number;
  tone: HistoryTone;
  text: string;
};

type CenterTone = "buzz" | "success" | "danger" | "bonus";

type CenterMoment = {
  tone: CenterTone;
  playerId: string | null;
  label: string;
  value: string;
  detail?: string;
};

function rgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const n = parseInt(value, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function BuzzWortScreen() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<BuzzWortPhase>("buzz");
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [buzzedPlayerIds, setBuzzedPlayerIds] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [bonusIndex, setBonusIndex] = useState(0);
  const [generalTime, setGeneralTime] = useState(60);
  const [playerTime, setPlayerTime] = useState(15);
  const [scores, setScores] = useState<Record<string, number>>(INITIAL_SCORES);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [nextWordCountdown, setNextWordCountdown] = useState(3);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [centerMoment, setCenterMoment] = useState<CenterMoment | null>(null);
  const [centerVfxKind, setCenterVfxKind] = useState<CenterTone | null>(null);
  const [centerVfxPlayerId, setCenterVfxPlayerId] = useState<string | null>(
    null,
  );

  const [floatAnim] = useState(() => new Animated.Value(0));
  const [pulseAnim] = useState(() => new Animated.Value(0));
  const [activePulse] = useState(() => new Animated.Value(0));
  const [reactionArcAnim] = useState(() => new Animated.Value(0));
  const [historyShiftAnim] = useState(() => new Animated.Value(1));
  const [centerVfxAnim] = useState(() => new Animated.Value(0));
  const [questionTransitionAnim] = useState(() => new Animated.Value(1));
  const historyIdRef = useRef(0);
  const centerVfxTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const insets = useSafeAreaInsets();

  const question = BUZZ_WORT_QUESTIONS[questionIndex];

  const localPlayer = BUZZ_WORT_PLAYERS[3];
  const isLocalTurn = activePlayerId === localPlayer?.id;

  const getPlayerAccent = useCallback(
    (playerId: string | null | undefined) =>
      (playerId ? BUZZER_ACCENTS[playerId] : undefined) ?? C.gold,
    [],
  );

  const playCenterVfx = useCallback(
    (tone: CenterTone, playerId: string | null = null) => {
      setCenterVfxKind(tone);
      setCenterVfxPlayerId(playerId);
      centerVfxAnim.stopAnimation();
      centerVfxAnim.setValue(0);

      Animated.timing(centerVfxAnim, {
        toValue: 1,
        duration: 820,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      if (centerVfxTimeoutRef.current) {
        clearTimeout(centerVfxTimeoutRef.current);
      }

      centerVfxTimeoutRef.current = setTimeout(() => {
        setCenterVfxKind(null);
        setCenterVfxPlayerId(null);
        centerVfxTimeoutRef.current = null;
      }, 900);
    },
    [centerVfxAnim],
  );

  useEffect(
    () => () => {
      if (centerVfxTimeoutRef.current) {
        clearTimeout(centerVfxTimeoutRef.current);
      }
    },
    [],
  );

  const pushHistory = useCallback(
    (event: Omit<HistoryEvent, "id">) => {
      const eventId = historyIdRef.current + 1;
      historyIdRef.current = eventId;

      setHistoryEvents((current) => [
        ...current.slice(-7),
        {
          id: eventId,
          ...event,
        },
      ]);

      historyShiftAnim.stopAnimation();
      historyShiftAnim.setValue(0);

      Animated.timing(historyShiftAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [historyShiftAnim],
  );

  useEffect(() => {
    pushHistory({
      tone: "neutral",
      text: `Nouveau mot · ${question.word}`,
    });
  }, [pushHistory, question.word]);

  useFocusEffect(
    useCallback(() => {
      if (process.env.EXPO_OS === "android") {
        void NavigationBar.setHidden(true);
      }
      StatusBar.setHidden(true, "fade");

      return () => {
        if (process.env.EXPO_OS === "android") {
          void NavigationBar.setHidden(false);
        }
        StatusBar.setHidden(false, "fade");
      };
    }, []),
  );

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    floatLoop.start();
    pulseLoop.start();

    return () => {
      floatLoop.stop();
      pulseLoop.stop();
    };
  }, [floatAnim, pulseAnim]);

  useEffect(() => {
    if (!activePlayerId) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(activePulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(activePulse, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [activePlayerId, activePulse]);

  useEffect(() => {
    if (phase === "reveal") return;

    const timer = setInterval(() => {
      if (phase === "buzz") {
        setGeneralTime((value) => {
          if (value <= 1) {
            setFeedback(`Réponse : ${question.translation}`);
            setCenterMoment({
              tone: "danger",
              playerId: null,
              label: "TEMPS ÉCOULÉ",
              value: question.translation,
              detail: question.word,
            });
            playCenterVfx("danger");
            pushHistory({
              tone: "danger",
              text: `Temps écoulé · réponse : ${question.translation}`,
            });
            setPhase("reveal");
            return 0;
          }

          return value - 1;
        });
      } else {
        setPlayerTime((value) => {
          if (value <= 1) {
            const timedOutPlayer = BUZZ_WORT_PLAYERS.find(
              (player) => player.id === activePlayerId,
            );

            if (activePlayerId) {
              setBuzzedPlayerIds((current) =>
                current.includes(activePlayerId)
                  ? current
                  : [...current, activePlayerId],
              );
            }

            pushHistory({
              tone: "danger",
              text: `${timedOutPlayer?.name ?? "Le joueur"} n'a pas répondu à temps`,
            });

            setCenterMoment({
              tone: "danger",
              playerId: activePlayerId,
              label: "TEMPS ÉCOULÉ",
              value: timedOutPlayer?.name ?? "Joueur",
              detail: "Buzz consommé",
            });
            playCenterVfx("danger", activePlayerId);

            setFeedback("Temps écoulé · buzz consommé");
            setPhase("buzz");
            setActivePlayerId(null);
            setSelectedChoice(null);
            setTypedAnswer("");

            return 15;
          }

          return value - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    phase,
    activePlayerId,
    playCenterVfx,
    pushHistory,
    question.translation,
    question.word,
  ]);

  const resetQuestion = useCallback(
    (nextIndex: number) => {
      setQuestionIndex(nextIndex);
      setPhase("buzz");
      setActivePlayerId(null);
      setBuzzedPlayerIds([]);
      setSelectedChoice(null);
      setBonusIndex(0);
      setGeneralTime(60);
      setPlayerTime(15);
      setNextWordCountdown(3);
      setFeedback(null);
      setTypedAnswer("");
      setCenterMoment(null);
      setCenterVfxKind(null);
      setCenterVfxPlayerId(null);
      if (centerVfxTimeoutRef.current) {
        clearTimeout(centerVfxTimeoutRef.current);
        centerVfxTimeoutRef.current = null;
      }
      centerVfxAnim.stopAnimation();
      centerVfxAnim.setValue(0);
    },
    [centerVfxAnim],
  );

  const handleBuzz = (playerId: string) => {
    if (phase !== "buzz" || buzzedPlayerIds.includes(playerId)) return;

    const player = BUZZ_WORT_PLAYERS.find(
      (candidate) => candidate.id === playerId,
    );

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    pushHistory({
      tone: "buzz",
      text: `${player?.name ?? "Un joueur"} a buzzé`,
    });

    setCenterMoment({
      tone: "buzz",
      playerId,
      label: `${player?.name ?? "JOUEUR"} A BUZZÉ`,
      value: question.word,
      detail:
        playerId === localPlayer.id ? "À toi de répondre" : "Réponse en cours…",
    });
    playCenterVfx("buzz", playerId);

    setActivePlayerId(playerId);
    setPlayerTime(15);
    setSelectedChoice(null);
    setTypedAnswer("");
    setFeedback(null);
    setPhase("translation");
  };

  const failCurrentBuzz = (message: string) => {
    if (!activePlayerId) return;

    const failedPlayer = BUZZ_WORT_PLAYERS.find(
      (player) => player.id === activePlayerId,
    );

    const updatedBuzzedPlayers = Array.from(
      new Set([...buzzedPlayerIds, activePlayerId]),
    );

    pushHistory({
      tone: "danger",
      text: `${failedPlayer?.name ?? "Le joueur"} · ${message}`,
    });

    setBuzzedPlayerIds(updatedBuzzedPlayers);
    setActivePlayerId(null);
    setSelectedChoice(null);
    setTypedAnswer("");
    setFeedback(message);

    if (updatedBuzzedPlayers.length === BUZZ_WORT_PLAYERS.length) {
      pushHistory({
        tone: "neutral",
        text: `Réponse : ${question.translation}`,
      });
      setPhase("reveal");
    } else {
      setPhase("buzz");
    }
  };

  const handleTranslation = (answer?: string) => {
    if (!activePlayerId) return;

    const answeringPlayer = BUZZ_WORT_PLAYERS.find(
      (player) => player.id === activePlayerId,
    );

    const finalAnswer = (answer ?? selectedChoice ?? typedAnswer).trim();
    if (!finalAnswer) return;

    pushHistory({
      tone: "neutral",
      text: `${answeringPlayer?.name ?? "Le joueur"} a répondu « ${finalAnswer} »`,
    });

    const isCorrect = question.acceptedTranslations.some(
      (candidate) => candidate.toLowerCase() === finalAnswer.toLowerCase(),
    );

    if (isCorrect) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setCenterMoment({
        tone: "success",
        playerId: activePlayerId,
        label: "BONNE RÉPONSE",
        value: finalAnswer,
        detail: `${question.word} = ${question.translation}`,
      });
      playCenterVfx("success", activePlayerId);

      setScores((current) => ({
        ...current,
        [activePlayerId]: current[activePlayerId] + 1,
      }));

      pushHistory({
        tone: "success",
        text: `Bonne réponse · ${answeringPlayer?.name ?? "Joueur"} +1 pt`,
      });

      setSelectedChoice(null);
      setTypedAnswer("");
      setBonusIndex(0);
      setPlayerTime(15);
      setFeedback("Bonne traduction · +1 pt");
      setPhase("bonus");
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setCenterMoment({
      tone: "danger",
      playerId: activePlayerId,
      label: "MAUVAISE RÉPONSE",
      value: finalAnswer,
      detail: `${answeringPlayer?.name ?? "Le joueur"} passe`,
    });
    playCenterVfx("danger", activePlayerId);
    failCurrentBuzz("mauvaise réponse · buzz consommé");
  };

  const handleBonus = () => {
    if (!selectedChoice || !activePlayerId) return;

    const answeringPlayer = BUZZ_WORT_PLAYERS.find(
      (player) => player.id === activePlayerId,
    );

    const bonus = question.bonuses[bonusIndex];

    pushHistory({
      tone: "bonus",
      text: `${answeringPlayer?.name ?? "Le joueur"} · ${selectedChoice}`,
    });

    if (selectedChoice !== bonus.correctAnswer) {
      pushHistory({
        tone: "danger",
        text: `Bonus raté · réponse : ${bonus.correctAnswer}`,
      });

      setCenterMoment({
        tone: "danger",
        playerId: activePlayerId,
        label: "BONUS RATÉ",
        value: selectedChoice,
        detail: `Réponse : ${bonus.correctAnswer}`,
      });
      playCenterVfx("danger", activePlayerId);

      setFeedback(`Réponse : ${bonus.correctAnswer}`);
      setPhase("reveal");
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setCenterMoment({
      tone: "bonus",
      playerId: activePlayerId,
      label: "BONUS RÉUSSI",
      value: selectedChoice,
      detail: "+1 pt",
    });
    playCenterVfx("bonus", activePlayerId);

    setScores((current) => ({
      ...current,
      [activePlayerId]: current[activePlayerId] + 1,
    }));

    pushHistory({
      tone: "success",
      text: `Bonus réussi · ${answeringPlayer?.name ?? "Joueur"} +1 pt`,
    });

    if (bonusIndex < question.bonuses.length - 1) {
      setBonusIndex((value) => value + 1);
      setSelectedChoice(null);
      setPlayerTime(15);
      setFeedback("Bonus réussi · +1 pt");
    } else {
      setSelectedChoice(null);
      setFeedback("Mot maîtrisé · +3 maximum");
      pushHistory({
        tone: "success",
        text: `${answeringPlayer?.name ?? "Le joueur"} maîtrise le mot`,
      });
      setPhase("reveal");
    }
  };

  const toggleReactions = () => {
    const nextOpen = !reactionsOpen;
    setReactionsOpen(nextOpen);
    void Haptics.selectionAsync();

    reactionArcAnim.stopAnimation();
    Animated.spring(reactionArcAnim, {
      toValue: nextOpen ? 1 : 0,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
  };

  const handleReaction = () => {
    void Haptics.selectionAsync();
    setReactionsOpen(false);

    reactionArcAnim.stopAnimation();
    Animated.spring(reactionArcAnim, {
      toValue: 0,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
  };

  const nextQuestionIndex = (questionIndex + 1) % BUZZ_WORT_QUESTIONS.length;

  useEffect(() => {
    if (phase !== "reveal") return;

    const timeout = setTimeout(() => {
      if (nextWordCountdown > 1) {
        setNextWordCountdown((value) => value - 1);
        return;
      }

      Animated.timing(questionTransitionAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;

        resetQuestion(nextQuestionIndex);
        questionTransitionAnim.setValue(0);
        Animated.spring(questionTransitionAnim, {
          toValue: 1,
          friction: 8,
          tension: 90,
          useNativeDriver: true,
        }).start();
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    nextQuestionIndex,
    nextWordCountdown,
    phase,
    questionTransitionAnim,
    resetQuestion,
  ]);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-22, -26],
  });
  const glowScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1.04],
  });
  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.78, 0.42],
  });
  const activeGlow = activePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.95],
  });
  const questionTransitionScale = questionTransitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1],
  });
  const questionTransitionRotate = questionTransitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-8deg", "0deg"],
  });

  const activePlayer = activePlayerId
    ? BUZZ_WORT_PLAYERS.find((player) => player.id === activePlayerId)
    : null;
  const centerCardScale = centerVfxAnim.interpolate({
    inputRange: [0, 0.18, 0.42, 1],
    outputRange: [1, 1.07, 0.985, 1],
  });
  const centerVfxOpacity = centerVfxAnim.interpolate({
    inputRange: [0, 0.08, 0.72, 1],
    outputRange: [0, 1, 0.8, 0],
  });
  const centerVfxScale = centerVfxAnim.interpolate({
    inputRange: [0, 0.24, 1],
    outputRange: [0.55, 1.16, 1.32],
  });
  const centerVfxLift = centerVfxAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, -18],
  });
  const centerAccent = getPlayerAccent(
    centerMoment?.playerId ?? activePlayerId ?? centerVfxPlayerId,
  );

  const centerStepCount = question.bonuses.length + 1;
  let centerStepIndex = 0;
  let centerLabel = "TRADUCTION";
  let centerQuestion = `Que signifie « ${question.word} » ?`;
  let centerAnswer = CENTER_ANSWER_PLACEHOLDER;
  let centerDetail = "En attente d'un buzz";

  if (phase === "translation" && activePlayerId) {
    const liveAnswer = isLocalTurn ? typedAnswer.trim() : "";

    centerLabel = `${activePlayer?.name ?? "JOUEUR"} RÉPOND`;
    centerAnswer = liveAnswer || CENTER_ANSWER_PLACEHOLDER;
    centerDetail = liveAnswer
      ? "Réponse en cours"
      : "15 secondes pour répondre";
  } else if (phase === "bonus" && activePlayerId) {
    const bonus = question.bonuses[bonusIndex];

    centerStepIndex = bonusIndex + 1;
    centerLabel = `${activePlayer?.name ?? "JOUEUR"} · BONUS`;
    centerQuestion = bonus.label;
    centerAnswer = selectedChoice || CENTER_ANSWER_PLACEHOLDER;
    centerDetail = selectedChoice ? "Réponse sélectionnée" : "Choix en attente";
  } else if (phase === "reveal") {
    centerStepIndex = centerStepCount;
    centerLabel = centerMoment?.label ?? "RÉPONSE";
    centerQuestion = `${question.word} = ${question.translation}`;
    centerAnswer = `PROCHAIN · ${nextWordCountdown}S`;
    centerDetail = "Préparez-vous";
  }

  const centerRemainingSteps = Math.max(
    0,
    centerStepCount - Math.min(centerStepIndex + 1, centerStepCount),
  );

  const centerVfxColor =
    centerVfxKind === "danger"
      ? "#FB7185"
      : centerVfxKind === "success" || centerVfxKind === "bonus"
        ? "#FACC15"
        : getPlayerAccent(centerVfxPlayerId);
  const centerVfxText =
    centerVfxKind === "success" || centerVfxKind === "bonus"
      ? "+1"
      : centerVfxKind === "danger"
        ? "×"
        : "BUZZ!";

  const renderSeat = (
    player: (typeof BUZZ_WORT_PLAYERS)[number],
    index: number,
    position: "top" | "left" | "right" | "bottom",
  ) => {
    const locked = buzzedPlayerIds.includes(player.id);
    const active = activePlayerId === player.id && phase !== "reveal";
    const local = index === 3;
    const failed = locked && !active;
    const lateral = position === "left" || position === "right";
    const playerTimeProgress = `${Math.max(
      0,
      Math.min(100, (playerTime / 15) * 100),
    )}%` as `${number}%`;

    return (
      <Pressable
        key={player.id}
        accessibilityRole="button"
        accessibilityLabel={`Buzzer de ${player.name}`}
        onPress={() => handleBuzz(player.id)}
        disabled={phase !== "buzz" || locked}
        className={[
          "items-center justify-center",
          position === "left" && "max-w-[86px]",
          position === "right" && "max-w-[86px]",
          "active:scale-[0.97] active:opacity-[0.9]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <View className="relative items-center justify-center">
          <View className="relative items-center justify-center">
            {active ? (
              <StyledAnimatedView
                pointerEvents="none"
                className="absolute w-[68px] h-[68px] rounded-full"
                style={{
                  backgroundColor: local ? C.cyan : player.color,
                  opacity: activeGlow,
                  transform: [{ scale: 1.03 }],
                }}
              />
            ) : null}

            {active ? (
              <View
                className={[
                  "absolute rounded-full bg-[rgba(255,255,255,0.18)] overflow-hidden",
                  position === "left"
                    ? "left-[62px] top-[6px] w-[5px] h-[42px]"
                    : position === "right"
                      ? "right-[62px] top-[6px] w-[5px] h-[42px]"
                      : "top-[-13px] w-[54px] h-[5px]",
                ].join(" ")}
              >
                <View
                  className="absolute bottom-0 rounded-full bg-[#FACC15]"
                  style={
                    lateral
                      ? { width: "100%", height: playerTimeProgress }
                      : { height: "100%", width: playerTimeProgress }
                  }
                />
              </View>
            ) : null}

            <StyledLinearGradient
              colors={
                local
                  ? [C.cyan, "#4F46E5", C.purple]
                  : failed
                    ? ["#E11D48", "#312E81"]
                    : index === 1
                      ? ["#EAB308", C.amber]
                      : ["#EC4899", "#6366F1"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className={[
                "w-[54px] h-[54px] rounded-[27px] p-[2px] items-center justify-center [elevation:8] shadow-[0px_4px_10px_rgba(0,0,0,0.35)]",
                failed && "opacity-[0.8]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <View className="w-[100%] h-[100%] rounded-full items-center justify-center bg-[#12183B]">
                <Text className="text-[24px]">{AVATARS[index] ?? "🎮"}</Text>
              </View>
            </StyledLinearGradient>

            <View className="absolute w-[13px] h-[13px] rounded-[7px] bg-[#06D6A0] border-[2px] border-[#101533] bottom-[0px] right-[1px]" />

            {failed && position === "bottom" ? (
              <View className="absolute top-[-25px] self-center rounded-full px-[8px] py-[3px] bg-[rgba(239,68,68,0.88)] border-[1px] border-[rgba(255,255,255,0.16)] z-[20]">
                <Text className="text-[#FFFFFF] text-[9px] font-[900]">
                  Passé
                </Text>
              </View>
            ) : null}

            {failed ? (
              <View className="absolute top-[-4px] right-[-5px] w-[20px] h-[20px] rounded-[10px] items-center justify-center bg-[#DC2626]">
                <Text className="text-[#FFFFFF] font-[900] text-[15px] leading-[17px]">
                  ×
                </Text>
              </View>
            ) : locked ? (
              <View className="absolute top-[-5px] right-[-7px] px-[6px] py-[2px] rounded-full bg-[rgba(5,8,18,0.92)] border-[1px] border-[rgba(255,255,255,0.15)]">
                <Text className="text-[9px] text-[#D1D5DB]">🔒</Text>
              </View>
            ) : null}
          </View>

          {active ? (
            <View
              className={[
                "mt-[4px] h-[22px] rounded-full items-center justify-center",
                lateral ? "w-[82px] px-[6px]" : "max-w-[140px] px-[10px]",
              ].join(" ")}
              style={{ backgroundColor: local ? C.cyan : player.color }}
            >
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                ellipsizeMode="tail"
                className="w-full text-center text-[#FFFFFF] text-[10px] font-[900]"
              >
                {local ? "À VOTRE TOUR" : `TOUR DE ${player.name.toUpperCase()}`}
              </Text>
            </View>
          ) : (
            <View className="mt-[4px] flex-row items-center gap-[5px] max-w-[150px]">
              <Text
                numberOfLines={1}
                className={[
                  "text-[#D1D5DB] text-[10px] font-[700] max-w-[82px]",
                  local && "text-[#6EE7B7] font-[900] max-w-[110px]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {player.name}
              </Text>

              <View
                className={[
                  "rounded-full border-[1px] px-[6px] py-[2px]",
                  local
                    ? "bg-[rgba(6,214,160,0.14)] border-[rgba(6,214,160,0.35)]"
                    : "bg-[rgba(255,183,3,0.15)] border-[rgba(255,183,3,0.35)]",
                ].join(" ")}
              >
                <Text
                  className={[
                    "text-[9px] font-[900]",
                    local ? "text-[#6EE7B7]" : "text-[#FCD34D]",
                  ].join(" ")}
                >
                  {scores[player.id]}
                  {local ? " pts " : ""}
                </Text>
              </View>
            </View>
          )}

          {failed &&
          (position === "top" ||
            position === "left" ||
            position === "right") ? (
            <View className="absolute top-[82px] self-center rounded-full px-[8px] py-[3px] bg-[rgba(239,68,68,0.88)] border-[1px] border-[rgba(255,255,255,0.16)] z-[20]">
              <Text className="text-[#FFFFFF] text-[9px] font-[900]">
                Passé
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  };

  const renderHistory = () => {
    const visibleHistory = historyEvents.slice(-5);

    return (
      <View
        pointerEvents="none"
        className="absolute top-[132px] left-[-42px] right-[-42px] z-[24] h-[112px] overflow-hidden"
      >
        <Animated.View
          style={{
            transform: [
              {
                translateY: historyShiftAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          }}
        >
          {visibleHistory.map((event, index) => {
            const age = visibleHistory.length - 1 - index;
            const opacity = [1, 0.72, 0.43, 0.23, 0.1][age] ?? 0.08;
            const scale = Math.max(0.84, 1 - age * 0.045);

            const toneClass =
              event.tone === "success"
                ? "text-[#86EFAC]"
                : event.tone === "danger"
                  ? "text-[#FCA5A5]"
                  : event.tone === "buzz"
                    ? "text-[#FDE68A]"
                    : event.tone === "bonus"
                      ? "text-[#C4B5FD]"
                      : "text-[#FFFFFF]";

            return (
              <View
                key={event.id}
                className="items-center mb-[3px]"
                style={{
                  opacity,
                  transform: [
                    { scale },
                    { perspective: 700 },
                    { rotateX: `${Math.min(10, age * 2.2)}deg` },
                  ],
                }}
              >
                <Text
                  numberOfLines={1}
                  className={[
                    "text-center font-[800]",
                    age === 0 ? "text-[11px]" : "text-[10px]",
                    toneClass,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    textShadowColor: "rgba(0,0,0,0.82)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 4,
                  }}
                >
                  {event.text}
                </Text>
              </View>
            );
          })}
        </Animated.View>
      </View>
    );
  };

  const renderInteractionDock = () => {
    if (phase === "translation" && isLocalTurn) {
      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "position" : "padding"}
          className="absolute left-[14px] right-[14px] bottom-[108px] z-[70]"
        >
          <View className="rounded-[22px] border-[1px] border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,39,0.96)] p-[10px] [elevation:18] shadow-[0px_8px_24px_rgba(0,0,0,0.45)]">
            <View className="mb-[7px] flex-row items-center justify-between px-[2px]">
              <View>
                <Text className="text-[#8B93AF] text-[8px] font-[900] tracking-[1.2px]">
                  TRADUCTION
                </Text>
                <Text className="text-[#FFFFFF] text-[12px] font-[900]">
                  Que signifie « {question.word} » ?
                </Text>
              </View>

              <View className="w-[44px] h-[4px] rounded-full bg-white/10 overflow-hidden">
                <View
                  className="h-full rounded-full bg-[#FACC15]"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, (playerTime / 15) * 100),
                    )}%`,
                  }}
                />
              </View>
            </View>

            <View className="h-[44px] flex-row items-center rounded-[15px] border-[1px] border-[rgba(255,183,3,0.32)] bg-[#151B42] pl-[12px] pr-[5px]">
              <TextInput
                value={typedAnswer}
                onChangeText={setTypedAnswer}
                onSubmitEditing={() => handleTranslation()}
                placeholder="Ta réponse en français..."
                placeholderTextColor="#7F88A7"
                returnKeyType="done"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 text-[#FFFFFF] text-[12px] font-[700] pr-[8px]"
              />

              <Pressable
                onPress={() => handleTranslation()}
                disabled={!typedAnswer.trim()}
                className={[
                  "h-[34px] px-[12px] rounded-[11px] items-center justify-center bg-[#FFB703]",
                  !typedAnswer.trim() && "opacity-40",
                  "active:scale-[0.96]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Ionicons name="checkmark" size={17} color="#111827" />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
            >
              <View className="flex-row pt-[7px] gap-[6px]">
                {question.translationChoices.map((choice) => (
                  <Pressable
                    key={choice}
                    onPress={() => setTypedAnswer(choice)}
                    className={[
                      "rounded-full border-[1px] px-[9px] py-[5px] bg-white/[0.06]",
                      typedAnswer === choice
                        ? "border-[rgba(255,183,3,0.5)] bg-[rgba(255,183,3,0.11)]"
                        : "border-white/[0.08]",
                      "active:scale-[0.96]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <Text className="text-[#D8DDF1] text-[9px] font-[700]">
                      {choice}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      );
    }

    if (phase === "bonus" && isLocalTurn) {
      const bonus = question.bonuses[bonusIndex];

      return (
        <View className="absolute left-[14px] right-[14px] bottom-[108px] z-[70] rounded-[22px] border-[1px] border-[rgba(255,183,3,0.22)] bg-[rgba(12,16,39,0.97)] p-[11px] [elevation:18] shadow-[0px_8px_24px_rgba(0,0,0,0.45)]">
          <View className="mb-[8px] flex-row items-center justify-between">
            <View className="flex-1 pr-[10px]">
              <Text className="text-[#FCD34D] text-[8px] font-[900] tracking-[1.1px]">
                BONUS {bonusIndex + 1}/{question.bonuses.length}
              </Text>
              <Text className="text-[#FFFFFF] text-[12px] font-[900]">
                {bonus.label}
              </Text>
            </View>

            <View className="w-[44px] h-[4px] rounded-full bg-white/10 overflow-hidden">
              <View
                className="h-full rounded-full bg-[#FACC15]"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, (playerTime / 15) * 100),
                  )}%`,
                }}
              />
            </View>
          </View>

          <View className="flex-row flex-wrap gap-[7px]">
            {bonus.choices.map((choice) => {
              const selected = selectedChoice === choice;

              return (
                <Pressable
                  key={choice}
                  onPress={() => setSelectedChoice(choice)}
                  className={[
                    "grow min-w-[46%] rounded-[13px] border-[1px] px-[9px] py-[8px]",
                    selected
                      ? "border-[rgba(255,183,3,0.58)] bg-[rgba(255,183,3,0.14)]"
                      : "border-white/[0.08] bg-white/[0.055]",
                    "active:scale-[0.97]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Text
                    className={[
                      "text-center text-[10px] font-[800]",
                      selected ? "text-[#FDE68A]" : "text-[#D8DDF1]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {choice}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={handleBonus}
            disabled={!selectedChoice}
            className={[
              "mt-[8px] h-[36px] rounded-[12px] items-center justify-center bg-[#FFB703]",
              !selectedChoice && "opacity-40",
              "active:scale-[0.98]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Text className="text-[#111827] text-[10px] font-[900] tracking-[0.8px]">
              VALIDER LE BONUS
            </Text>
          </Pressable>

          {feedback ? (
            <Text className="mt-[5px] text-center text-[#FDE68A] text-[9px] font-[700]">
              {feedback}
            </Text>
          ) : null}
        </View>
      );
    }

    return null;
  };

  return (
    <StyledLinearGradient
      colors={["#0B0E22", "#101533", "#080A18"]}
      locations={[0, 0.52, 1]}
      className="flex-1 bg-[#090C1C] overflow-hidden"
    >
      <StatusBar hidden />

      {/* TOP SAFE AREA */}
      <View
        style={{
          height: insets.top,
        }}
      />

      <View
        pointerEvents="none"
        className={[
          "absolute rounded-full opacity-[0.18]",
          "w-[72px] h-[72px] bg-[#3B82F6] top-[23%] left-[20px]",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <View
        pointerEvents="none"
        className={[
          "absolute rounded-full opacity-[0.18]",
          "w-[90px] h-[90px] bg-[#A855F7] top-[34%] right-[24px]",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <View
        pointerEvents="none"
        className={[
          "absolute rounded-full opacity-[0.18]",
          "w-[54px] h-[54px] bg-[#EC4899] bottom-[31%] left-[46px]",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <View
        pointerEvents="none"
        className={[
          "absolute rounded-full opacity-[0.18]",
          "w-[104px] h-[104px] bg-[#4F46E5] bottom-[22%] right-[24px]",
        ]
          .filter(Boolean)
          .join(" ")}
      />

      <StyledLinearGradient
        pointerEvents="none"
        colors={[rgba("#6366F1", 0.17), rgba("#7B2CBF", 0.06), "transparent"]}
        className="absolute w-[340px] h-[360px] rounded-[170px] top-[-20px] self-center"
      />

      <View className="z-[20] px-[14px] pt-[10px] pb-[2px] flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quitter la partie"
          onPress={() => router.back()}
          className="w-[38px] h-[38px] rounded-[19px] bg-[rgba(255,255,255,0.09)] border-[1px] border-[rgba(255,255,255,0.14)] items-center justify-center active:scale-[0.97] active:opacity-[0.9]"
        >
          <Ionicons name="chevron-back" size={20} color="#E5E7EB" />
        </Pressable>

        <View className="relative items-center justify-center">
          {renderSeat(BUZZ_WORT_PLAYERS[0], 0, "top")}

          <View className="absolute right-1/2 mr-[38px] top-[30px] z-[50]">
            <GameBuzzer
              size={80}
              variant="red"
              onPress={() => handleBuzz(BUZZ_WORT_PLAYERS[0].id)}
              disabled={
                phase !== "buzz" ||
                buzzedPlayerIds.includes(BUZZ_WORT_PLAYERS[0].id)
              }
            />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Paramètres"
          className="w-[38px] h-[38px] rounded-[19px] bg-[rgba(255,255,255,0.09)] border-[1px] border-[rgba(255,255,255,0.14)] items-center justify-center active:scale-[0.97] active:opacity-[0.9]"
        >
          <Ionicons name="settings-outline" size={18} color="#E5E7EB" />
        </Pressable>
      </View>

      <View
        className="absolute left-[10px] right-[10px] top-1/2 z-[10] flex-row items-center justify-between"
        style={{ transform: [{ translateY: -50 }] }}
      >
        <View className="relative w-[54px] items-center">
          <View className="absolute left-0 right-0 top-[-88px] z-[50] items-center">
            <GameBuzzer
              size={80}
              variant="amber"
              onPress={() => handleBuzz(BUZZ_WORT_PLAYERS[1].id)}
              disabled={
                phase !== "buzz" ||
                buzzedPlayerIds.includes(BUZZ_WORT_PLAYERS[1].id)
              }
            />
          </View>

          {renderSeat(BUZZ_WORT_PLAYERS[1], 1, "left")}
        </View>

        <View className="w-[190px] items-center justify-center relative">
          {phase === "buzz" ? (
            <View className="absolute top-[-40px] w-[132px] h-[4px] rounded-full bg-white/10 overflow-hidden z-[20]">
              <View
                className="h-full rounded-full bg-[#FFB703]"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, (generalTime / 60) * 100),
                  )}%`,
                }}
              />
            </View>
          ) : null}

          <StyledAnimatedView
            className="relative items-center justify-center"
            style={{
              opacity: questionTransitionAnim,
              transform: [
                { translateY: floatY },
                { scale: centerCardScale },
                { scale: questionTransitionScale },
                { rotate: questionTransitionRotate },
              ],
            }}
          >
            <View
              pointerEvents="none"
              className="absolute top-[132px] w-[128px] h-[18px] rounded-full bg-black/40"
              style={{
                transform: [{ scaleX: 1.25 }],
              }}
            />

            <StyledLinearGradient
              pointerEvents="none"
              colors={["#090B20", "#11142F", "#050713"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute top-[12px] w-[172px] h-[146px] rounded-[25px] border border-black/60"
            />

            <StyledLinearGradient
              pointerEvents="none"
              colors={["#14183C", "#0A0C22"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute top-[7px] w-[172px] h-[146px] rounded-[25px]"
              style={{
                borderWidth: 1,
                borderColor: rgba(centerAccent, 0.24),
              }}
            />

            <StyledAnimatedView
              pointerEvents="none"
              className="absolute w-[178px] h-[152px] rounded-[28px]"
              style={{
                backgroundColor: centerAccent,
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              }}
            />

            <StyledLinearGradient
              colors={[
                rgba(centerAccent, 0.98),
                centerAccent,
                "#FFF3A3",
                rgba(centerAccent, 0.84),
              ]}
              locations={[0, 0.34, 0.68, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-[174px] h-[148px] rounded-[26px] p-[3px]"
            >
              <StyledLinearGradient
                colors={[rgba(centerAccent, 0.34), "#242A71", "#171B4D"]}
                locations={[0, 0.48, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="relative flex-1 rounded-[23px] overflow-hidden px-[10px] pt-[9px] pb-[8px]"
              >
                <StyledLinearGradient
                  pointerEvents="none"
                  colors={[
                    "rgba(255,255,255,0.17)",
                    "rgba(255,255,255,0.03)",
                    "transparent",
                  ]}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  className="absolute top-0 left-0 right-0 h-[48%]"
                />

                <View
                  pointerEvents="none"
                  className="absolute top-[32px] self-center w-[118px] h-[72px] rounded-full"
                  style={{ backgroundColor: rgba(centerAccent, 0.12) }}
                />

                <View className="flex-row items-center justify-between">
                  <View
                    className="max-w-[112px] rounded-full border border-white/10 bg-black/20 px-[7px] py-[3px]"
                    style={{ borderColor: rgba(centerAccent, 0.28) }}
                  >
                    <Text
                      numberOfLines={1}
                      className="text-[6px] font-[900] tracking-[0.8px] text-white/80"
                    >
                      {centerLabel}
                    </Text>
                  </View>

                  <Text className="text-[7px] font-[900] text-white/55">
                    {phase === "reveal"
                      ? `${nextWordCountdown}s`
                      : `${Math.min(centerStepIndex + 1, centerStepCount)}/${centerStepCount}`}
                  </Text>
                </View>

                <Text
                  allowFontScaling={false}
                  numberOfLines={2}
                  className="mt-[8px] min-h-[32px] text-center text-[#FFFFFF] text-[13px] leading-[16px] font-[900]"
                >
                  {centerQuestion}
                </Text>

                <View
                  accessible
                  accessibilityLabel={
                    centerAnswer === CENTER_ANSWER_PLACEHOLDER
                      ? "Réponse en attente"
                      : `Réponse : ${centerAnswer}`
                  }
                  className="mt-[6px] h-[36px] rounded-[10px] border bg-black/25 items-center justify-center px-[8px]"
                  style={{ borderColor: rgba(centerAccent, 0.3) }}
                >
                  <Text
                    allowFontScaling={false}
                    numberOfLines={2}
                    className="max-w-[136px] text-center text-white font-[900]"
                    style={{
                      fontSize:
                        centerAnswer === CENTER_ANSWER_PLACEHOLDER ? 18 : 16,
                      lineHeight: 18,
                      letterSpacing:
                        centerAnswer === CENTER_ANSWER_PLACEHOLDER ? 2 : 0,
                    }}
                  >
                    {centerAnswer}
                  </Text>
                </View>

                <View className="mt-auto">
                  <View className="mb-[4px] flex-row items-center justify-between">
                    <Text
                      numberOfLines={1}
                      className="max-w-[108px] text-[6px] font-[800] text-white/50"
                    >
                      {centerDetail}
                    </Text>
                    <Text className="text-[6px] font-[900] text-white/65">
                      {phase === "reveal"
                        ? "MOT SUIVANT"
                        : centerRemainingSteps === 0
                          ? "DERNIÈRE"
                          : `${centerRemainingSteps} RESTANTE${centerRemainingSteps > 1 ? "S" : ""}`}
                    </Text>
                  </View>

                  <View className="h-[4px] flex-row gap-[3px]">
                    {Array.from({ length: centerStepCount }, (_, stepIndex) => {
                      const isCompleted =
                        phase === "reveal" || stepIndex < centerStepIndex;
                      const isCurrent =
                        phase !== "reveal" && stepIndex === centerStepIndex;

                      return (
                        <View
                          key={stepIndex}
                          className="h-full flex-1 rounded-full"
                          style={{
                            backgroundColor: isCompleted
                              ? C.emerald
                              : isCurrent
                                ? centerAccent
                                : "rgba(255,255,255,0.13)",
                          }}
                        />
                      );
                    })}
                  </View>
                </View>

                <View
                  pointerEvents="none"
                  className="absolute top-[-48px] right-[-28px] w-[55px] h-[180px] rotate-[28deg] bg-white/[0.045]"
                />

                <View className="absolute top-[8px] left-[9px] w-[4px] h-[4px] rounded-full bg-white/30" />
                <View className="absolute top-[8px] right-[9px] w-[4px] h-[4px] rounded-full bg-white/30" />
                <View className="absolute bottom-[8px] left-[9px] w-[4px] h-[4px] rounded-full bg-black/35" />
                <View className="absolute bottom-[8px] right-[9px] w-[4px] h-[4px] rounded-full bg-black/35" />
              </StyledLinearGradient>
            </StyledLinearGradient>
          </StyledAnimatedView>

          {renderHistory()}
        </View>

        <View className="relative w-[54px] items-center">
          <View className="absolute left-0 right-0 top-[-88px] z-[50] items-center">
            <GameBuzzer
              size={80}
              variant="violet"
              onPress={() => handleBuzz(BUZZ_WORT_PLAYERS[2].id)}
              disabled={
                phase !== "buzz" ||
                buzzedPlayerIds.includes(BUZZ_WORT_PLAYERS[2].id)
              }
            />
          </View>

          {renderSeat(BUZZ_WORT_PLAYERS[2], 2, "right")}
        </View>
      </View>

      {centerVfxKind ? (
        <View
          pointerEvents="none"
          className="absolute left-0 right-0 top-1/2 z-[120] items-center"
          style={{
            elevation: 40,
            transform: [{ translateY: -154 }],
          }}
        >
          <View className="relative h-[130px] w-[150px] items-center">
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 8,
                width: 88,
                height: 88,
                borderRadius: 44,
                borderWidth: 2,
                borderColor: rgba(centerVfxColor, 0.7),
                elevation: 30,
                opacity: centerVfxOpacity,
                transform: [{ scale: centerVfxScale }],
              }}
            />

            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 17,
                width: 70,
                height: 70,
                borderRadius: 23,
                elevation: 32,
                zIndex: 2,
                transform: [
                  { translateY: centerVfxLift },
                  { scale: centerVfxScale },
                  {
                    rotate: centerVfxAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["-7deg", "4deg"],
                    }),
                  },
                ],
              }}
            >
              <StyledLinearGradient
                colors={[
                  rgba(centerVfxColor, 0.98),
                  rgba(centerVfxColor, 0.72),
                  "#171B4D",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 overflow-hidden rounded-[23px] border-[2px] border-white/25 items-center justify-center"
              >
                <Text className="text-[24px] font-[900] text-white">
                  {centerVfxText}
                </Text>
                <Text className="mt-[-2px] text-[6px] font-[900] tracking-[1px] text-white/75">
                  {centerVfxKind === "buzz"
                    ? "RÉPONDS !"
                    : centerVfxKind === "danger"
                      ? "RATÉ"
                      : "POINT"}
                </Text>
              </StyledLinearGradient>
            </Animated.View>

            {[
              { x: 38, y: -30, size: 7, color: centerVfxColor },
              { x: -42, y: -22, size: 5, color: centerVfxColor },
              { x: 26, y: 35, size: 6, color: "#FFFFFF" },
              { x: -30, y: 32, size: 4, color: "#FFFFFF" },
            ].map((particle) => (
              <Animated.View
                key={`${particle.x}-${particle.y}`}
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 50 - particle.size / 2,
                  left: 75 - particle.size / 2,
                  width: particle.size,
                  height: particle.size,
                  borderRadius: particle.size / 2,
                  backgroundColor: particle.color,
                  elevation: 31,
                  opacity: centerVfxOpacity,
                  zIndex: 1,
                  transform: [
                    {
                      translateX: centerVfxAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, particle.x],
                      }),
                    },
                    {
                      translateY: centerVfxAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, particle.y],
                      }),
                    },
                    { scale: centerVfxScale },
                  ],
                }}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View className="relative flex-1 min-h-[495px] px-[8px] pt-[2px] pb-[4px] justify-end">
        <View className="relative items-center mt-[2px]">
          {renderSeat(BUZZ_WORT_PLAYERS[3], 3, "bottom")}

          <View className="absolute left-1/2 ml-[38px] top-[-30px] z-[50]">
            <GameBuzzer
              size={80}
              variant="cyan"
              onPress={() => handleBuzz(localPlayer.id)}
              disabled={
                phase !== "buzz" || buzzedPlayerIds.includes(localPlayer.id)
              }
            />
          </View>
        </View>
      </View>

      <View className="absolute right-[10px] bottom-[190px] z-[40] w-[36px] h-[36px]">
        {REACTIONS.map((emoji, index) => {
          const arcPositions = [
            { x: -8, y: -56 },
            { x: -42, y: -40 },
            { x: -58, y: 0 },
          ];
          const position = arcPositions[index] ?? { x: 0, y: 0 };

          return (
            <StyledAnimatedView
              key={emoji}
              pointerEvents={reactionsOpen ? "auto" : "none"}
              className="absolute inset-0"
              style={{
                opacity: reactionArcAnim,
                transform: [
                  {
                    translateX: reactionArcAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, position.x],
                    }),
                  },
                  {
                    translateY: reactionArcAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, position.y],
                    }),
                  },
                  {
                    scale: reactionArcAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.35, 1],
                    }),
                  },
                ],
              }}
            >
              <Pressable
                onPress={handleReaction}
                className="w-[36px] h-[36px] rounded-[18px] items-center justify-center bg-[rgba(27,33,73,0.96)] border-[1px] border-[rgba(255,255,255,0.16)] [elevation:7] shadow-[0px_0px_8px_rgba(0,0,0,0.35)] active:scale-[1.18]"
              >
                <Text className="text-[18px]">{emoji}</Text>
              </Pressable>
            </StyledAnimatedView>
          );
        })}

        <Pressable
          onPress={toggleReactions}
          className="absolute inset-0 w-[36px] h-[36px] rounded-[18px] items-center justify-center bg-[rgba(27,33,73,0.96)] border-[1px] border-[rgba(255,255,255,0.16)] [elevation:8] shadow-[0px_0px_8px_rgba(0,0,0,0.35)] active:scale-[0.94]"
        >
          <Text className="text-[18px]">😂</Text>
        </Pressable>
      </View>

      {renderInteractionDock()}

      {/* BOTTOM SAFE AREA */}
      <View
        style={{
          height: insets.bottom,
        }}
      />
    </StyledLinearGradient>
  );
}
