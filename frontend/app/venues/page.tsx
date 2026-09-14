
import { createVenue, deleteVenue, updateVenue} from "../actions"

type Venue = {
  venue_type: "club" | "festival";
  id: number;
  name: string;
  city: string;
};

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
        <h1>Venues & Festivals</h1>
        <form action={createVenue}>
            <input type="text" name="name" placeholder="Venue Name" required />
            <input type="text" name="city" placeholder="City" required />
            <select name="venue_type" defaultValue="club">
             <option value="club">Club</option>
             <option value="festival">Festival</option>
            </select>
            <button type="submit">Venue erstellen</button>
        </form>
        <ul>
            {venues.map((venue) => (
                <li key={venue.id}>
                    {venue.name} - {venue.city}
                    <form action={updateVenue}>
                    <input type="hidden" name="id" value={venue.id} />
                    <input name="name" defaultValue={venue.name} required />
                    <input name="city" defaultValue={venue.city} required />
                    ({venue.venue_type})
                    <select name="venue_type" defaultValue={venue.venue_type}>
                        <option value="club">Club</option>
                        <option value="festival">Festival</option>
                    </select>
                    <button type="submit">Speichern</button>
                    </form>
                    <form action={deleteVenue}>
                        <input type="hidden" name="id" value={venue.id} />
                        <button type="submit">Löschen</button>
                    </form>
                </li>
            ))}
        </ul>
        </>
    );
}


