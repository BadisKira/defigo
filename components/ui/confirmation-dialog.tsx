"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  content?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  confirmClassName?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  content,
  confirmLabel,
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
  isLoading = false,
  error = null,
  confirmVariant = "default",
  confirmClassName,
  icon,
  disabled = false
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (err) {
      // L'erreur est gérée par le composant parent
      console.error("Erreur lors de la confirmation:", err);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon && icon}
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {content && (
          <div className="py-2">
            {content}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading || disabled}
            variant={confirmVariant}
            className={confirmClassName}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                {icon && <span className="mr-2">{icon}</span>}
                {confirmLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}