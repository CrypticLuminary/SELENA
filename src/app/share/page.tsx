import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubmissionWizard } from "@/components/submission/SubmissionWizard";

export const metadata: Metadata = {
  title: "Share your experience",
  description:
    "Share anonymously — no account, name, email, phone, or exact location required. Choose whether your story is public or contributes to statistics only.",
};

export default function SharePage() {
  return (
    <div className="mx-auto max-w-form">
      <PageHeader
        eyebrow="An invitation, not a form"
        title="Share your experience"
        description="Anonymously, at your own pace. You choose whether your story is read by others, or only helps shape the broader patterns."
      />
      <div className="mt-10">
        <SubmissionWizard />
      </div>
    </div>
  );
}
