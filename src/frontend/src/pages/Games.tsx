import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { GamePrompt } from "../backend.d";
import { useGetRandomPrompt } from "../hooks/useQueries";

const GAMES = [
  {
    id: "truth_or_dare",
    title: "Truth or Dare",
    description: "Dare to discover more about each other",
    emoji: "🎯",
    gradient: "from-rose-500/20 to-pink-500/10",
    badge: "Revealing",
  },
  {
    id: "would_you_rather",
    title: "Would You Rather",
    description: "Fun choices that spark great conversations",
    emoji: "🤔",
    gradient: "from-amber-500/20 to-orange-500/10",
    badge: "Fun",
  },
];

export default function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<GamePrompt | null>(null);
  const getPrompt = useGetRandomPrompt();

  const handleSelectGame = async (gameId: string) => {
    setActiveGame(gameId);
    setCurrentPrompt(null);
    try {
      const prompt = await getPrompt.mutateAsync(gameId);
      setCurrentPrompt(prompt);
    } catch {
      toast.error("Couldn't load a prompt. Try again!");
    }
  };

  const handleNext = async () => {
    if (!activeGame) return;
    setCurrentPrompt(null);
    try {
      const prompt = await getPrompt.mutateAsync(activeGame);
      setCurrentPrompt(prompt);
    } catch {
      toast.error("Couldn't load a prompt.");
    }
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Games
        </h1>
        <p className="text-sm text-muted-foreground">Keep the spark alive</p>
      </div>

      <div className="px-5 space-y-4">
        {/* Game cards */}
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map((game) => (
            <motion.button
              key={game.id}
              onClick={() => handleSelectGame(game.id)}
              className={`relative overflow-hidden rounded-3xl p-5 text-left bg-card border-2 transition-all duration-200 shadow-card ${
                activeGame === game.id
                  ? "border-primary shadow-glow"
                  : "border-border/40 hover:border-primary/40"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              data-ocid={
                game.id === "truth_or_dare"
                  ? "games.truth_dare.card"
                  : "games.would_you_rather.card"
              }
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-60`}
              />
              <div className="relative z-10 space-y-2">
                <span className="text-3xl">{game.emoji}</span>
                <p className="font-display text-base font-semibold text-foreground leading-tight">
                  {game.title}
                </p>
                <p className="text-xs text-muted-foreground leading-snug">
                  {game.description}
                </p>
              </div>
              {activeGame === game.id && (
                <motion.div
                  className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Sparkles className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Prompt display */}
        <AnimatePresence mode="wait">
          {activeGame && (
            <motion.div
              key={activeGame}
              className="bg-card rounded-3xl p-6 shadow-card border border-border/40"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">
                  {GAMES.find((g) => g.id === activeGame)?.emoji}
                </span>
                <h2 className="font-display text-base font-semibold">
                  {GAMES.find((g) => g.id === activeGame)?.title}
                </h2>
              </div>

              <div className="min-h-[100px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {getPrompt.isPending ||
                  (!currentPrompt && !getPrompt.isError) ? (
                    <motion.div
                      key="loading"
                      className="flex flex-col items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      data-ocid="games.loading_state"
                    >
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">
                        Getting a prompt...
                      </p>
                    </motion.div>
                  ) : currentPrompt ? (
                    <motion.div
                      key={currentPrompt.prompt}
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="font-display text-xl font-medium text-foreground leading-relaxed">
                        {currentPrompt.prompt}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="error"
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      data-ocid="games.error_state"
                    >
                      <p className="text-muted-foreground text-sm">
                        No prompts available yet. Try another game!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                onClick={handleNext}
                disabled={getPrompt.isPending}
                className="w-full mt-4 rounded-2xl h-12 font-semibold text-base shadow-soft"
                data-ocid="games.next.primary_button"
              >
                {getPrompt.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Next Prompt
                  </span>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {!activeGame && (
          <motion.div
            className="text-center py-8 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-4xl">🎲</p>
            <p className="text-muted-foreground text-sm">
              Pick a game above to get started!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
