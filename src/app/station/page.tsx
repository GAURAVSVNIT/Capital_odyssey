import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function StationIndexPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");
  if (session.user.stationNumber == null) redirect("/login");
  redirect(`/station/${session.user.stationNumber}`);
}
