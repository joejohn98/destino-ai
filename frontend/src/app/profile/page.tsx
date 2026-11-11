"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { MyReviews } from "@/components/profile/my-reviews";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
