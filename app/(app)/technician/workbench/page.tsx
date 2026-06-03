import { redirect } from "next/navigation";
import JobsPage from "@/app/(app)/jobs/page";
import { requireUser } from "@/lib/permissions";

export default async function TechnicianWorkbenchPage() {
  const user = await requireUser(["TECHNICIAN"]);
  if (user.role !== "TECHNICIAN") redirect("/dashboard");
  return <JobsPage searchParams={Promise.resolve({})} />;
}
