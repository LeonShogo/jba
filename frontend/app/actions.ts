"use server";

import { revalidatePath } from "next/cache";

export type GenerateEmailDraftState = {
  error: string | null;
  draftId?: number;
  bookingId?: number;
};

export async function generateEmailDraft(
  _previousState: GenerateEmailDraftState,
  formData: FormData,
): Promise<GenerateEmailDraftState> {
  const bookingId = Number(formData.get("booking_id"));
  const tourPeriod = formData.get("tour_period");
  const notes = formData.get("notes");
  const styleAttributes = formData.getAll("style_attributes");
  const length = formData.get("length");
  const allowedStyles = [
    "professional", "casual", "formal", "warm", "personal", "direct",
    "concise", "confident", "enthusiastic", "understated", "inviting",
    "respectful", "vivid", "grounded", "elegant", "curious",
  ];
  if (
    !Number.isInteger(bookingId) || bookingId <= 0 ||
    typeof tourPeriod !== "string" || !tourPeriod.trim() || tourPeriod.length > 200 ||
    typeof notes !== "string" || notes.length > 4000 ||
    styleAttributes.length > 7 ||
    styleAttributes.some((attribute) =>
      typeof attribute !== "string" || !allowedStyles.includes(attribute),
    )
    || !["short", "medium", "long"].includes(String(length))
  ) {
    return { error: "Bitte Booking, Tourzeitraum und Moodboard-Auswahl überprüfen." };
  }

  let result: { id: number };
  try {
    const response = await fetch(`${process.env.API_URL}/email-drafts/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking_id: bookingId,
        tour_period: tourPeriod.trim(),
        notes: notes.trim(),
        style_attributes: styleAttributes,
        length,
      }),
    });
    if (!response.ok) {
      const failure = await response.json().catch(() => null);
      return {
        error: response.status < 500 && typeof failure?.detail === "string"
          ? failure.detail
          : "Der Entwurf konnte nicht erstellt werden. Bitte versuche es erneut.",
      };
    }
    result = await response.json();
  } catch {
    return { error: "Die Verbindung zum Backend ist fehlgeschlagen. Prüfe vor einem erneuten Versuch die Entwurfsliste." };
  }
  revalidatePath("/email-drafts");
  revalidatePath("/bookings");
  revalidatePath("/");
  return { error: null, draftId: result.id, bookingId };
}

export type CreateVenueActionState = {
  error: string | null;
  success: boolean;
};

export type VenueResearchCandidate = {
  venue_type: "club" | "festival";
  name: string;
  city: string;
  state: string | null;
  country: string | null;
  website: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  source_url: string;
};

export type VenueResearchActionState = {
  candidates: VenueResearchCandidate[];
  error: string | null;
  savedCount?: number;
};

export async function researchVenues(
  _previousState: VenueResearchActionState,
  formData: FormData,
): Promise<VenueResearchActionState> {
  const country = formData.get("country");
  const region = formData.get("region");
  const venueType = formData.get("venue_type");
  const maxResults = Number(formData.get("max_results"));
  const mode = formData.get("mode");
  const referenceArtists = formData.get("reference_artists");

  if (
    typeof country !== "string" ||
    country.trim() === "" ||
    typeof region !== "string" ||
    typeof referenceArtists !== "string" ||
    (venueType !== "club" &&
      venueType !== "festival" &&
      venueType !== "both") ||
    (mode !== "review" && mode !== "automatic") ||
    !Number.isInteger(maxResults) ||
    maxResults < 1 ||
    maxResults > 20
  ) {
    return {
      candidates: [],
      error: "Bitte überprüfe die Recherche-Eingaben.",
    };
  }

  const artists = referenceArtists
    .split(",")
    .map((artist) => artist.trim())
    .filter(Boolean);

  try {
    const response = await fetch(`${process.env.API_URL}/venue-research`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        country: country.trim(),
        region: region.trim() || null,
        venue_type: venueType,
        max_results: maxResults,
        mode,
        reference_artists: artists,
      }),
    });

    if (!response.ok) {
      return {
        candidates: [],
        error: "Die Venue-Recherche ist fehlgeschlagen.",
      };
    }

    const result = (await response.json()) as {
      venue_candidates: VenueResearchCandidate[];
      saved_count: number;
    };

    if (result.saved_count > 0) {
      revalidatePath("/venues");
    }

    return {
      candidates: result.venue_candidates,
      error: null,
      savedCount: result.saved_count,
    };
  } catch {
    return {
      candidates: [],
      error: "Das Backend konnte nicht erreicht werden.",
    };
  }
}

export async function createVenue(
  _previousState: CreateVenueActionState,
  formData: FormData,
): Promise<CreateVenueActionState> {
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

  if (response.status === 409) {
    return {
      error: "Diese Venue ist bereits vorhanden.",
      success: false,
    };
  }

  if (!response.ok) {
    throw new Error("Club konnte nicht erstellt werden.");
  }
  revalidatePath("/venues");
  return { error: null, success: true };
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
  const epkContents = formData.getAll("epk_contents");
  const optionalFields = [
    "genre",
    "lineup",
    "website",
    "epk_url",
    "photo_url",
    "music_url",
    "equipment",
    "description",
    "band_text",
  ] as const;

  if (id <= 0 || typeof name !== "string" || name.trim() === "") {
    throw new Error("Ungültige Banddaten.");
  }

  const details = Object.fromEntries(
    optionalFields.map((field) => {
      const value = formData.get(field);
      return [
        field,
        typeof value === "string" && value.trim() ? value.trim() : null,
      ];
    }),
  );

  const response = await fetch(`${process.env.API_URL}/bands/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, ...details, epk_contents: epkContents }),
  });

  if (!response.ok) {
    throw new Error("Band konnte nicht aktualisiert werden.");
  }

  revalidatePath("/bands");
}

