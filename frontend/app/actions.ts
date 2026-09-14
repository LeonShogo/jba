"use server";

import { revalidatePath } from "next/cache";

export async function createVenue(formData: FormData) {
    const name = formData.get("name");
    const city = formData.get("city");
    const venueType = formData.get("venue_type");

    if (
        typeof name !== "string" ||
        typeof city !== "string" ||
        typeof venueType !== "string"
            ) {
            throw new Error("Name, Stadt und Typ müssen Strings sein.");
        }

    const response = await fetch(`${process.env.API_URL}/venues`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, city, venue_type: venueType }),
    });

    if (!response.ok) {
        throw new Error("Club konnte nicht erstellt werden.");
    }
    revalidatePath("/venues");
    return response.json();
}


export async function deleteVenue(formData: FormData){
    const id = formData.get("id");

    if (typeof id !== "string") {
        throw new Error("Venue-ID fehlt.");
    }

    const response = await fetch(`${process.env.API_URL}/venues/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Venue konnte nicht gelöscht werden.");
    }
    revalidatePath("/venues");
}

export async function updateVenue(formData: FormData){

    const id = formData.get("id");
    const name = formData.get("name");
    const city = formData.get("city");
    const venueType = formData.get("venue_type");

    if (typeof id !== "string" || typeof name !== "string" || typeof city !== "string" || typeof venueType !== "string") {
        throw new Error("Ungültige Eingabedaten.");
    }

    const response = await fetch(`${process.env.API_URL}/venues/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, city, venue_type: venueType }),
    });

    if (!response.ok) {
        throw new Error("Venue konnte nicht aktualisiert werden.");
    }
    revalidatePath("/venues");
}