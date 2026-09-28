"use server";

import { revalidatePath } from "next/cache";

export async function createVenue(formData: FormData) {
  const name = formData.get("name");
  const city = formData.get("city");
  const state = formData.get("state");
  const country = formData.get("country");
  const venueType = formData.get("venue_type");
  const email = formData.get("email");
  const contactPerson = formData.get("contact_person");
  const website = formData.get("website");
  const phone = formData.get("phone");

  if (
    typeof name !== "string" ||
    typeof city !== "string" ||
    typeof state !== "string" ||
    typeof country !== "string" ||
    typeof venueType !== "string" ||
    typeof email !== "string" ||
    typeof contactPerson !== "string" ||
    typeof website !== "string" ||
    typeof phone !== "string"
  ) {
    throw new Error("Name, Stadt und Typ müssen Strings sein.");
  }

  const response = await fetch(`${process.env.API_URL}/venues`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      city,
      state: state || null,
      country: country || null,
      venue_type: venueType,
      email: email || null,
      contact_person: contactPerson || null,
      website: website || null,
      phone: phone || null,
    }),
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
  const state = formData.get("state");
  const country = formData.get("country");
  const venueType = formData.get("venue_type");
  const email = formData.get("email");
  const contactPerson = formData.get("contact_person");
  const website = formData.get("website");
  const phone = formData.get("phone");

  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof city !== "string" ||
    typeof state !== "string" ||
    typeof country !== "string" ||
    typeof venueType !== "string" ||
    typeof email !== "string" ||
    typeof contactPerson !== "string" ||
    typeof website !== "string" ||
    typeof phone !== "string"
  ) {
    throw new Error("Ungültige Eingabedaten.");
  }

  const response = await fetch(`${process.env.API_URL}/venues/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      city,
      state: state || null,
      country: country || null,
      venue_type: venueType,
      email: email || null,
      contact_person: contactPerson || null,
      website: website || null,
      phone: phone || null,
    }),
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
  const notes = formData.get("notes");

  if (bandId <= 0 || venueId <= 0 || typeof notes !== "string") {
    throw new Error("Band und Venue müssen ausgewählt werden.");
  }

  const response = await fetch(`${process.env.API_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      band_id: bandId,
      venue_id: venueId,
      notes: notes || null,
    }),
  });

  if (!response.ok) {
    throw new Error("Booking konnte nicht erstellt werden.");
  }

  revalidatePath("/bookings");
}

export async function updateBooking(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = formData.get("status");
  const notes = formData.get("notes");

  if (id <= 0 || typeof status !== "string" || typeof notes !== "string") {
    throw new Error("Ungültiger Booking-Status.");
  }

  const response = await fetch(`${process.env.API_URL}/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes: notes || null }),
  });

  if (!response.ok) {
    throw new Error("Booking-Status konnte nicht geändert werden.");
  }

  revalidatePath("/bookings");
}

export async function deleteBooking(formData: FormData) {
  const id = Number(formData.get("id"));
  if (id <= 0) {
    throw new Error("Ungültige Booking-ID.");
  }

  const response = await fetch(`${process.env.API_URL}/bookings/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Booking konnte nicht gelöscht werden.");
  }

  revalidatePath("/bookings");
}

export async function updateBand(formData: FormData) {
  const id = Number(formData.get("id"));
  const name = formData.get("name");

  if (id <= 0 || typeof name !== "string" || name.trim() === "") {
    throw new Error("Ungültige Banddaten.");
  }

  const response = await fetch(`${process.env.API_URL}/bands/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Band konnte nicht aktualisiert werden.");
  }

  revalidatePath("/bands");
}

export async function deleteBand(formData: FormData) {
  const id = Number(formData.get("id"));

  if (id <= 0) {
    throw new Error("Ungültige Band-ID.");
  }

  const response = await fetch(`${process.env.API_URL}/bands/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Band konnte nicht gelöscht werden.");
  }

  revalidatePath("/bands");
}

export async function createEmailDraft(formData: FormData) {
  const bookingId = Number(formData.get("booking_id"));
  const recipientEmail = formData.get("recipient_email");
  const subject = formData.get("subject");
  const body = formData.get("body");

  if (
    bookingId <= 0 ||
    typeof recipientEmail !== "string" ||
    typeof subject !== "string" ||
    typeof body !== "string" ||
    !recipientEmail.trim() ||
    !subject.trim() ||
    !body.trim()
  ) {
    throw new Error("Alle Entwurfsfelder müssen ausgefüllt sein.");
  }

  const response = await fetch(`${process.env.API_URL}/email-drafts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      booking_id: bookingId,
      recipient_email: recipientEmail,
      subject,
      body,
    }),
  });

  if (!response.ok) {
    throw new Error("E-Mail-Entwurf konnte nicht erstellt werden.");
  }

  revalidatePath("/email-drafts");
}

export async function updateEmailDraft(formData: FormData) {
  const id = Number(formData.get("id"));
  const recipientEmail = formData.get("recipient_email");
  const subject = formData.get("subject");
  const body = formData.get("body");
  const status = formData.get("status");

  if (
    id <= 0 ||
    typeof recipientEmail !== "string" ||
    typeof subject !== "string" ||
    typeof body !== "string" ||
    (status !== "draft" && status !== "approved") ||
    !recipientEmail.trim() ||
    !subject.trim() ||
    !body.trim()
  ) {
    throw new Error("Ungültige Entwurfsdaten.");
  }

  const response = await fetch(`${process.env.API_URL}/email-drafts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient_email: recipientEmail,
      subject,
      body,
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("E-Mail-Entwurf konnte nicht aktualisiert werden.");
  }

  revalidatePath("/email-drafts");
}