const bandDocumentTypes = [
  "equipment",
  "tech-rider",
  "stage-plan",
  "description",
  "band-text",
] as const;

export async function uploadBandDocument(formData: FormData) {
  const bandId = Number(formData.get("band_id"));
  const documentType = formData.get("document_type");
  const file = formData.get("file");

  if (
    bandId <= 0 ||
    typeof documentType !== "string" ||
    !bandDocumentTypes.includes(
      documentType as (typeof bandDocumentTypes)[number],
    ) ||
    !(file instanceof File) ||
    file.type !== "application/pdf" ||
    file.size === 0 ||
    file.size > 10 * 1024 * 1024
  ) {
    throw new Error("Bitte eine PDF-Datei mit höchstens 10 MB auswählen.");
  }

  const uploadData = new FormData();
  uploadData.set("file", file);
  const response = await fetch(
    `${process.env.API_URL}/bands/${bandId}/documents/${documentType}`,
    { method: "POST", body: uploadData },
  );

  if (!response.ok) {
    throw new Error("PDF konnte nicht hochgeladen werden.");
  }

  revalidatePath("/bands");
}

export async function deleteBandDocument(formData: FormData) {
  const bandId = Number(formData.get("band_id"));
  const documentType = formData.get("document_type");

  if (
    bandId <= 0 ||
    typeof documentType !== "string" ||
    !bandDocumentTypes.includes(
      documentType as (typeof bandDocumentTypes)[number],
    )
  ) {
    throw new Error("Ungültiges Banddokument.");
  }

  const response = await fetch(
    `${process.env.API_URL}/bands/${bandId}/documents/${documentType}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw new Error("PDF konnte nicht entfernt werden.");
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

export async function deleteEmailDraft(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Ungültige Entwurfs-ID.");
  }

  const response = await fetch(`${process.env.API_URL}/email-drafts/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("E-Mail-Entwurf konnte nicht gelöscht werden.");
  }
  revalidatePath("/email-drafts");
  revalidatePath("/");
}
