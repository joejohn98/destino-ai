"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * Manages the delete confirmation state and execution for admin resources.
 *
 * Encapsulates the common pattern used across admin client components:
 * pending item state, deleting flag, handleDelete with toast success/error,
 * and loading reset on completion.
 */
export interface UseAdminDeleteOptions {
  /** Async function that performs the actual delete call. */
  deleteFn: (id: string) => Promise<unknown>;
  /** Success message shown after deletion. */
  successMessage?: string;
  /** Error message shown when deletion fails. */
  errorMessage?: string;
  /** Optional callback to run after a successful delete (e.g. refresh list). */
  onDeleted?: () => void;
  /** Item type name used in confirmation dialog (defaults to "item"). */
  itemName?: string;
}

export interface UseAdminDeleteResult<T> {
  /** Currently selected item pending deletion, or null. */
  pendingDelete: T | null;
  /** Whether a delete request is in flight. */
  deleting: boolean;
  /** Sets the pending item (typically triggered by a delete button click). */
  setPendingDelete: (item: T | null) => void;
  /** Confirms and executes the delete. */
  handleDelete: () => Promise<void>;
}

export function useAdminDelete<T extends { _id: string; name?: string }>(
  options: UseAdminDeleteOptions,
): UseAdminDeleteResult<T> {
  const {
    deleteFn,
    successMessage = "Deleted",
    errorMessage = "Couldn't delete",
    onDeleted,
  } = options;

  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteFn(pendingDelete._id);
      toast.success(successMessage);
      setPendingDelete(null);
      onDeleted?.();
    } catch {
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  }, [pendingDelete, deleteFn, successMessage, errorMessage, onDeleted]);

  return {
    pendingDelete,
    deleting,
    setPendingDelete,
    handleDelete,
  };
}
