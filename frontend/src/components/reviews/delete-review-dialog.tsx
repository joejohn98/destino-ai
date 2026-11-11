import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DeleteReviewDialog({
  open,
  deleting,
  onClose,
  onConfirm,
}: {
  open: boolean;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !deleting) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this review?</DialogTitle>
          <DialogDescription>
            This can&apos;t be undone. The destination&apos;s rating will be
            recalculated.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleting}
          >
            Keep review
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

