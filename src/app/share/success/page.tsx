import type { Metadata } from "next";
import { SubmissionSuccess } from "@/components/submission/SubmissionSuccess";

export const metadata: Metadata = {
  title: "Thank you for sharing",
};

export default function ShareSuccessPage() {
  return <SubmissionSuccess />;
}
