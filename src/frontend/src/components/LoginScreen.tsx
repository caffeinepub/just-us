import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.97 0.02 20) 0%, oklch(0.93 0.04 15) 50%, oklch(0.90 0.06 10) 100%)",
      }}
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url('/assets/generated/hero-bg.dim_800x600.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Floating hearts */}
      {["a", "b", "c", "d", "e", "f"].map((id, i) => (
        <motion.div
          key={`heart-${id}`}
          className="absolute text-primary/20"
          style={{
            left: `${15 + i * 15}%`,
            top: `${10 + (i % 3) * 25}%`,
            fontSize: `${16 + (i % 3) * 12}px`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.7,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.5,
          }}
        >
          ♥
        </motion.div>
      ))}

      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-sm w-full"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <motion.div
            className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-glow"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Heart className="w-9 h-9 text-primary" fill="currentColor" />
          </motion.div>
          <div className="text-center">
            <h1 className="font-display text-5xl font-semibold text-foreground tracking-tight">
              Just Us
            </h1>
            <p className="text-muted-foreground mt-1 font-body text-sm font-light tracking-wide">
              Your private space for two
            </p>
          </div>
        </div>

        {/* Feature list */}
        <div className="w-full bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border/50 space-y-3">
          {[
            { icon: "💌", text: "Private chat just for the two of you" },
            { icon: "📸", text: "Capture your special moments together" },
            { icon: "💝", text: "Remember every important date" },
            { icon: "🎲", text: "Play fun games to keep the spark alive" },
          ].map((item, i) => (
            <motion.div
              key={item.text}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm text-foreground/80 font-body">
                {item.text}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Login button */}
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="w-full h-14 text-base font-semibold rounded-2xl shadow-glow hover:shadow-soft transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          size="lg"
        >
          {isLoggingIn ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4" fill="currentColor" />
              Sign In Together
            </span>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          One shared account · Two hearts · Endless memories
        </p>
      </motion.div>
    </div>
  );
}
