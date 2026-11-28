function readPublicEnv(name: "NEXT_PUBLIC_INSFORGE_URL" | "NEXT_PUBLIC_INSFORGE_ANON_KEY") {
  switch (name) {
    case "NEXT_PUBLIC_INSFORGE_URL":
      return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_URL || "https://xgnzsikvguswhtozvokx.supabase.co";
    case "NEXT_PUBLIC_INSFORGE_ANON_KEY":
      return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "sb_publishable_pa1rLrMH8sLguAUhbTHfmw_wAcIY9hY";
  }
}

function getRequiredEnv(name: "NEXT_PUBLIC_INSFORGE_URL" | "NEXT_PUBLIC_INSFORGE_ANON_KEY") {
  const value = readPublicEnv(name);

  if (!value) {
    throw new Error(`Missing required InsForge environment variable: ${name}`);
  }

  return value;
}

export function hasInsforgePublicConfig() {
  return Boolean(
    readPublicEnv("NEXT_PUBLIC_INSFORGE_URL") &&
      readPublicEnv("NEXT_PUBLIC_INSFORGE_ANON_KEY"),
  );
}

export function getInsforgePublicConfig() {
  return {
    baseUrl: getRequiredEnv("NEXT_PUBLIC_INSFORGE_URL").trim().replace(/\/+$/, ""),
    anonKey: getRequiredEnv("NEXT_PUBLIC_INSFORGE_ANON_KEY").trim(),
  };
}
