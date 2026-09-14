import {createVenue, deleteVenue, updateVenue } from "./actions"


type Venue = {
  id: number;
  name: string
  city: string;
};

export default async function Home() {

    const response = await fetch(`${process.env.API_URL}/venues`, {
      cache: "no-store",
    });

        if (!response.ok) {
        throw new Error("Venues konnten nicht geladen werden.");
      }

const venues: Venue[] = await response.json();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
         <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Jazz Booking App
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
           Verwalte Jazzclubs, Kontakte und Bookinanfragen.
          </p>
          <ul>
            {venues.map((venue) => (
              <li key={venue.id} className="text-lg font-medium text-black dark:text-zinc-50">
                {venue.name} - {venue.city}
                <form action={updateVenue}>
                  <input type="hidden" name="id" value={venue.id} />
                  <input type="text" name="name" defaultValue={venue.name} required />
                  <input type="text" name="city" defaultValue={venue.city} required />
                  <button type="submit">Aktualisieren</button>
                </form>
                <form action={deleteVenue}>
                  <input type="hidden" name="id" value={venue.id} />
                  <button type="submit">Löschen</button>
                </form>
              </li>
            ))}
          </ul>
          <form action={createVenue}>
            <input type="text" name="name" placeholder="Venue Name" required />
            <input type="text" name="city" placeholder="City" required />
            <button type="submit">Create Venue</button>
          </form>
        </div>

      </main>
    </div>
  );
}
