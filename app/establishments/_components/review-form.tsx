"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Textarea } from "@/app/_components/ui/textarea";

type ReviewFormProps = {
  establishmentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ReviewForm({
  establishmentId,
  open,
  onOpenChange,
}: ReviewFormProps) {
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setRating(0);
    setHoveredRating(0);
    setFeedback("");
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;

    onOpenChange(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (rating < 1 || rating > 5 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/establishments/${establishmentId}/reviews`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nota: rating,
            comentario: feedback.trim() || null,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Faça login para avaliar este estabelecimento."
            : response.status === 403
              ? "Não foi possível autorizar a avaliação."
              : "Não foi possível enviar sua avaliação.",
        );
      }

      onOpenChange(false);
      resetForm();

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao enviar sua avaliação.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Avaliar estabelecimento</DialogTitle>

          <DialogDescription>
            Como foi sua experiência neste ponto de apoio?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <div
              role="group"
              aria-label="Nota do estabelecimento"
              className="flex justify-center gap-2"
              onMouseLeave={() => setHoveredRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onFocus={() => setHoveredRating(star)}
                  onBlur={() => setHoveredRating(0)}
                  aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
                  aria-pressed={rating === star}
                  disabled={isSubmitting}
                  className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
                >
                  <Star
                    className={`size-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-300"
                    }`}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {rating === 0 ? "Selecione uma nota" : `${rating} de 5 estrelas`}
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`feedback-${establishmentId}`}
              className="text-sm font-medium"
            >
              Seu feedback
            </label>

            <Textarea
              id={`feedback-${establishmentId}`}
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="Conte como foi o atendimento, a estrutura e os recursos disponíveis..."
              rows={4}
              maxLength={1000}
              disabled={isSubmitting}
            />

            <p className="text-right text-xs text-muted-foreground">
              {feedback.length}/1000
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={rating === 0 || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Enviando...
                </>
              ) : (
                "Enviar avaliação"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
