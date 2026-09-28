import { createVenue } from "../actions";
import { VenueTable, type Venue } from "./VenueTable";

export default async function VenuesPage() {
  const response = await fetch(`${process.env.API_URL}/venues`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Venues konnten nicht geladen werden.");
  }

  const venues: Venue[] = await response.json();

  return (
    <>
      <h1 className="text-2xl font-semibold">Venues & Festivals</h1>
      <form
        action={createVenue}
        className="mt-4 flex flex-wrap items-center gap-2"
      >
        <input
          className="w-44"
          type="text"
          name="name"
          placeholder="Venue Name"
          required
        />
        <input
          className="w-28"
          type="text"
          name="city"
          placeholder="Stadt"
          required
        />
        <input className="w-36" name="state" placeholder="Bundesland" />
        <input className="w-28" name="country" placeholder="Land" />
        <input
          className="w-56"
          type="email"
          name="email"
          placeholder="E-Mail"
        />
        <input
          className="w-36"
          name="contact_person"
          placeholder="Ansprechperson"
        />
        <input
          className="w-56"
          type="url"
          name="website"
          placeholder="Website"
        />
        <input
          className="w-36"
          type="tel"
          name="phone"
          placeholder="Telefon"
        />
        <select className="w-28" name="venue_type" defaultValue="club">
          <option value="club">Club</option>
          <option value="festival">Festival</option>
        </select>
        <button className="primary-button" type="submit">
          Venue erstellen
        </button>
      </form>

      <VenueTable venues={venues} />
    </>
  );
}
