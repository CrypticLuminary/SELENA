import { TriangleAlert } from "lucide-react";
import {
  publicAgeGroupLabel,
  publicExperienceTypeLabel,
  publicRelationshipLabel,
  publicSettingLabel,
  warningLabel,
} from "@/data/categories";
import type { Story } from "@/types/story";
import { Badge } from "@/components/ui/badge";

/** A small labelled metadata pair. */
function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

/** Structured context for a story. Intentionally minimal to avoid a fingerprint. */
export function StoryMeta({
  story,
  showExperience = false,
}: {
  story: Story;
  showExperience?: boolean;
}) {
  return (
    <div>
      <dl className="flex flex-wrap gap-x-8 gap-y-3">
        <MetaItem
          label="Age when it happened"
          value={publicAgeGroupLabel(story.ageGroup)}
        />
        <MetaItem
          label="Relationship"
          value={publicRelationshipLabel(story.relationship)}
        />
        <MetaItem label="Setting" value={publicSettingLabel(story.setting)} />
      </dl>

      {showExperience && story.experienceTypes.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {story.experienceTypes.map((e) => (
            <Badge key={e} tone="neutral">
              {publicExperienceTypeLabel(e)}
            </Badge>
          ))}
        </div>
      ) : null}

      {story.warnings.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {story.warnings.map((w) => (
            <Badge key={w} tone="caution">
              <TriangleAlert className="h-3 w-3" aria-hidden="true" />
              {warningLabel(w)}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
