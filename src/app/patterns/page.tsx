import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PatternDashboard } from "@/components/patterns/PatternDashboard";

export const metadata: Metadata = {
  title: "Patterns",
  description:
    "What the anonymous submissions to this platform show about relationship, age, setting, and experience type — shown as privacy-safe ranges, never as population prevalence.",
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

type PatternSearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function PatternsPage({
  searchParams,
}: {
  searchParams: PatternSearchParams;
}) {
  const query = await searchParams;
  const initialRelationship = first(query.relationship);

  return (
    <div>
      <PageHeader
        eyebrow="The bigger picture"
        title="Patterns"
        description="Looking across submissions can help reveal recurring patterns — by relationship, age, setting, and experience type."
      />
      <PatternDashboard initialRelationship={initialRelationship} />
    </div>
  );
}
