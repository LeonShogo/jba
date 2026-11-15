import { EmailTable, type EmailRow } from "./EmailTable";

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
  status: string;
  first_sent_at: string | null;
};

type Band = { id: number; name: string };
type Venue = { id: number; name: string; country: string | null };

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${process.env.API_URL}${path}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("E-Mail-Daten konnten nicht geladen werden.");
  }
  return response.json() as Promise<T>;
}

export default async function EmailsPage() {
  const [drafts, bookings, bands, venues] = await Promise.all([
    getJson<EmailDraft[]>("/email-drafts"),
    getJson<Booking[]>("/bookings"),
    getJson<Band[]>("/bands"),
    getJson<Venue[]>("/venues"),
  ]);

  const bookingById = new Map(bookings.map((booking) => [booking.id, booking]));
  const bandById = new Map(bands.map((band) => [band.id, band]));
  const venueById = new Map(venues.map((venue) => [venue.id, venue]));

  const emails: EmailRow[] = drafts
    .filter((draft) => draft.status === "sent")
    .map((draft) => {
      const booking = bookingById.get(draft.booking_id);
      const venue = booking ? venueById.get(booking.venue_id) : undefined;
      const band = booking ? bandById.get(booking.band_id) : undefined;
      return {
        id: draft.id,
        bookingId: draft.booking_id,
        subject: draft.subject,
        recipientEmail: draft.recipient_email,
        body: draft.body,
        tourPeriod: draft.tour_period,
        bandName: band?.name ?? "Unbekannte Band",
        venueName: venue?.name ?? "Unbekanntes Venue",
        country: venue?.country ?? "Unbekanntes Land",
        bookingStatus: booking?.status ?? "sent",
        firstSentAt: booking?.first_sent_at ?? null,
      };
    });

  return (
    <main className="emails-page">
      <p className="section-kicker">Postfach</p>
      <h1 className="text-2xl font-semibold">E-Mails</h1>
      <p className="text-muted mt-2">
        Gesendete Booking-Mails, sortiert nach Venue, Land, Datum oder Zusage.
      </p>
      {emails.length > 0 ? (
        <EmailTable emails={emails} />
      ) : (
        <p className="empty-state mt-6">
          Noch keine gesendeten E-Mails. Entwürfe bleiben unter E-Mail-Entwürfe.
        </p>
      )}
    </main>
  );
}
