import { createBooking } from "../actions";
import { BookingTable, type BookingRow } from "./BookingTable";

type Booking = {
  id: number;
  band_id: number;
  venue_id: number;
  status: string;
  notes: string | null;
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
  const [bookingsResponse, bandsResponse, venuesResponse] = await Promise.all([
    fetch(`${process.env.API_URL}/bookings`, { cache: "no-store" }),
    fetch(`${process.env.API_URL}/bands`, { cache: "no-store" }),
    fetch(`${process.env.API_URL}/venues`, { cache: "no-store" }),
  ]);

  if (!bookingsResponse.ok || !bandsResponse.ok || !venuesResponse.ok) {
    throw new Error("Booking-Daten konnten nicht geladen werden.");
  }

  const bookings: Booking[] = await bookingsResponse.json();
  const bands: Band[] = await bandsResponse.json();
  const venues: Venue[] = await venuesResponse.json();

  const bandNames = new Map(bands.map((band) => [band.id, band.name]));
  const venueNames = new Map(venues.map((venue) => [venue.id, venue.name]));

  const bookingRows: BookingRow[] = bookings.map((booking) => ({
    id: booking.id,
    bandName: bandNames.get(booking.band_id) ?? "Unbekannte Band",
    venueName: venueNames.get(booking.venue_id) ?? "Unbekanntes Venue",
    status: booking.status,
    notes: booking.notes,
  }));

  return (
    <>
      <h1 className="text-2xl font-semibold">Bookings</h1>
      <form
        action={createBooking}
        className="mt-4 flex flex-wrap items-center gap-2"
      >
        <select className="w-48" name="band_id" defaultValue="" required>
          <option value="" disabled>
            Band wählen
          </option>
          {bands.map((band) => (
            <option key={band.id} value={band.id}>
              {band.name}
            </option>
          ))}
        </select>
        <select className="w-56" name="venue_id" defaultValue="" required>
          <option value="" disabled>
            Venue wählen
          </option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
        <textarea
          className="h-10 min-h-10 w-80"
          name="notes"
          placeholder="Notizen zum Booking"
        />
        <button className="primary-button" type="submit">
          Booking erstellen
        </button>
      </form>

      <BookingTable bookings={bookingRows} />
    </>
  );
}
