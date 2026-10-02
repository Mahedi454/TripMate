"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/** Ends the Supabase session and returns to the login page. */
export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    try {
      await getSupabaseBrowserClient().auth.signOut();
    } finally {
      router.replace("/login");
      router.refresh();
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
