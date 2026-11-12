"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  generateEmailDraftBatch,
  type GenerateEmailDraftBatchState,
} from "../actions";
import { emailLengthOptions, emailStyleOptions } from "./emailDraftOptions";

const initialState: GenerateEmailDraftBatchState = { error: null };

export function GenerateEmailDraftBatchForm({
  bands,
  venues,
}: {
  bands: { id: number; name: string }[];
  venues: {
    id: number;
    name: string;
    country?: string | null;
    state?: string | null;
    city?: string | null;
  }[];
}) {
  const [state, formAction, pending] = useActionState(
    generateEmailDraftBatch,
    initialState,
  );
  const router = useRouter();
  const [draftCount, setDraftCount] = useState("1");
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["professional"]);
  const [length, setLength] = useState("medium");
  const count = Number(draftCount) || 0;
  const countryOptions = [...new Set(venues.map((venue) => venue.country).filter((value): value is string => Boolean(value)))]
    .sort((a, b) => String(a).localeCompare(String(b), "de"));
  const stateOptions = [...new Set(venues
    .filter((venue) => !countryFilter || venue.country === countryFilter)
    .map((venue) => venue.state)
    .filter((value): value is string => Boolean(value)))]
    .sort((a, b) => String(a).localeCompare(String(b), "de"));
  const normalizedCity = cityFilter.trim().toLocaleLowerCase("de-DE");
  const filteredVenues = venues
    .filter((venue) =>
      (!countryFilter || venue.country === countryFilter) &&
      (!stateFilter || venue.state === stateFilter) &&
      (!normalizedCity || (venue.city ?? "").toLocaleLowerCase("de-DE").includes(normalizedCity))
    )
    .sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));

  useEffect(() => {
    if (state.draftIds?.length) router.refresh();
  }, [router, state.draftIds]);

  function changeDraftCount(value: string) {
    const nextValue = value.replace(/\D/g, "").slice(0, 2);
    const nextCount = Number(nextValue) || 0;
    setDraftCount(nextValue === "" && selectedVenues.length === 0
      ? ""
      : String(Math.max(nextCount, selectedVenues.length)));
  }

  function normalizeDraftCount() {
    const nextCount = Math.min(20, Math.max(1, selectedVenues.length, Number(draftCount) || 1));
    setDraftCount(String(nextCount));
  }

  function toggleStyle(style: string) {
    setSelectedStyles((current) => {
      if (current.includes(style)) return current.filter((selected) => selected !== style);
      if (current.length >= 7) return current;
      return [...current, style];
    });
  }

  return (
    <section className="mt-6 max-w-3xl rounded-lg border border-[#4a3c32] p-4">
      <h2 className="text-lg font-semibold">KI-Mail-Entwürfe erstellen</h2>
      <p className="mt-1 text-sm text-[#b9aa9a]">
        Eine Band auswählen, mehrere Venues markieren und für jedes Venue direkt ein Booking mit Mail-Entwurf anlegen.
      </p>
      {bands.length === 0 || venues.length === 0 ? (
        <p className="mt-3">Lege zuerst eine Band und mindestens ein Venue an.</p>
      ) : (
        <form action={formAction} className="mt-4">
          <fieldset disabled={pending} className="grid gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Band
              <select name="band_id" defaultValue="" required>
                <option value="" disabled>Band wählen</option>
                {bands.map((band) => (
                  <option key={band.id} value={band.id}>{band.name}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_7rem]">
              <fieldset>
                <legend className="text-sm font-semibold">Venues auswählen</legend>
                <div className="venue-filters mt-2">
                  <select aria-label="Land filtern" value={countryFilter} onChange={(event) => {
                    setCountryFilter(event.target.value);
                    setStateFilter("");
                  }}>
                    <option value="">Alle Länder</option>
                    {countryOptions.map((country) => <option key={country} value={country}>{country}</option>)}
                  </select>
                  <select aria-label="Bundesland filtern" value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}>
                    <option value="">Alle Bundesländer</option>
                    {stateOptions.map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                  <input aria-label="Stadt filtern" placeholder="Stadt suchen" value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} />
                </div>
                <div className="venue-picker mt-2">
                  {selectedVenues.filter((id) => !filteredVenues.some((venue) => String(venue.id) === id)).map((id) => (
                    <input key={id} type="hidden" name="venue_ids" value={id} />
                  ))}
                  {filteredVenues.map((venue) => {
                    const selected = selectedVenues.includes(String(venue.id));
                    return (
                      <label className={`venue-option${selected ? " selected" : ""}`} key={venue.id}>
                        <input
                          type="checkbox"
                          name="venue_ids"
                          value={venue.id}
                          checked={selected}
                          onChange={(event) => {
                            const venueId = String(venue.id);
                            const next = event.target.checked
                              ? [...selectedVenues, venueId]
                              : selectedVenues.filter((id) => id !== venueId);
                            setSelectedVenues(next);
                            if (next.length > count) setDraftCount(String(next.length));
                          }}
                        />
                        <span>{venue.name}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-1 text-xs text-[#b9aa9a]">{filteredVenues.length} Venues angezeigt, alphabetisch sortiert.</p>
              </fieldset>
              <label className="flex flex-col gap-1 text-sm">
                Anzahl Entwürfe
                <input
                  name="draft_count"
                  type="number"
                  min={1}
                  max={20}
                  inputMode="numeric"
                  value={draftCount}
                  onChange={(event) => changeDraftCount(event.target.value)}
                  onBlur={normalizeDraftCount}
                  required
                />
              </label>
            </div>
            <p className="text-xs text-[#b9aa9a]">
              {selectedVenues.length} von {draftCount || "…"} Venues ausgewählt.
            </p>

            <label className="flex flex-col gap-1 text-sm">
              Tourzeitraum
              <input name="tour_period" required maxLength={200} placeholder="Zum Beispiel Juni bis August 2027" />
            </label>

            <fieldset>
              <legend className="text-sm font-semibold">Mail-Moodboard</legend>
              <div className="email-style-board mt-3">
                {emailStyleOptions.map(([value, title, description]) => {
                  const selected = selectedStyles.includes(value);
                  const limitReached = selectedStyles.length >= 7 && !selected;
                  return (
                    <label className={`email-style-card${selected ? " selected" : ""}${limitReached ? " disabled" : ""}`} key={value}>
                      <input type="checkbox" name="style_attributes" value={value} checked={selected} disabled={limitReached} onChange={() => toggleStyle(value)} />
                      <span className="email-style-card-title">{title}</span>
                      <span className="email-style-card-description">{description}</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-[#b9aa9a]">{selectedStyles.length} von 7 Eigenschaften ausgewählt</p>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold">Länge der Mail</legend>
              <div className="email-length-board mt-3">
                {emailLengthOptions.map(([value, title, description]) => (
                  <label className={`email-style-card${length === value ? " selected" : ""}`} key={value}>
                    <input type="radio" name="length" value={value} checked={length === value} onChange={() => setLength(value)} />
                    <span className="email-style-card-title">{title}</span>
                    <span className="email-style-card-description">{description}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1 text-sm">
              Gemeinsame Hinweise (optional)
              <textarea name="notes" rows={3} maxLength={4000} placeholder="Zum Beispiel: Bitte unser neues Album hervorheben." />
            </label>

            <button className="primary-button w-fit" type="submit" disabled={selectedVenues.length !== count || count < 1}>
              {pending ? "Entwürfe werden erstellt …" : `${draftCount || "0"} Entwürfe starten`}
            </button>
          </fieldset>
          {pending && <p className="mt-3 text-sm" role="status">Bookings und Entwürfe werden erstellt. Das kann einen Moment dauern.</p>}
          {!pending && state.error && <p className="mt-3" role="alert">{state.error}</p>}
          {!pending && state.draftIds && (
            <p className="mt-3" role="status">
              {state.draftIds.length} Entwürfe gespeichert. <Link className="underline" href={`/email-drafts?review=${state.draftIds[0]}`}>Entwürfe ansehen</Link>
            </p>
          )}
        </form>
      )}
    </section>
  );
}
