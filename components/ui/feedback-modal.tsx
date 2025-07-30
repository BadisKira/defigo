"use client";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (rating: number, comment?: string) => void | Promise<void>;
  onSkip?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function FeedbackModal({
  open,
  onOpenChange,
  onSubmit,
  onSkip,
  isLoading = false,
  error = null
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const handleSubmit = async () => {
    if (rating === 0) return; // Rating obligatoire
    await onSubmit(rating, comment.trim() || undefined);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setComment("");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  // Système d'étoiles avec précision 0.5
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = (hoverRating || rating) >= i;
      const isHalfFilled = (hoverRating || rating) >= i - 0.5 && (hoverRating || rating) < i;
      
      stars.push(
        <div key={i} className="relative cursor-pointer">
          {/* Étoile complète ou vide */}
          <Star
            className={`h-8 w-8 transition-colors ${
              isFilled 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300 hover:text-yellow-200"
            }`}
            onClick={() => setRating(i)}
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
          />
          
          {/* Demi-étoile (côté gauche) */}
          <div
            className="absolute inset-0 w-1/2 overflow-hidden cursor-pointer"
            onClick={() => setRating(i - 0.5)}
            onMouseEnter={() => setHoverRating(i - 0.5)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                isHalfFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-transparent"
              }`}
            />
          </div>
        </div>
      );
    }
    return stars;
  };

  const getRatingText = (rating: number) => {
    if (rating === 0) return "";
    if (rating <= 1) return "Très déçu";
    if (rating <= 2) return "Déçu";
    if (rating <= 3) return "Neutre";
    if (rating <= 4) return "Satisfait";
    return "Très satisfait";
  };

  const feedbackContent = (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Votre retour nous aide à améliorer l'expérience deKliK
        </p>
      </div>

      {/* Rating avec étoiles */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Comment évaluez-vous votre expérience ? <span className="text-red-500">*</span>
        </Label>
        
        <div className="flex justify-center items-center space-x-1">
          {renderStars()}
        </div>
        
        {rating > 0 && (
          <div className="text-center">
            <span className="text-sm font-medium text-primary">
              {rating}/5 - {getRatingText(rating)}
            </span>
          </div>
        )}
        
        {rating === 0 && (
          <p className="text-xs text-red-500 text-center">
            Veuillez donner une note
          </p>
        )}
      </div>

      {/* Commentaire optionnel */}
      <div className="space-y-2">
        <Label htmlFor="feedback-comment" className="text-sm font-medium">
          Partagez votre expérience (optionnel)
        </Label>
        <Textarea
          id="feedback-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Qu'avez-vous pensé de ce défi ? Avez-vous des suggestions ?"
          className="min-h-[100px] resize-none"
          maxLength={500}
        />
        <div className="text-xs text-muted-foreground text-right">
          {comment.length}/500
        </div>
      </div>
    </div>
  );

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={handleClose}
      title="Partagez votre expérience"
      content={feedbackContent}
      confirmLabel="Envoyer le feedback"
      cancelLabel="Passer"
      onConfirm={handleSubmit}
      onCancel={handleSkip}
      isLoading={isLoading}
      error={error}
      disabled={rating === 0}
      icon={<MessageSquare className="h-4 w-4" />}
      confirmClassName="bg-blue-600 hover:bg-blue-700"
    />
  );
}