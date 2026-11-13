"use client";

import { useState } from "react";
import { createManualEmailDraft } from "../actions";

type ManualEmailDraftFormProps = {
  bands: { id: number; name: string }[];
  venues: { id: number; name: string; email?: string | null }[];
};

export function ManualEmailDraftForm({
  bands,
  venues,
}: ManualEmailDraftFormProps) {
  const [recipientEmail, setRecipientEmail] = useState("");

  function selectVenue(venueId: string) {
    const venue = venues.find((item) => String(item.id) === venueId);
    setRecipientEmail(venue?.email ?? "");
  }

  return (
    <details className="manual-email-form">
      <summary>Manuellen Entwurf erstellen</summary>
      <form action={createManualEmailDraft} className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Band
            <select name="band_id" required defaultValue="">
              <option value="" disabled>
                Band auswählen
              </option>
              {bands.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Venue
            <select
              name="venue_id"
              required
              defaultValue=""
              onChange={(event) => selectVenue(event.target.value)}
            >
              <option value="" disabled>
                Venue auswählen
              </option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          Tourzeitraum
          <input
            name="tour_period"
            required
            placeholder="Zum Beispiel Juni bis August 2027"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Empfänger
          <input
            name="recipient_email"
            type="email"
            required
            value={recipientEmail}
            onChange={(event) => setRecipientEmail(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Betreff
          <input name="subject" required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Nachricht
          <textarea name="body" rows={8} required />
        </label>
        <button type="submit" className="primary-button w-fit">
          Entwurf speichern
        </button>
      </form>
    </details>
  );
}
