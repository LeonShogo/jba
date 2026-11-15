import Link from "next/link";
import { notFound } from "next/navigation";
import { createManualEmailDraft } from "../../actions";

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

      <section className="email-reply-form">
        <h2 className="text-lg font-semibold">Auf diese Unterhaltung antworten</h2>
        <p className="text-muted mt-1">
          Die Antwort wird als neuer Entwurf gespeichert und erscheint weiterhin unter E-Mail-Entwürfe.
        </p>
        <form action={createManualEmailDraft}>
          <input type="hidden" name="band_id" value={booking.band_id} />
          <input type="hidden" name="venue_id" value={booking.venue_id} />
          <input
            type="hidden"
            name="recipient_email"
            value={selected.recipient_email}
          />
          <label>
            Tourzeitraum
            <input
              name="tour_period"
              required
              defaultValue={selected.tour_period ?? ""}
              placeholder="Zum Beispiel Juni bis August 2027"
            />
          </label>
          <label>
            Betreff
            <input name="subject" required defaultValue={`Re: ${selected.subject}`} />
          </label>
          <label>
            Nachricht
            <textarea name="body" required rows={10} placeholder="Deine Antwort ..." />
          </label>
          <button className="primary-button" type="submit">
            Antwort als Entwurf speichern
          </button>
        </form>
      </section>
    </main>
  );
}
