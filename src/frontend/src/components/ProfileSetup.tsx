import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

export default function ProfileSetup() {
  const [name, setName] = useState("");
  const { mutateAsync, isPending } = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await mutateAsync({ name: name.trim() });
      toast.success("Welcome to Just Us! 💕");
    } catch {
      toast.error("Couldn't save your name. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bg-card rounded-3xl p-8 shadow-soft border border-border/50 text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">
                What's your name?
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Your partner will see this in chat
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="partner-name" className="text-sm font-medium">
                Your nickname
              </Label>
              <Input
                id="partner-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Babe, Sweetheart..."
                className="h-12 rounded-xl text-center text-base"
                autoFocus
                data-ocid="profile.input"
              />
            </div>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              className="w-full h-12 rounded-xl text-base font-semibold"
              data-ocid="profile.submit_button"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4" fill="currentColor" />
                  Enter Our Space
                </span>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
