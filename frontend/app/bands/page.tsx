import { createBand } from "../actions";
import { BandTable, type BandRow } from "./BandTable";

export default async function BandsPage() {
  const response = await fetch(`${process.env.API_URL}/bands`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Bands konnte nicht geladen werden.");
  }

  const bands: BandRow[] = await response.json();

  return (
    <>
      <h1 className="text-2xl font-semibold">Bands</h1>
      <form action={createBand} className="mt-4 flex items-center gap-2">
        <input className="w-72" name="name" placeholder="Bandname" required />
        <button className="primary-button" type="submit">
          Band erstellen
        </button>
      </form>

      <BandTable bands={bands} apiUrl={process.env.API_URL ?? ""} />
    </>
  );
}
