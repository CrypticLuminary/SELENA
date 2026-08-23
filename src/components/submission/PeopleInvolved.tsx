"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { SubmissionForm } from "@/lib/submission-schema";
import type { PersonInvolved } from "@/types/submission";
import { PersonEntry } from "./PersonEntry";

function emptyPerson(): PersonInvolved {
  return {
    relationshipCategory: "",
    relationshipDetail: "",
    involvement: "",
    ageBand: "",
  };
}

function PeopleEditor({
  value,
  onChange,
}: {
  value: PersonInvolved[];
  onChange: (next: PersonInvolved[]) => void;
}) {
  const people = value ?? [];
  const [focusIdx, setFocusIdx] = useState<number | null>(null);

  function add() {
    const next = [...people, emptyPerson()];
    onChange(next);
    setFocusIdx(next.length - 1);
  }
  function update(i: number, p: PersonInvolved) {
    onChange(people.map((x, idx) => (idx === i ? p : x)));
  }
  function remove(i: number) {
    onChange(people.filter((_, idx) => idx !== i));
    setFocusIdx(null);
  }

  return (
    <section aria-labelledby="people-heading">
      <h3 id="people-heading" className="font-serif text-card text-ink">
        Who was involved?{" "}
        <span className="align-middle text-[0.72rem] font-medium uppercase tracking-[0.1em] text-ink-faint">
          Optional
        </span>
      </h3>
      <p className="mt-1.5 text-ui leading-relaxed text-ink-soft">
        You can share as much or as little detail as you&rsquo;re comfortable
        with. You don&rsquo;t need to identify anyone, and you can describe more
        than one person.
      </p>

      {people.length > 0 ? (
        <div className="mt-4 space-y-3">
          {people.map((person, i) => (
            <PersonEntry
              key={i}
              person={person}
              index={i}
              autoFocus={focusIdx === i}
              onChange={(p) => update(i, p)}
              onRemove={() => remove(i)}
            />
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={add}
        className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-dashed border-line-strong px-4 py-2.5 text-ui font-medium text-accent transition-colors hover:border-accent hover:bg-accent-soft/50"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {people.length === 0 ? "Add someone" : "Add another person"}
      </button>
    </section>
  );
}

/** RHF-connected wrapper — the whole array is one controlled value. */
export function PeopleInvolved() {
  const { control } = useFormContext<SubmissionForm>();
  return (
    <Controller
      control={control}
      name="peopleInvolved"
      render={({ field }) => (
        <PeopleEditor value={field.value} onChange={field.onChange} />
      )}
    />
  );
}
