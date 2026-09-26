import { createBooking, updateBookingStatus } from "../actions";

type Booking = {
  id: number;
  band_id: number;
  venue_id: number;
  status: string;
};

type Band = {
  id: number;
  name: string;
};

type Venue = {
  id: number;
  name: string;
};

export default async function BookingPage() {
  const bookingsResponse = await fetch(`${process.env.API_URL}/bookings`, {
    cache: "no-store",
  });

  const bandsResponse = await fetch(`${process.env.API_URL}/bands`, {
    cache: "no-store",
  });

  const venuesResponse = await fetch(`${process.env.API_URL}/venues`, {
    cache: "no-store",
  });

  if (!bookingsResponse.ok || !bandsResponse.ok || !venuesResponse.ok) {
    throw new Error("Booking-Daten konnten nicht geladen werden.");
  }

  const bookings: Booking[] = await bookingsResponse.json();
  const bands: Band[] = await bandsResponse.json();
  const venues: Venue[] = await venuesResponse.json();

  const bandNames = new Map(bands.map((band) => [band.id, band.name]));

  const venueNames = new Map(venues.map((venue) => [venue.id, venue.name]));

  return (
    <>
      <h1>Bookings</h1>
      <form action={createBooking}>
        <select name="band_id" defaultValue="" required>
          <option value="" disabled>
            Band wählen
          </option>
          {bands.map((band) => (
            <option key={band.id} value={band.id}>
              {band.name}
            </option>
          ))}
        </select>
        <select name="venue_id" defaultValue="" required>
          <option value="" disabled>
            Venue wählen
          </option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
        <button type="submit">Booking erstellen</button>
      </form>
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id}>
            {bandNames.get(booking.band_id)} →{" "}
            {venueNames.get(booking.venue_id)}
            {" — "}
            {booking.status}
            <form action={updateBookingStatus}>
              <input type="hidden" name="id" value={booking.id} />
              <select name="status" defaultValue={booking.status}>
                <option value="draft">Entwurf</option>
                <option value="sent">Gesendet</option>
                <option value="replied">Antwort erhalten</option>
                <option value="follow_up">Nachfassen</option>
                <option value="accepted">Zugesagt</option>
                <option value="rejected">Abgelehnt</option>
              </select>
              <button type="submit">Status speichern</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
