import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Camera, Check, Heart, Pencil, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useGetAllMoments,
  useGetLoveNote,
  useGetUpcomingSpecialDates,
  useUpdateLoveNote,
} from "../hooks/useQueries";

function daysUntilNextOccurrence(dateMs: bigint): number {
  const date = new Date(Number(dateMs));
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), date.getMonth(), date.getDate());
  if (thisYear < now) thisYear.setFullYear(thisYear.getFullYear() + 1);
  return Math.ceil(
    (thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export default function Home() {
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState("");

  const { data: loveNote, isLoading: noteLoading } = useGetLoveNote();
  const { data: specialDates, isLoading: datesLoading } =
    useGetUpcomingSpecialDates();
  const { data: moments, isLoading: momentsLoading } = useGetAllMoments();
  const updateNote = useUpdateLoveNote();

  const nextDate = specialDates?.[0] ?? null;
  const recentMoments = moments?.slice(-3).reverse() ?? [];

  const startEdit = () => {
    setNoteText(loveNote ?? "");
    setEditingNote(true);
  };

  const saveNote = async () => {
    try {
      await updateNote.mutateAsync(noteText);
      setEditingNote(false);
      toast.success("Love note saved 💕");
    } catch {
      toast.error("Couldn't save. Try again.");
    }
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="pb-24 space-y-6">
      {/* Header banner */}
      <div
        className="relative overflow-hidden px-5 pt-12 pb-10"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.52 0.18 15 / 0.12) 0%, oklch(0.70 0.10 30 / 0.08) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('/assets/generated/hero-bg.dim_800x600.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-primary" fill="currentColor" />
            <span className="font-display text-xl font-semibold text-foreground">
              Just Us
            </span>
          </div>
          <p className="text-2xl font-display font-medium text-foreground/90">
            {greeting}, lovebirds ✨
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.div>
      </div>

      <div className="px-5 space-y-5">
        {/* Love Note */}
        <motion.div
          className="bg-card rounded-3xl p-5 shadow-card border border-border/40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">💌</span>
              <h2 className="font-display text-base font-semibold text-foreground">
                Our Love Note
              </h2>
            </div>
            {!editingNote && (
              <Button
                variant="ghost"
                size="icon"
                onClick={startEdit}
                className="w-8 h-8 text-muted-foreground hover:text-primary rounded-xl"
                data-ocid="home.love_note.edit_button"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </div>

          {editingNote ? (
            <div className="space-y-3">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write something sweet for each other..."
                className="resize-none rounded-xl min-h-[100px] text-sm leading-relaxed"
                autoFocus
                data-ocid="home.love_note.input"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={saveNote}
                  disabled={updateNote.isPending}
                  className="flex-1 rounded-xl h-9 text-sm font-medium"
                  data-ocid="home.love_note.save_button"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingNote(false)}
                  className="rounded-xl h-9"
                  data-ocid="home.love_note.cancel_button"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : noteLoading ? (
            <Skeleton
              className="h-12 w-full rounded-xl"
              data-ocid="home.love_note.loading_state"
            />
          ) : (
            <p className="text-sm text-foreground/80 leading-relaxed font-body italic">
              {loveNote?.trim() ? (
                `"${loveNote}"`
              ) : (
                <span className="text-muted-foreground not-italic">
                  Tap ✏️ to write something sweet for each other...
                </span>
              )}
            </p>
          )}
        </motion.div>

        {/* Next Special Date */}
        <motion.div
          className="bg-card rounded-3xl p-5 shadow-card border border-border/40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="font-display text-base font-semibold text-foreground">
              Next Special Day
            </h2>
          </div>

          {datesLoading ? (
            <Skeleton className="h-16 w-full rounded-xl" />
          ) : nextDate ? (
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: "oklch(0.52 0.18 15 / 0.10)" }}
              >
                {nextDate.emoji || "💝"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {nextDate.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(Number(nextDate.date)).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex-shrink-0 text-center">
                <p className="text-2xl font-display font-bold text-primary">
                  {daysUntilNextOccurrence(nextDate.date)}
                </p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
            </div>
          ) : (
            <p
              className="text-sm text-muted-foreground text-center py-3"
              data-ocid="dates.empty_state"
            >
              No special dates yet. Add your first one! 🗓️
            </p>
          )}
        </motion.div>

        {/* Recent Moments */}
        <motion.div
          className="bg-card rounded-3xl p-5 shadow-card border border-border/40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4 text-primary" />
            <h2 className="font-display text-base font-semibold text-foreground">
              Recent Moments
            </h2>
          </div>

          {momentsLoading ? (
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="flex-1 aspect-square rounded-xl" />
              ))}
            </div>
          ) : recentMoments.length > 0 ? (
            <div className="flex gap-2">
              {recentMoments.map((m) => (
                <div
                  key={String(m.id)}
                  className="flex-1 aspect-square rounded-xl overflow-hidden relative group"
                >
                  <img
                    src={m.photo.getDirectURL()}
                    alt={m.caption}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <p className="text-white text-[9px] font-medium leading-tight line-clamp-2">
                      {m.caption}
                    </p>
                  </div>
                </div>
              ))}
              {recentMoments.length < 3 &&
                [...["a", "b", "c"].slice(0, 3 - recentMoments.length)].map(
                  (slot) => (
                    <div
                      key={`slot-${slot}`}
                      className="flex-1 aspect-square rounded-xl bg-muted/50 flex items-center justify-center"
                    >
                      <span className="text-muted-foreground/40 text-lg">
                        📷
                      </span>
                    </div>
                  ),
                )}
            </div>
          ) : (
            <div className="flex gap-2" data-ocid="moments.empty_state">
              {["a", "b", "c"].map((slot) => (
                <div
                  key={`empty-${slot}`}
                  className="flex-1 aspect-square rounded-xl bg-muted/50 flex items-center justify-center"
                >
                  <span className="text-muted-foreground/40 text-lg">📷</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
