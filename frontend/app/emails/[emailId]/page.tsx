import Link from "next/link";
import { notFound } from "next/navigation";
import { EmailReplyPanel } from "../EmailReplyPanel";

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
  if (!response.ok) throw new Error("E-Mail-Daten konnten nicht geladen werden.");
  return response.json() as Promise<T>;
}

function formatDate(value: string | null) {
  if (!value) return "Kein Versanddatum";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default async function EmailDetailPage({
  params,
}: {
  params: Promise<{ emailId: string }>;
}) {
  const { emailId } = await params;
  const id = Number(emailId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [drafts, bookings, bands, venues] = await Promise.all([
    getJson<EmailDraft[]>("/email-drafts"),
    getJson<Booking[]>("/bookings"),
    getJson<Band[]>("/bands"),
    getJson<Venue[]>("/venues"),
  ]);
  const selected = drafts.find((draft) => draft.id === id);
  if (!selected) notFound();

  const booking = bookings.find((item) => item.id === selected.booking_id);
  if (!booking) notFound();
  const band = bands.find((item) => item.id === booking.band_id);
  const venue = venues.find((item) => item.id === booking.venue_id);
  const thread = drafts
    .filter(
      (draft) =>
        draft.booking_id === selected.booking_id && draft.status === "sent",
    )
    .sort((a, b) => a.id - b.id);

  return (
    <main className="emails-page email-detail-page">
      <Link className="text-accent underline" href="/emails">
        ← Zur E-Mail-Liste
      </Link>
      <p className="section-kicker mt-6">E-Mail-Verlauf</p>
      <h1 className="text-2xl font-semibold">{venue?.name ?? "Unbekanntes Venue"}</h1>
      <p className="text-muted mt-2">
        {band?.name ?? "Unbekannte Band"} · {selected.recipient_email}
        {venue?.country ? ` · ${venue.country}` : ""}
      </p>

      <section className="email-thread-view" aria-label="E-Mail-Verlauf">
        {thread.map((message) => (
          <article className="email-message-card" key={message.id}>
            <header>
              <strong>{message.subject}</strong>
              <span>{formatDate(booking.first_sent_at)}</span>
            </header>
            <p className="email-message-recipient">An: {message.recipient_email}</p>
            <div className="email-message-body">{message.body}</div>
          </article>
        ))}
      </section>

      <EmailReplyPanel
        bookingId={booking.id}
        bandId={booking.band_id}
        venueId={booking.venue_id}
        recipientEmail={selected.recipient_email}
        defaultTourPeriod={selected.tour_period ?? ""}
        defaultSubject={`Re: ${selected.subject}`}
        drafts={drafts
          .filter(
            (draft) =>
              draft.booking_id === booking.id && draft.status !== "sent",
          )
          .map(({ id, tour_period, recipient_email, subject, body, status }) => ({
            id,
            tour_period,
            recipient_email,
            subject,
            body,
            status: status as "draft" | "approved",
          }))}
      />
    </main>
  );
}
