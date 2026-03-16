import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { SpecialDate } from "../backend.d";
import {
  useCreateSpecialDate,
  useDeleteSpecialDate,
  useGetUpcomingSpecialDates,
  useUpdateSpecialDate,
} from "../hooks/useQueries";

const CATEGORIES = [
  { value: "Anniversary", label: "Anniversary", emoji: "💍" },
  { value: "Birthday", label: "Birthday", emoji: "🎂" },
  { value: "First Meeting", label: "First Meeting", emoji: "✨" },
  { value: "Custom", label: "Custom", emoji: "💝" },
];

const EMOJIS = [
  "💍",
  "🎂",
  "✨",
  "💝",
  "🌹",
  "💑",
  "🥂",
  "🎉",
  "🌙",
  "⭐",
  "🏖️",
  "🎵",
];

function daysUntilNextOccurrence(dateMs: bigint): number {
  const date = new Date(Number(dateMs));
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), date.getMonth(), date.getDate());
  if (thisYear < now) thisYear.setFullYear(thisYear.getFullYear() + 1);
  const diff = Math.ceil(
    (thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff === 0 ? 0 : diff;
}

type FormState = {
  title: string;
  date: string;
  description: string;
  emoji: string;
  category: string;
};

const emptyForm = (): FormState => ({
  title: "",
  date: "",
  description: "",
  emoji: "💝",
  category: "Anniversary",
});

export default function Dates() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<
    (SpecialDate & { id: bigint }) | null
  >(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const { data: dates, isLoading } = useGetUpcomingSpecialDates();
  const createDate = useCreateSpecialDate();
  const updateDate = useUpdateSpecialDate();
  const deleteDate = useDeleteSpecialDate();

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (d: SpecialDate & { id: bigint }) => {
    setEditTarget(d);
    const date = new Date(Number(d.date));
    setForm({
      title: d.title,
      date: date.toISOString().slice(0, 10),
      description: d.description,
      emoji: d.emoji || "💝",
      category: d.category,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    const dateMs = BigInt(new Date(form.date).getTime());
    try {
      if (editTarget) {
        await updateDate.mutateAsync({
          id: editTarget.id,
          title: form.title,
          date: dateMs,
          description: form.description,
          emoji: form.emoji,
          category: form.category,
        });
        toast.success("Date updated 💕");
      } else {
        await createDate.mutateAsync({
          title: form.title,
          date: dateMs,
          description: form.description,
          emoji: form.emoji,
          category: form.category,
        });
        toast.success("Special date added! 🎉");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteDate.mutateAsync(id);
      toast.success("Date removed");
    } catch {
      toast.error("Couldn't delete. Try again.");
    }
  };

  const isPending = createDate.isPending || updateDate.isPending;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Special Dates
          </h1>
          <p className="text-sm text-muted-foreground">
            The days that matter most
          </p>
        </div>
        <Button
          onClick={openAdd}
          size="icon"
          className="w-10 h-10 rounded-2xl shadow-soft"
          data-ocid="dates.add.primary_button"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="px-5 space-y-3">
        {isLoading ? (
          ["s1", "s2", "s3"].map((sk) => (
            <Skeleton key={sk} className="h-24 w-full rounded-3xl" />
          ))
        ) : !dates?.length ? (
          <motion.div
            className="text-center py-16 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-ocid="dates.empty_state"
          >
            <p className="text-5xl">📅</p>
            <p className="font-display text-xl font-medium text-foreground/70">
              No special dates yet
            </p>
            <p className="text-sm text-muted-foreground">
              Add your anniversary, birthdays, and more
            </p>
            <Button
              onClick={openAdd}
              className="mt-2 rounded-xl"
              data-ocid="dates.add.secondary_button"
            >
              Add Your First Date
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {(dates as (SpecialDate & { id: bigint })[]).map((d, idx) => {
              const days = daysUntilNextOccurrence(d.date);
              const isToday = days === 0;
              return (
                <motion.div
                  key={String(d.id)}
                  className="bg-card rounded-3xl p-4 shadow-card border border-border/40 flex items-center gap-4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05, duration: 0.35 }}
                  data-ocid={`dates.item.${idx + 1}`}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "oklch(0.52 0.18 15 / 0.10)" }}
                  >
                    {d.emoji || "💝"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {d.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(Number(d.date)).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {d.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {d.description}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                    <Badge
                      variant={isToday ? "default" : "secondary"}
                      className="text-xs rounded-full px-2"
                    >
                      {isToday ? "🎉 Today!" : `${days}d`}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-primary rounded-lg"
                        onClick={() => openEdit(d)}
                        data-ocid={`dates.edit_button.${idx + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-destructive rounded-lg"
                        onClick={() => handleDelete(d.id)}
                        disabled={deleteDate.isPending}
                        data-ocid={`dates.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="rounded-3xl max-w-sm mx-4"
          data-ocid="dates.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editTarget ? "Edit Date" : "Add Special Date"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Emoji picker */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Emoji
              </Label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                      form.emoji === e
                        ? "bg-primary/20 ring-2 ring-primary scale-110"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="date-title"
                className="text-xs text-muted-foreground uppercase tracking-wide"
              >
                Title *
              </Label>
              <Input
                id="date-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Our Anniversary"
                required
                className="rounded-xl"
                data-ocid="dates.title.input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor="date-date"
                  className="text-xs text-muted-foreground uppercase tracking-wide"
                >
                  Date *
                </Label>
                <Input
                  id="date-date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  required
                  className="rounded-xl"
                  data-ocid="dates.date.input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Category
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger
                    className="rounded-xl"
                    data-ocid="dates.category.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.emoji} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="date-description"
                className="text-xs text-muted-foreground uppercase tracking-wide"
              >
                Note (optional)
              </Label>
              <Textarea
                id="date-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="A special memory..."
                className="rounded-xl resize-none h-16"
                data-ocid="dates.description.textarea"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setDialogOpen(false)}
                data-ocid="dates.cancel_button"
              >
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.title || !form.date}
                className="flex-1 rounded-xl"
                data-ocid="dates.save_button"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                {editTarget ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
