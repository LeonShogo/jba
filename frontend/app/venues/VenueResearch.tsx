"use client";

import { useActionState, useState } from "react";
import {
  researchVenues,
  type VenueResearchActionState,
  type VenueResearchCandidate,
} from "../actions";
import { VenueCreateForm } from "./VenueCreateForm";

const initialState: VenueResearchActionState = {
  candidates: [],
  error: null,
};

function candidateKey(candidate: VenueResearchCandidate) {
  return JSON.stringify([
    candidate.name.trim().toLowerCase(),
    candidate.city.trim().toLowerCase(),
  ]);
}

export function VenueResearch() {
  const [state, formAction, pending] = useActionState(
    researchVenues,
    initialState,
  );
  const [savedCandidateKeys, setSavedCandidateKeys] = useState<string[]>([]);
  const visibleCandidates = state.candidates.filter(
    (candidate) => !savedCandidateKeys.includes(candidateKey(candidate)),
  );

  return (
    <section className="my-6 rounded-lg border border-[#4a3c32] bg-[#1d1916] p-5">
      <h2 className="mb-4 text-lg font-semibold">KI-Venue-Recherche</h2>

      <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <label className="flex min-w-0 flex-col gap-2 text-sm">
          Land
        <input
          className="w-full"
          name="country"
          defaultValue="Deutschland"
          placeholder="Land"
          required
        />
        </label>
        <label className="flex min-w-0 flex-col gap-2 text-sm">
          Bundesland oder Region
          <input className="w-full" name="region" placeholder="Zum Beispiel Sachsen" />
        </label>

        <label className="flex min-w-0 flex-col gap-2 text-sm">
          Venue-Typ
        <select className="w-full" name="venue_type" defaultValue="club">
          <option value="club">Clubs</option>
          <option value="festival">Festivals</option>
          <option value="both">Beides</option>
        </select>
        </label>
        <label className="flex min-w-0 flex-col gap-2 text-sm">
          Gewünschte Ergebnisanzahl
        <input
          className="w-full"
          type="number"
          name="max_results"
          min="1"
          max="20"
          defaultValue="5"
        />
        </label>

        <label className="flex min-w-0 flex-col gap-2 text-sm">
          Ähnliche Künstler
        <input
          className="w-full"
          name="reference_artists"
          placeholder="Ähnliche Künstler, durch Komma getrennt"
        />
        </label>

        <label className="flex min-w-0 flex-col gap-2 text-sm">
          Übernahme der Ergebnisse
        <select className="w-full" name="mode" defaultValue="review">
          <option value="review">Vor dem Speichern prüfen</option>
          <option value="automatic">Automatisch speichern</option>
        </select>
        </label>

        <button className="primary-button justify-self-start sm:col-span-2 xl:col-span-3" type="submit" disabled={pending}>
          {pending ? "Recherche läuft …" : "Recherche starten"}
        </button>
      </form>

      {state.error && <p className="mt-4" role="alert">{state.error}</p>}

      {state.savedCount !== undefined && state.savedCount > 0 && (
        <p>{state.savedCount} neue Venues wurden automatisch gespeichert. </p>
      )}

      {visibleCandidates.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 font-semibold">Gefundene Venues</h3>

          <ul className="grid gap-4 lg:grid-cols-2">
            {visibleCandidates.map((candidate) => (
              <li className="space-y-2 rounded-lg border border-[#4a3c32] p-4" key={`${candidate.name}-${candidate.city}`}>
                <strong>{candidate.name}</strong>
                <p>
                  {candidate.venue_type} · {candidate.city}
                  {candidate.state ? `, ${candidate.state}` : ""}
                </p>
                <p>{candidate.email ?? "Keine E-Mail gefunden"}</p>

                <a href={candidate.source_url} target="_blank" rel="noreferrer">
                  Quelle prüfen
                </a>

                <VenueCreateForm
                  onSuccess={() => setSavedCandidateKeys((saved) => [...saved, candidateKey(candidate)])}
                >
                  <input type="hidden" name="name" value={candidate.name} />
                  <input type="hidden" name="city" value={candidate.city} />
                  <input
                    type="hidden"
                    name="state"
                    value={candidate.state ?? ""}
                  />
                  <input
                    type="hidden"
                    name="country"
                    value={candidate.country ?? ""}
                  />
                  <input
                    type="hidden"
                    name="venue_type"
                    value={candidate.venue_type}
                  />
                  <input
                    type="hidden"
                    name="email"
                    value={candidate.email ?? ""}
                  />
                  <input
                    type="hidden"
                    name="contact_person"
                    value={candidate.contact_person ?? ""}
                  />
                  <input
                    type="hidden"
                    name="website"
                    value={candidate.website ?? ""}
                  />
                  <input
                    type="hidden"
                    name="phone"
                    value={candidate.phone ?? ""}
                  />

                  <button type="submit">Venue übernehmen</button>
                </VenueCreateForm>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
