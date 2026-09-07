
import { createClub, deleteClub, updateClub } from "../actions"

type Club = {
  id: number;
  name: string;
  city: string;
};

export default async function ClubsPage() {

    const response = await fetch(`${process.env.API_URL}/clubs`, {
      cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Clubs konnten nicht geladen werden.");
    }

    const clubs: Club[] = await response.json();

    return (
        <>
        <h1>Clubs</h1>
        <form action={createClub}>
            <input type="text" name="name" placeholder="Clubname" required />
            <input type="text" name="city" placeholder="Stadt" required />
            <button type="submit">Club erstellen</button>
        </form>
        <ul>
            {clubs.map((club) => (
                <li key={club.id}>
                    {club.name} - {club.city}
                    <form action={updateClub}>
                    <input type="hidden" name="id" value={club.id} />
                    <input name="name" defaultValue={club.name} required />
                    <input name="city" defaultValue={club.city} required />
                    <button type="submit">Speichern</button>
                    </form>
                    <form action={deleteClub}>
                        <input type="hidden" name="id" value={club.id} />
                        <button type="submit">Löschen</button>
                    </form>
                </li>
            ))}
        </ul>
        </>
    );
}


