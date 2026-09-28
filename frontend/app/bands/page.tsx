import { createBand, deleteBand, updateBand } from "../actions";

type Band = {
  id: number;
  name: string;
};

export default async function BandsPage() {
  const response = await fetch(`${process.env.API_URL}/bands`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Bands konnte nicht geladen werden.");
  }

  const bands: Band[] = await response.json();

  return (
    <>
      <h1>Bands</h1>
      <form action={createBand}>
        <input name="name" placeholder="Bandname" required />
        <button type="submit">Band erstellen</button>
      </form>
      <table>
  <thead>
    <tr>
      <th>Band bearbeiten</th>
      <th>Aktion</th>
    </tr>
  </thead>
  <tbody>
    {bands.map((band) => (
      <tr key={band.id}>
        <td>
          <form action={updateBand} className="flex items-center gap-2">
            <input type="hidden" name="id" value={band.id} />
            <input name="name" defaultValue={band.name} required />
            <button type="submit">Speichern</button>
          </form>
        </td>
        <td>
          <form action={deleteBand}>
            <input type="hidden" name="id" value={band.id} />
            <button type="submit">Löschen</button>
          </form>
        </td>
      </tr>
    ))}
  </tbody>
</table>
    </>
  );
}
