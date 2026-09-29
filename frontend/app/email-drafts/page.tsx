import Link from "next/link";
import { createEmailDraft, updateEmailDraft } from "../actions";

type EmailDraft = {
  id: number;
  booking_id: number;
  recipient_email: string;
  subject: string;
  body: string;
  status: "draft" | "approved";
};

type Booking = {
  id: number;
  band_id: number;
  venue_id: number;
};

type NamedRecord = {
  id: number;
  name: string;
};

type EmailDraftsPageProps = {
  searchParams: Promise<{ booking_id?: string }>;
};

export default async function EmailDraftsPage({
  searchParams,
}: EmailDraftsPageProps) {
  const { booking_id: bookingIdParameter } = await searchParams;
  const requestedBookingId = Number(bookingIdParameter);

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
    <main>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">E-Mail-Entwürfe</h1>
          <p className="mt-1 text-sm text-[#b9aa9a]">
            Entwürfe sind nach Band und Venue gruppiert. Eingehende Antworten
            werden erst nach der späteren Mailkonto-Anbindung sichtbar.
          </p>
        </div>
        {selectedBookingId && (
          <Link className="text-sm text-[#ddb07f] underline" href="/email-drafts">
            Alle Entwürfe anzeigen
          </Link>
        )}
      </div>

      {selectedBookingId && (
        <p className="mt-4 rounded border border-[#4a3c32] bg-[#211c18] p-3 text-sm">
          Angezeigt wird {bookingLabels.get(selectedBookingId)}. Der neue
          Entwurf wird diesem Booking zugeordnet.
        </p>
      )}

      <form
        action={createEmailDraft}
        className="compact-email-form mt-4 grid max-w-3xl gap-2 md:grid-cols-2"
      >
        <select
          name="booking_id"
          defaultValue={selectedBookingId?.toString() ?? ""}
          required
        >
          <option value="" disabled>
            Booking wählen
          </option>
          {bookings.map((booking) => (
            <option key={booking.id} value={booking.id}>
              {bookingLabels.get(booking.id)}
            </option>
          ))}
        </select>
        <input
          type="email"
          name="recipient_email"
          placeholder="Empfängeradresse"
          required
        />
        <input
          className="md:col-span-2"
          name="subject"
          placeholder="Betreff"
          required
        />
        <textarea
          className="md:col-span-2"
          name="body"
          placeholder="E-Mail-Text"
          required
        />
        <button className="primary-button w-fit" type="submit">
          Entwurf speichern
        </button>
      </form>

      <p className="mt-6 text-sm text-[#b9aa9a]">
        {visibleDrafts.length}{" "}
        {visibleDrafts.length === 1 ? "Entwurf" : "Entwürfe"}
      </p>

      <div className="mt-3 grid gap-3">
        {[...draftsByBooking].map(([bookingId, bookingDrafts]) => (
          <details
            className="email-thread"
            key={bookingId}
            open={selectedBookingId === bookingId}
          >
            <summary>
              {bookingLabels.get(bookingId)} · {bookingDrafts.length}{" "}
              {bookingDrafts.length === 1 ? "Entwurf" : "Entwürfe"}
            </summary>
            <div className="email-thread-content">
              <Link
                className="text-xs text-[#ddb07f] underline"
                href={`/bookings#booking-${bookingId}`}
              >
                Zugehöriges Booking öffnen
              </Link>
              {bookingDrafts.map((draft) => (
                <section className="email-thread-message" key={draft.id}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                    <strong>Entwurf Nr. {draftNumbers.get(draft.id)}</strong>
                    <span className="text-[#b9aa9a]">
                      {draft.status === "approved"
                        ? "Freigegeben"
                        : "Entwurf"}
                    </span>
                  </div>
                  <form
                    action={updateEmailDraft}
                    className="compact-email-form grid gap-2 md:grid-cols-2"
                  >
                    <input type="hidden" name="id" value={draft.id} />
                    <input
                      type="email"
                      name="recipient_email"
                      defaultValue={draft.recipient_email}
                      required
                    />
                    <select name="status" defaultValue={draft.status}>
                      <option value="draft">Entwurf</option>
                      <option value="approved">Freigegeben</option>
                    </select>
                    <input
                      className="md:col-span-2"
                      name="subject"
                      defaultValue={draft.subject}
                      required
                    />
                    <textarea
                      className="md:col-span-2"
                      name="body"
                      defaultValue={draft.body}
                      required
                    />
                    <button className="primary-button w-fit" type="submit">
                      Änderungen speichern
                    </button>
                  </form>
                </section>
              ))}
            </div>
          </details>
        ))}
      </div>
    </main>
  );
}
