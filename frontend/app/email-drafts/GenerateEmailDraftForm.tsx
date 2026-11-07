"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { generateEmailDraft, type GenerateEmailDraftState } from "../actions";

const initialState: GenerateEmailDraftState = { error: null };

const styleOptions = [
  ["professional", "Professionell", "klar und verlässlich"],
  ["casual", "Locker", "kollegial und entspannt"],
  ["formal", "Förmlich", "sachlich und höflich"],
  ["warm", "Herzlich", "zugewandt und freundlich"],
  ["personal", "Persönlich", "menschlich und nahbar"],
  ["direct", "Direkt", "ohne Umwege"],
  ["concise", "Kurz", "konzentriert und knapp"],
  ["confident", "Selbstbewusst", "klar in der eigenen Stärke"],
  ["enthusiastic", "Begeistert", "lebendig und voller Vorfreude"],
  ["understated", "Zurückhaltend", "ruhig und unaufdringlich"],
  ["inviting", "Einladend", "offen und zugänglich"],
  ["respectful", "Respektvoll", "aufmerksam und wertschätzend"],
  ["vivid", "Anschaulich", "konkret und bildhaft"],
  ["grounded", "Bodenständig", "glaubwürdig und nahbar"],
  ["elegant", "Elegant", "ruhig und stilvoll"],
  ["curious", "Interessiert", "neugierig auf die Venue"],
] as const;

export function GenerateEmailDraftForm({
  bookings,
  selectedBookingId,
}: {
  bookings: { id: number; label: string }[];
  selectedBookingId: number | null;
}) {
  const [state, formAction, pending] = useActionState(generateEmailDraft, initialState);
  const [bookingId, setBookingId] = useState(selectedBookingId?.toString() ?? "");
  const [tourPeriod, setTourPeriod] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    "professional",
  ]);
  const [length, setLength] = useState("medium");

  function toggleStyle(style: string) {
    setSelectedStyles((current) => {
      if (current.includes(style)) {
        return current.filter((selected) => selected !== style);
      }
      if (current.length >= 7) return current;
      return [...current, style];
    });
  }

  return (
    <section className="mt-6 max-w-3xl rounded-lg border border-[#4a3c32] p-4">
      <h2 className="text-lg font-semibold">KI-Entwurf erstellen</h2>
      <p className="mt-1 text-sm text-[#b9aa9a]">Der Entwurf wird zur Prüfung gespeichert. Es wird keine Mail versendet.</p>
      {bookings.length === 0 && <p className="mt-3">Lege zuerst unter <Link className="underline" href="/bookings">Bookings</Link> eine Anfrage an.</p>}
      <form action={formAction} className="mt-4">
        <fieldset disabled={pending || bookings.length === 0} className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Booking
            <select name="booking_id" required value={bookingId} onChange={(event) => setBookingId(event.target.value)}>
              <option value="" disabled>Booking wählen</option>
              {bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Gewünschter Tourzeitraum
            <input name="tour_period" required maxLength={200} placeholder="Zum Beispiel Juni bis August 2027" value={tourPeriod} onChange={(event) => setTourPeriod(event.target.value)} />
          </label>
          <fieldset className="md:col-span-2">
            <legend className="text-sm font-semibold">Mail-Moodboard</legend>
            <p className="mt-1 text-xs text-[#b9aa9a]">
              Wähle bis zu sieben Eigenschaften. Kombinationen wie „kurz“, „herzlich“ und „direkt“ sind möglich.
            </p>
            <div className="email-style-board mt-3">
              {styleOptions.map(([value, title, description]) => {
                const selected = selectedStyles.includes(value);
                const limitReached = selectedStyles.length >= 7 && !selected;
                return (
                  <label
                    className={`email-style-card${selected ? " selected" : ""}${limitReached ? " disabled" : ""}`}
                    key={value}
                  >
                    <input
                      type="checkbox"
                      name="style_attributes"
                      value={value}
                      checked={selected}
                      disabled={limitReached}
                      onChange={() => toggleStyle(value)}
                    />
                    <span className="email-style-card-title">{title}</span>
                    <span className="email-style-card-description">{description}</span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-[#b9aa9a]" aria-live="polite">
              {selectedStyles.length} von 7 Eigenschaften ausgewählt
            </p>
          </fieldset>
          <fieldset className="md:col-span-2">
            <legend className="text-sm font-semibold">Länge der Mail</legend>
            <div className="email-length-board mt-3">
              {[
                ["short", "Kurz", "direkt auf den Punkt"],
                ["medium", "Mittel", "ausgewogen und persönlich"],
                ["long", "Lang", "mehr Raum für Details"],
              ].map(([value, title, description]) => (
                <label
                  className={`email-style-card${length === value ? " selected" : ""}`}
                  key={value}
                >
                  <input
                    type="radio"
                    name="length"
                    value={value}
                    checked={length === value}
                    onChange={() => setLength(value)}
                  />
                  <span className="email-style-card-title">{title}</span>
                  <span className="email-style-card-description">{description}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            Zusätzliche Hinweise für diesen Entwurf (optional)
            <textarea name="notes" rows={4} maxLength={4000} placeholder="Zum Beispiel: Bitte kurz halten und unser neues Album hervorheben." value={notes} onChange={(event) => setNotes(event.target.value)} />
            <span className="text-xs text-[#b9aa9a]">Vorhandene Booking-Notizen werden ebenfalls berücksichtigt. Diese Hinweise ändern sie nicht.</span>
          </label>
          <button className="primary-button w-fit" type="submit">{pending ? "Entwurf wird erstellt …" : "KI-Entwurf erstellen"}</button>
        </fieldset>
        {pending && <p className="mt-3 text-sm" role="status">Die KI formuliert deine Mail. Das kann einen Moment dauern.</p>}
        {!pending && state.error && <p className="mt-3" role="alert">{state.error}</p>}
        {!pending && state.draftId && (
          <p className="mt-3" role="status">Entwurf gespeichert. <Link className="underline" href={`/email-drafts?booking_id=${state.bookingId}#draft-${state.draftId}`}>Entwurf ansehen</Link></p>
        )}
      </form>
    </section>
  );
}
