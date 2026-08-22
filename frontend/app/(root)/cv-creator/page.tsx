import { redirect } from "next/navigation";

export default function Page() {
  redirect("/cv?tab=creator");
}
