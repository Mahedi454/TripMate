"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

/** Ends the Firebase session and returns to the login page. */
export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    try {
      await signOut(getFirebaseAuth());
    } finally {
      router.replace("/login");
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      isLoading={isLoading}
      loadingText="Signing out..."
      leadingIcon={isLoading ? undefined : <LogOut className="size-4" strokeWidth={1.9} />}
      onClick={handleSignOut}
    >
      Sign out
    </Button>
  );
}
