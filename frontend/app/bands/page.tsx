import { createBand } from "../actions";

type Band = {
    id: number;
    name: string;
};



export default async function BandsPage() {

    const response = await fetch(`${process.env.API_URL}/bands`, {
          cache: "no-store",
});

    if (!response.ok) {
        throw new Error ("Bands konnte nicht geladen werden.")
    }

    const bands: Band[] = await response.json();

    return (
        <>
            <h1>Bands</h1>  
            <form action={createBand}>
            <input name="name" placeholder="Bandname" required />
            <button type="submit">Band erstellen</button>
            </form>
            <ul>
                {bands.map((band) => (
                <li key={band.id}>{band.name}</li>
                ))}
            </ul>
        </>
    );


}
