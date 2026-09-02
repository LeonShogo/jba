import {createClub, deleteClub, updateClub } from "./actions"


type Club = {
  id: number;
  name: string
  city: string;
};

export default async function Home() {

    const response = await fetch(`${process.env.API_URL}/clubs`, {
      cache: "no-store",
    });

        if (!response.ok) {
        throw new Error("Clubs konnten nicht geladen werden.");
      }

const clubs: Club[] = await response.json();

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
            {clubs.map((club) => (
              <li key={club.id} className="text-lg font-medium text-black dark:text-zinc-50">
                {club.name} - {club.city}
                <form action={updateClub}>
                  <input type="hidden" name="id" value={club.id} />
                  <input type="text" name="name" defaultValue={club.name} required />
                  <input type="text" name="city" defaultValue={club.city} required />
                  <button type="submit">Aktualisieren</button>
                </form>
                <form action={deleteClub}>
                  <input type="hidden" name="id" value={club.id} />
                  <button type="submit">Löschen</button>
                </form>
              </li>
            ))}
          </ul>
          <form action={createClub}>
            <input type="text" name="name" placeholder="Club Name" required />
            <input type="text" name="city" placeholder="City" required />
            <button type="submit">Create Club</button>
          </form>
        </div>

      </main>
    </div>
  );
}
