import { Redirect } from "wouter";

export default function SettingsPage() {
  return (
    <>
      <div className="flex h-full items-center justify-center bg-background/50">
        <p className="text-muted-foreground text-sm">Redirecting…</p>
      </div>
      <Redirect to="/account/settings" />
    </>
  );
}
