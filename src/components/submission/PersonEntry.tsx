"use client";

import { ChevronDown, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  INVOLVEMENT_OPTIONS,
  PERSON_AGE_BANDS,
  PERSON_RELATIONSHIP_CATEGORIES,
  PERSON_RELATIONSHIP_DETAILS,
  involvementLabel,
  personRelationshipCategoryLabel,
  personRelationshipDetailLabel,
} from "@/data/categories";
import type { PersonInvolved } from "@/types/submission";
import { Select } from "@/components/ui/select";
import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

function summaryOf(person: PersonInvolved): string {
  const rel = person.relationshipDetail
    ? personRelationshipDetailLabel(person.relationshipDetail)
    : person.relationshipCategory
      ? personRelationshipCategoryLabel(person.relationshipCategory)
      : "";
  const inv =
    person.involvement && person.involvement !== "prefer_not"
      ? involvementLabel(person.involvement)
      : "";
  return [rel, inv].filter(Boolean).join(" · ");
}

export function PersonEntry({
  person,
  index,
  autoFocus = false,
  onChange,
  onRemove,
}: {
  person: PersonInvolved;
  index: number;
  autoFocus?: boolean;
  onChange: (p: PersonInvolved) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  const panelId = useId();
  const firstRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (autoFocus) firstRef.current?.focus();
    // mount-only: focus the freshly added person
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const details = PERSON_RELATIONSHIP_DETAILS[person.relationshipCategory];
  const summary = summaryOf(person);

  return (
    <div className="rounded-2xl border border-line bg-surface">
      <div className="flex items-start justify-between gap-2 p-4">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-[40px] flex-1 items-start gap-2 text-left"
        >
          <ChevronDown
            className={cn(
              "mt-1 h-4 w-4 shrink-0 text-ink-faint transition-transform",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
          <span>
            <span className="block text-[0.72rem] font-medium uppercase tracking-[0.1em] text-ink-faint">
              Person {index + 1}
            </span>
            <span className="mt-0.5 block font-serif text-[1.05rem] text-ink">
              {summary || "Someone involved"}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove person ${index + 1}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-muted hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {open ? (
        <div
          id={panelId}
          className="space-y-6 border-t border-line px-4 py-5"
        >
          <label className="block">
            <span className="mb-2 block text-ui font-medium text-ink">
              Relationship
            </span>
            <Select
              ref={firstRef}
              value={person.relationshipCategory}
              onChange={(e) =>
                onChange({
                  ...person,
                  relationshipCategory: e.target.value,
                  relationshipDetail: "",
                })
              }
            >
              <option value="">Select a relationship…</option>
              {PERSON_RELATIONSHIP_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </label>

          {details ? (
            <label className="block">
              <span className="mb-2 block text-ui font-medium text-ink">
                More specifically, if you&rsquo;d like
              </span>
              <Select
                value={person.relationshipDetail}
                onChange={(e) =>
                  onChange({ ...person, relationshipDetail: e.target.value })
                }
              >
                <option value="">Prefer not to say</option>
                {details.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </label>
          ) : null}

          <fieldset>
            <legend className="mb-2 text-ui font-medium text-ink">
              How were they involved?
            </legend>
            <RadioGroup
              name={`involvement-${index}`}
              options={INVOLVEMENT_OPTIONS}
              value={person.involvement || null}
              onChange={(v) => onChange({ ...person, involvement: v })}
            />
          </fieldset>

          <label className="block">
            <span className="mb-2 block text-ui font-medium text-ink">
              Approximate age, if known
            </span>
            <Select
              value={person.ageBand}
              onChange={(e) =>
                onChange({ ...person, ageBand: e.target.value })
              }
            >
              <option value="">Select an age range…</option>
              {PERSON_AGE_BANDS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </Select>
          </label>
        </div>
      ) : null}
    </div>
  );
}
