"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  generateEmailDraftBatch,
  type GenerateEmailDraftBatchState,
} from "../actions";
import { emailLengthOptions, emailStyleOptions } from "./emailDraftOptions";

const initialState: GenerateEmailDraftBatchState = { error: null };

export function GenerateEmailDraftBatchForm({
  bookings,
}: {
  bookings: { id: number; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    generateEmailDraftBatch,
    initialState,
  );
  const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
  const [draftCount, setDraftCount] = useState("1");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    "professional",
  ]);
  const [length, setLength] = useState("medium");

  function toggleBooking(id: number) {
    const limit = Number(draftCount);
    setSelectedBookings((current) =>
      current.includes(id)
        ? current.filter((selected) => selected !== id)
        : current.length < limit
          ? [...current, id]
          : current,
    );
  }

  function changeDraftCount(value: string) {
    const nextCount = Math.min(20, Math.max(1, Number(value) || 1));
    setDraftCount(String(nextCount));
    setSelectedBookings((current) => current.slice(0, nextCount));
  }

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
      <h2 className="text-lg font-semibold">Mehrere KI-Entwürfe erstellen</h2>
      <p className="mt-1 text-sm text-[#b9aa9a]">
        Wähle bis zu 20 Bookings. Pro Booking wird ein eigener Entwurf erzeugt.
      </p>
      {bookings.length === 0 ? (
        <p className="mt-3">
          Lege zuerst unter <Link className="underline" href="/bookings">Bookings</Link> eine Anfrage an.
        </p>
      ) : (
        <form action={formAction} className="mt-4">
          <fieldset disabled={pending} className="grid gap-4">
            <fieldset className="grid gap-2">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <legend className="text-sm font-semibold">
                  Bookings auswählen ({selectedBookings.length}/{draftCount})
                </legend>
                <label className="flex items-center gap-2 text-sm">
                  Anzahl Entwürfe
                  <input
                    className="w-20"
                    name="draft_count"
                    type="number"
                    min={1}
                    max={20}
                    value={draftCount}
                    onChange={(event) => changeDraftCount(event.target.value)}
                  />
                </label>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {bookings.map((booking) => (
                  <label className="flex items-center gap-2 text-sm" key={booking.id}>
                    <input
                      type="checkbox"
                      name="booking_ids"
                      value={booking.id}
                      checked={selectedBookings.includes(booking.id)}
                      disabled={
                        !selectedBookings.includes(booking.id) && selectedBookings.length >= Number(draftCount)
                      }
                      onChange={() => toggleBooking(booking.id)}
                    />
                    <span>{booking.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1 text-sm">
              Gemeinsamer Tourzeitraum
              <input
                name="tour_period"
                required
                maxLength={200}
                placeholder="Zum Beispiel Juni bis August 2027"
              />
            </label>

            <fieldset>
              <legend className="text-sm font-semibold">Mail-Moodboard</legend>
              <div className="email-style-board mt-3">
                {emailStyleOptions.map(([value, title, description]) => {
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
              <p className="mt-2 text-xs text-[#b9aa9a]">
                {selectedStyles.length} von 7 Eigenschaften ausgewählt
              </p>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold">Länge der Mail</legend>
              <div className="email-length-board mt-3">
                {emailLengthOptions.map(([value, title, description]) => (
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

            <label className="flex flex-col gap-1 text-sm">
              Gemeinsame Hinweise (optional)
              <textarea
                name="notes"
                rows={3}
                maxLength={4000}
                placeholder="Zum Beispiel: Bitte unser neues Album hervorheben."
              />
            </label>

            <button
              className="primary-button w-fit"
              type="submit"
              disabled={selectedBookings.length !== Number(draftCount)}
            >
              {pending ? "Entwürfe werden erstellt …" : `${draftCount} Entwürfe starten`}
            </button>
          </fieldset>
          {pending && (
            <p className="mt-3 text-sm" role="status">
              Die KI erstellt die ausgewählten Entwürfe. Das kann einen Moment dauern.
            </p>
          )}
          {!pending && state.error && <p className="mt-3" role="alert">{state.error}</p>}
          {!pending && state.draftIds && (
            <p className="mt-3" role="status">
              {state.draftIds.length} Entwürfe gespeichert. {" "}
              <Link className="underline" href="/email-drafts">Entwürfe ansehen</Link>
            </p>
          )}
        </form>
      )}
    </section>
  );
}
