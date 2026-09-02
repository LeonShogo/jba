"use server";

import { revalidatePath } from "next/cache";

export async function createClub(formData: FormData) {
    const name = formData.get("name");
    const city = formData.get("city");

    if (typeof name !== "string" || typeof city !== "string") {
        throw new Error("Name und Stadt müssen Strings sein.");
    }

    const response = await fetch(`${process.env.API_URL}/clubs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, city }),
    });

    if (!response.ok) {
        throw new Error("Club konnte nicht erstellt werden.");
    }
    revalidatePath("/");
    return response.json();
}