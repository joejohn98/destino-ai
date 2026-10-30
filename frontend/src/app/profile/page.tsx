"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { MyReviews } from "@/components/profile/my-reviews";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  DELETE_ACCOUNT_CONFIRMATION,
  profileSchema,
  type ProfileFormData,
} from "@/schemas/auth.schema";
import { api, ApiError, type AuthUser } from "@/lib/api";

const PROFILE_FORM_DEFAULTS: ProfileFormData = {
  firstName: "",
  lastName: "",
  email: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, status, signOut } = useAuth();

  if (status === "loading") return null;

  if (status === "unauthenticated" || !user) {
    router.replace("/signin?next=%2Fprofile");
    return null;
  }

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    user.username.slice(0, 2).toUpperCase();

  return (
    <main className="flex-1 bg-background">
      <div className="mx-auto max-w-page px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pt-10">
        <p className="text-eyebrow font-medium uppercase text-muted-foreground">
          Your account
        </p>
        <h1 className="mt-2 text-headline font-semibold text-ink">Profile</h1>

        <div className="mt-6 flex items-center gap-4">
          <Avatar size="lg" className="size-16">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-title font-semibold text-ink">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <ProfileEditor user={user} onDeleted={signOut} />
          <MyReviews />
        </div>
      </div>
    </main>
  );
}

function ProfileEditor({
  user,
  onDeleted,
}: {
  user: AuthUser;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const {
    handleSubmit,
    register,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: PROFILE_FORM_DEFAULTS,
    values: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  });

  const onSubmit = async (values: ProfileFormData) => {
    try {
      const payload: Partial<ProfileFormData> = {};
      if (values.firstName !== user.firstName) payload.firstName = values.firstName;
      if (values.lastName !== user.lastName) payload.lastName = values.lastName;
      if (values.email !== user.email)
        payload.email = values.email.trim().toLowerCase();

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save");
        return;
      }

      const { data } = await api.updateProfile(payload);
      signIn(data);
      toast.success("Profile updated");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "We couldn't update your profile. Try again.";
      setError("root", { message });
      toast.error("Update failed", { description: message });
    }
  };

  const handleDeleteImpl = async () => {
    if (confirmText.trim().toLowerCase() !== DELETE_ACCOUNT_CONFIRMATION) return;
    setDeleting(true);
    try {
      await api.deleteProfile();
      toast.success("Account deleted");
      onDeleted();
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error("Couldn't delete your account", {
        description:
          error instanceof ApiError
            ? error.message
            : "Check your connection and try again.",
      });
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile details</CardTitle>
        <CardDescription>
          Update your name and email. Your username and avatar can&apos;t be
          changed here yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <Field>
            <FieldLabel htmlFor="profile-first-name">First name</FieldLabel>
            <FieldControl id="profile-first-name" {...register("firstName")} />
            <FieldError errors={[errors.firstName]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="profile-last-name">Last name</FieldLabel>
            <FieldControl id="profile-last-name" {...register("lastName")} />
            <FieldError errors={[errors.lastName]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="profile-email">Email</FieldLabel>
            <FieldControl
              id="profile-email"
              type="email"
              autoComplete="email"
              {...register("email")}
            />
            <FieldDescription>
              Sign-in links and receipts go to this address.
            </FieldDescription>
            <FieldError errors={[errors.email]} />
          </Field>

          {errors.root && (
            <p role="alert" className="text-sm text-danger">
              {errors.root.message}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting && <Loader2 aria-hidden="true" className="animate-spin" />}
            Save changes
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          className="mt-4 self-start text-danger hover:text-danger"
          onClick={() => setDeleteOpen(true)}
        >
          Delete account
        </Button>
      </CardContent>

      <Dialog open={deleteOpen} onOpenChange={(open) => setDeleteOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently deletes your account and keeps your reviews with
              the author label &quot;Deleted user&quot;. This can&apos;t be undone.
              <span className="mt-2 block font-medium text-foreground">
                Type &quot;{DELETE_ACCOUNT_CONFIRMATION}&quot; to confirm.
              </span>
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="delete-confirm">Confirmation</FieldLabel>
            <FieldControl
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${DELETE_ACCOUNT_CONFIRMATION}"`}
            />
          </Field>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Keep account
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteImpl}
              disabled={
                deleting ||
                confirmText.trim().toLowerCase() !== DELETE_ACCOUNT_CONFIRMATION
              }
            >
              {deleting ? "Deleting…" : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}


