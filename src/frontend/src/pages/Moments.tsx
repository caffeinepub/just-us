import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Plus, Trash2, Upload, X, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { ExternalBlob } from "../backend";
import type { Moment } from "../backend.d";
import {
  useCreateMoment,
  useDeleteMoment,
  useGetAllMoments,
} from "../hooks/useQueries";

export default function Moments() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewMoment, setViewMoment] = useState<Moment | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: moments, isLoading } = useGetAllMoments();
  const createMoment = useCreateMoment();
  const deleteMoment = useDeleteMoment();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !caption) return;
    try {
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );
      await createMoment.mutateAsync({
        caption,
        date: BigInt(Date.now()),
        photo: blob,
      });
      toast.success("Moment captured! 📸");
      setUploadOpen(false);
      setCaption("");
      setSelectedFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setUploadProgress(0);
    } catch {
      toast.error("Upload failed. Try again.");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteMoment.mutateAsync(id);
      toast.success("Moment removed");
    } catch {
      toast.error("Couldn't delete.");
    }
  };

  const sortedMoments = [...(moments ?? [])].sort(
    (a, b) => Number(b.date) - Number(a.date),
  );

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Our Moments
          </h1>
          <p className="text-sm text-muted-foreground">
            Every photo tells our story
          </p>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          size="icon"
          className="w-10 h-10 rounded-2xl shadow-soft"
          data-ocid="moments.upload.primary_button"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Grid */}
      <div className="px-5">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((sk) => (
              <Skeleton key={sk} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : !sortedMoments.length ? (
          <motion.div
            className="text-center py-16 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-ocid="moments.empty_state"
          >
            <p className="text-5xl">📷</p>
            <p className="font-display text-xl font-medium text-foreground/70">
              No moments yet
            </p>
            <p className="text-sm text-muted-foreground">
              Capture your first memory together
            </p>
            <Button
              onClick={() => setUploadOpen(true)}
              className="mt-2 rounded-xl"
            >
              Add First Moment
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <AnimatePresence>
              {sortedMoments.map((m, idx) => (
                <motion.div
                  key={`moment-${String(m.id)}`}
                  className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: idx * 0.03, duration: 0.3 }}
                  data-ocid={`moments.item.${idx + 1}`}
                  onClick={() => setViewMoment(m)}
                >
                  <img
                    src={m.photo.getDirectURL()}
                    alt={m.caption}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-[10px] font-medium line-clamp-2">
                        {m.caption}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewMoment(m);
                        }}
                      >
                        <ZoomIn className="w-3.5 h-3.5 text-white" />
                      </button>
                      <button
                        type="button"
                        className="w-6 h-6 bg-red-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(m.id);
                        }}
                        data-ocid={`moments.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent
          className="rounded-3xl max-w-sm mx-4"
          data-ocid="moments.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Add a Moment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            {/* Photo drop zone */}
            <button
              type="button"
              className="relative w-full border-2 border-dashed border-border rounded-2xl overflow-hidden cursor-pointer transition-colors hover:border-primary/50 text-left"
              onClick={() => fileInputRef.current?.click()}
              style={{ minHeight: "180px" }}
              data-ocid="moments.dropzone"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
                  <Upload className="w-8 h-8" />
                  <p className="text-sm font-medium">Tap to choose a photo</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                data-ocid="moments.upload_button"
              />
            </button>

            {createMoment.isPending && uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="moment-caption"
                className="text-xs text-muted-foreground uppercase tracking-wide"
              >
                Caption *
              </Label>
              <Input
                id="moment-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's the story here?"
                required
                className="rounded-xl"
                data-ocid="moments.caption.input"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setUploadOpen(false)}
                data-ocid="moments.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMoment.isPending || !selectedFile || !caption}
                className="flex-1 rounded-xl"
                data-ocid="moments.save_button"
              >
                {createMoment.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View full-size */}
      <AnimatePresence>
        {viewMoment && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewMoment(null)}
            data-ocid="moments.modal"
          >
            <button
              type="button"
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
              onClick={() => setViewMoment(null)}
              data-ocid="moments.close_button"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <motion.img
              src={viewMoment.photo.getDirectURL()}
              alt={viewMoment.caption}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-center px-6">
              <p className="text-white font-medium">{viewMoment.caption}</p>
              <p className="text-white/60 text-sm mt-1">
                {new Date(Number(viewMoment.date)).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
