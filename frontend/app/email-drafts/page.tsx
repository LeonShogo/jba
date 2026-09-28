import { createEmailDraft, updateEmailDraft } from "../actions";

type EmailDraft = {
  id: number;
  booking_id: number;
  recipient_email: string;
  subject: string;
  body: string;
  status: "draft" | "approved" ;
};

type Booking = {
  id: number;
};

export default async function EmailDraftsPage() {
  const draftsResponse = await fetch(`${process.env.API_URL}/email-drafts`, {
    cache: "no-store",
  });

  const bookingsResponse = await fetch(`${process.env.API_URL}/bookings`, {
    cache: "no-store",
  });

  if (!draftsResponse.ok || !bookingsResponse.ok) {
    throw new Error("E-Mail-Entwürfe konnten nicht geladen werden.");
  }

  const drafts: EmailDraft[] = await draftsResponse.json();
  const bookings: Booking[] = await bookingsResponse.json();

  return (
    <main>
      <h1>E-Mail-Entwürfe</h1>
      <form action={createEmailDraft}>
        <select name="booking_id" defaultValue="" required>
          <option value="" disabled>
            Booking wählen
          </option>
          {bookings.map((booking) => (
            <option key={booking.id} value={booking.id}>
              Booking {booking.id}
            </option>
          ))}
        </select>
        <input
          type="email"
          name="recipient_email"
          placeholder="Empfänger"
          required
        />
        <input name="subject" placeholder="Betreff" required />
        <textarea name="body" placeholder="E-Mail-Text" required />
        <button type="submit">Entwurf speichern</button>
      </form>
      <p>
        {drafts.length} Entwürfe für {bookings.length} Bookings
      </p>
      <ul>
        {drafts.map((draft) => (
         <li key={draft.id}>
  <form action={updateEmailDraft}>
    <input type="hidden" name="id" value={draft.id} />
    <input
      type="email"
      name="recipient_email"
      defaultValue={draft.recipient_email}
      required
    />
    <input name="subject" defaultValue={draft.subject} required />
    <textarea name="body" defaultValue={draft.body} required />
    <select name="status" defaultValue={draft.status}>
      <option value="draft">Entwurf</option>
      <option value="approved">Freigegeben</option>
    </select>
    <button type="submit">Änderungen speichern</button>
  </form>
</li>
        ))}
      </ul>
    </main>
  );
}
