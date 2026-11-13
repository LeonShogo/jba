import Link from "next/link";
import {
  deleteBookingDrafts,
  deleteEmailDraft,
} from "../actions";
import { GenerateEmailDraftBatchForm } from "./GenerateEmailDraftBatchForm";
import { DraftReviewDialog } from "./DraftReviewDialog";
import { ManualEmailDraftForm } from "./ManualEmailDraftForm";

type EmailDraft = {
  id: number;
  booking_id: number;
  tour_period: string | null;
  recipient_email: string;
  subject: string;
  body: string;
  status: "draft" | "approved" | "sent";
};

type Booking = {
  id: number;
  band_id: number;
  venue_id: number;
};

type NamedRecord = {
  id: number;
  name: string;
  email?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
};

type EmailDraftsPageProps = {
  searchParams: Promise<{ booking_id?: string; review?: string }>;
};

export default async function EmailDraftsPage({
  searchParams,
}: EmailDraftsPageProps) {
  const { booking_id: bookingIdParameter, review: reviewParameter } =
    await searchParams;
  const requestedBookingId = Number(bookingIdParameter);
  const reviewDraftId = Number(reviewParameter);

  const [draftsResponse, bookingsResponse, bandsResponse, venuesResponse] =
    await Promise.all([
      fetch(`${process.env.API_URL}/email-drafts`, { cache: "no-store" }),
      fetch(`${process.env.API_URL}/bookings`, { cache: "no-store" }),
      fetch(`${process.env.API_URL}/bands`, { cache: "no-store" }),
      fetch(`${process.env.API_URL}/venues`, { cache: "no-store" }),
    ]);

  if (
    !draftsResponse.ok ||
    !bookingsResponse.ok ||
    !bandsResponse.ok ||
    !venuesResponse.ok
  ) {
    throw new Error("E-Mail-Entwürfe konnten nicht geladen werden.");
  }

  const drafts: EmailDraft[] = await draftsResponse.json();
  const bookings: Booking[] = await bookingsResponse.json();
  const bands: NamedRecord[] = await bandsResponse.json();
  const venues: NamedRecord[] = await venuesResponse.json();
  const bandNames = new Map(bands.map((band) => [band.id, band.name]));
  const venueNames = new Map(venues.map((venue) => [venue.id, venue.name]));
  const bookingLabels = new Map(
    bookings.map((booking) => [
      booking.id,
      `${bandNames.get(booking.band_id) ?? "Unbekannte Band"} – ${venueNames.get(booking.venue_id) ?? "Unbekanntes Venue"}`,
    ]),
  );
  const nextDraftNumber = new Map<number, number>();
  const draftNumbers = new Map<number, number>();

  for (const draft of [...drafts].sort((a, b) => a.id - b.id)) {
    const number = (nextDraftNumber.get(draft.booking_id) ?? 0) + 1;
    nextDraftNumber.set(draft.booking_id, number);
    draftNumbers.set(draft.id, number);
  }

  const selectedBookingId = bookings.some(
    (booking) => booking.id === requestedBookingId,
  )
    ? requestedBookingId
    : null;
  const visibleDrafts = selectedBookingId
    ? drafts.filter((draft) => draft.booking_id === selectedBookingId)
    : drafts;
  const draftsByBooking = new Map<number, EmailDraft[]>();

  for (const draft of visibleDrafts) {
    const bookingDrafts = draftsByBooking.get(draft.booking_id) ?? [];
    bookingDrafts.push(draft);
    draftsByBooking.set(draft.booking_id, bookingDrafts);
  }

  return (
    <main className="email-drafts-page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">E-Mail-Entwürfe</h1>
          <p className="mt-1 text-sm text-muted">
            Entwürfe sind nach Band und Venue gruppiert. Eingehende Antworten
            werden erst nach der späteren Mailkonto-Anbindung sichtbar.
          </p>
        </div>
        {selectedBookingId && (
          <Link className="text-sm text-accent underline" href="/email-drafts">
            Alle Entwürfe anzeigen
          </Link>
        )}
      </div>

      {selectedBookingId && (
        <p className="mt-4 border border-subtle surface-panel p-3 text-sm">
          Angezeigt wird {bookingLabels.get(selectedBookingId)}. Die KI-Maske
          kann unabhängig davon neue Bookings für ausgewählte Venues anlegen.
        </p>
      )}

      <GenerateEmailDraftBatchForm bands={bands} venues={venues} />
      <ManualEmailDraftForm bands={bands} venues={venues} />
      <p className="mt-6 text-sm text-muted">
        {visibleDrafts.length}{" "}
        {visibleDrafts.length === 1 ? "Entwurf" : "Entwürfe"}
      </p>

      <div className="mt-3 grid gap-3">
        {[...draftsByBooking].map(([bookingId, bookingDrafts]) => (
          <div className="email-thread-row" key={bookingId}>
            <details
              className="email-thread"
              open={selectedBookingId === bookingId}
            >
              <summary>
                {bookingLabels.get(bookingId)} · {bookingDrafts.length}{" "}
                {bookingDrafts.length === 1 ? "Entwurf" : "Entwürfe"}
              </summary>
              <div className="email-thread-content">
                <Link
                  className="text-xs text-accent underline"
                  href={`/bookings#booking-${bookingId}`}
                >
                  Zugehöriges Booking öffnen
                </Link>
                {bookingDrafts.map((draft) => (
                  <section className="email-draft-entry" key={draft.id}>
                    <Link
                      id={`draft-${draft.id}`}
                      className="email-draft-card"
                      href={
                        selectedBookingId
                          ? `/email-drafts?booking_id=${selectedBookingId}&review=${draft.id}`
                          : `/email-drafts?review=${draft.id}`
                      }
                    >
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                        <strong>
                          Entwurf Nr. {draftNumbers.get(draft.id)}
                        </strong>
                        <span className="text-muted">
                          {draft.status === "approved"
                            ? "Freigegeben"
                            : draft.status === "sent"
                              ? "Gesendet"
                              : "Entwurf"}
                        </span>
                      </div>
                      <strong className="email-draft-card-subject">
                        {draft.subject || "Ohne Betreff"}
                      </strong>
                      <span className="email-draft-card-recipient">
                        {draft.recipient_email}
                      </span>
                      <span className="email-draft-card-action">
                        Öffnen und prüfen →
                      </span>
                    </Link>
                    <form action={deleteEmailDraft} className="mt-2">
                      <input type="hidden" name="id" value={draft.id} />
                      <button
                        type="submit"
                        className="danger-button compact-delete-button"
                      >
                        Direkt löschen
                      </button>
                    </form>
                  </section>
                ))}
              </div>
            </details>
            <div className="email-thread-summary-actions">
              <form action={deleteBookingDrafts}>
                <input type="hidden" name="booking_id" value={bookingId} />
                <button
                  type="submit"
                  className="email-thread-delete-button"
                  aria-label="Alle Entwürfe dieses Clubs löschen"
                  title="Alle Entwürfe dieses Clubs löschen"
                >
                  ×
                </button>
              </form>
              {bookingDrafts.some((draft) => draft.status === "sent") && (
                <span
                  className="email-thread-sent-indicator"
                  title="Mindestens ein Entwurf wurde versendet"
                  aria-label="Mindestens ein Entwurf wurde versendet"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m3 11 18-8-8 18-2-8-8-2Z" />
                    <path d="m11 13 5-5" />
                  </svg>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <DraftReviewDialog
        drafts={visibleDrafts}
        initialDraftId={
          visibleDrafts.some((draft) => draft.id === reviewDraftId)
            ? reviewDraftId
            : null
        }
      />
    </main>
  );
}
