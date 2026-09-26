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

export async function deleteVenue(formData: FormData) {
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

export async function updateVenue(formData: FormData) {
  const id = formData.get("id");
  const name = formData.get("name");
  const city = formData.get("city");
  const venueType = formData.get("venue_type");

  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof city !== "string" ||
    typeof venueType !== "string"
  ) {
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

export async function createBand(formData: FormData) {
  const name = formData.get("name");
  if (typeof name !== "string" || name.trim() === "") {
    throw new Error("Bandname fehlt.");
  }

  const response = await fetch(`${process.env.API_URL}/bands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Band konnte nicht erstellt werden.");
  }

  revalidatePath("/bands");
}

export async function createBooking(formData: FormData) {
  const bandId = Number(formData.get("band_id"));
  const venueId = Number(formData.get("venue_id"));

  if (bandId <= 0 || venueId <= 0) {
    throw new Error("Band und Venue müssen ausgewählt werden.");
  }

  const response = await fetch(`${process.env.API_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ band_id: bandId, venue_id: venueId }),
  });

  if (!response.ok) {
    throw new Error("Booking konnte nicht erstellt werden.");
  }

  revalidatePath("/bookings");
}

export async function updateBookingStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = formData.get("status");

  if (id <= 0 || typeof status !== "string") {
    throw new Error("Ungültiger Booking-Status.");
  }

  const response = await fetch(`${process.env.API_URL}/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Booking-Status konnte nicht geändert werden.");
  }

  revalidatePath("/bookings");
}
