import { redirect } from "@/lib/navigation";

export default function AgentsPage() {
  redirect("/agents/chat");
  return null;
}
