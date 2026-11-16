"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createManualEmailDraftWithResult,
  regenerateEmailDraft,
  sendEmailDraft,
  updateEmailDraft,
} from "../actions";

type ReplyDraft = {
  id: number;
  tour_period: string | null;
  recipient_email: string;
  subject: string;
  body: string;
  status: "draft" | "approved";
};

type EmailReplyPanelProps = {
  bookingId: number;
  bandId: number;
  venueId: number;
  recipientEmail: string;
  defaultTourPeriod: string;
  defaultSubject: string;
  drafts: ReplyDraft[];
};

export function EmailReplyPanel({
  bookingId,
  bandId,
  venueId,
  recipientEmail,
  defaultTourPeriod,
  defaultSubject,
  drafts,
}: EmailReplyPanelProps) {
  const router = useRouter();
  const [tourPeriod, setTourPeriod] = useState(defaultTourPeriod);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");
  const [notes, setNotes] = useState("");
  const [length, setLength] = useState("medium");
  const [activeDraftId, setActiveDraftId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function loadDraft(draftId: string) {
    if (!draftId) {
      setActiveDraftId(null);
      setTourPeriod(defaultTourPeriod);
      setSubject(defaultSubject);
      setBody("");
      return;
    }
    const draft = drafts.find((item) => String(item.id) === draftId);
    if (!draft) return;
    setActiveDraftId(draft.id);
    setTourPeriod(draft.tour_period ?? defaultTourPeriod);
    setSubject(draft.subject);
    setBody(draft.body);
  }

  function formData(status: "draft" | "approved") {
    const data = new FormData();
    data.set("tour_period", tourPeriod);
    data.set("recipient_email", recipientEmail);
    data.set("subject", subject);
    data.set("body", body);
    data.set("status", status);
    return data;
  }

  function saveOrSend(send: boolean) {
    if (!tourPeriod.trim() || !subject.trim() || !body.trim()) {
      setError("Tourzeitraum, Betreff und Nachricht müssen ausgefüllt sein.");
      return;
    }
    setError(null);
    startTransition(() => {
      const save = activeDraftId
        ? updateExistingDraft(send)
        : createNewDraft(send);
      void save
        .then(async (draftId) => {
          if (!draftId) return;
          if (send) {
            const sendData = new FormData();
            sendData.set("id", String(draftId));
            await sendEmailDraft(sendData);
          }
          router.refresh();
          if (send) router.push(`/emails/${draftId}`);
        })
        .catch(() =>
          setError(
            send
              ? "Die E-Mail konnte nicht versendet werden."
              : "Der Entwurf konnte nicht gespeichert werden.",
          ),
        );
    });
  }

  async function updateExistingDraft(send: boolean) {
    if (!activeDraftId) return null;
    const data = formData(send ? "approved" : "draft");
    data.set("id", String(activeDraftId));
    await updateEmailDraft(data);
    return activeDraftId;
  }

  async function createNewDraft(send: boolean) {
    const data = new FormData();
    data.set("band_id", String(bandId));
    data.set("venue_id", String(venueId));
    data.set("tour_period", tourPeriod);
    data.set("recipient_email", recipientEmail);
    data.set("subject", subject);
    data.set("body", body);
    const result = await createManualEmailDraftWithResult(data);
    const draftId = result?.id ?? null;
    if (draftId && send) {
      const updateData = formData("approved");
      updateData.set("id", String(draftId));
      await updateEmailDraft(updateData);
    }
    return draftId;
  }

  function generate() {
    if (!tourPeriod.trim()) {
      setError("Bitte einen Tourzeitraum angeben.");
      return;
    }
    const data = new FormData();
    data.set("booking_id", String(bookingId));
    data.set("tour_period", tourPeriod);
    data.set("notes", notes);
    data.append("style_attributes", "professional");
    data.set("length", length);
    setError(null);
    startTransition(() => {
      void regenerateEmailDraft(data).then((result) => {
        if (result.error || !result.draft) {
          setError(result.error ?? "Der Entwurf konnte nicht erstellt werden.");
          return;
        }
        setActiveDraftId(result.draft.id);
        setTourPeriod(result.draft.tour_period ?? tourPeriod);
        setSubject(result.draft.subject);
        setBody(result.draft.body);
      });
    });
  }

  return (
    <details className="email-reply-form" open>
      <summary>Auf diese Unterhaltung antworten</summary>
      <p className="text-muted mt-2">
        Bestehenden Entwurf laden, manuell schreiben oder einen KI-Entwurf erzeugen.
      </p>
      {drafts.length > 0 && (
        <label>
          Vorhandenen Entwurf laden
          <select defaultValue="" onChange={(event) => loadDraft(event.target.value)}>
            <option value="">Neue Antwort</option>
            {drafts.map((draft) => (
              <option key={draft.id} value={draft.id}>
                {draft.subject} ({draft.status === "approved" ? "freigegeben" : "Entwurf"})
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="email-reply-grid">
        <label>
          Tourzeitraum
          <input value={tourPeriod} onChange={(event) => setTourPeriod(event.target.value)} />
        </label>
        <label>
          Betreff
          <input value={subject} onChange={(event) => setSubject(event.target.value)} />
        </label>
      </div>
      <label>
        Nachricht
        <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={10} />
      </label>
      <div className="email-reply-ai">
        <label>
          KI-Hinweise
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Zum Beispiel kurz und persönlich formulieren"
          />
        </label>
        <label>
          Länge
          <select value={length} onChange={(event) => setLength(event.target.value)}>
            <option value="short">Kurz</option>
            <option value="medium">Mittel</option>
            <option value="long">Lang</option>
          </select>
        </label>
        <button type="button" className="secondary-button" disabled={isPending} onClick={generate}>
          {isPending ? "KI erstellt Entwurf …" : "KI-Entwurf erzeugen"}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="email-reply-actions">
        <button type="button" className="secondary-button" disabled={isPending} onClick={() => saveOrSend(false)}>
          Als Entwurf speichern
        </button>
        <button type="button" className="send-button" disabled={isPending} onClick={() => saveOrSend(true)}>
          Senden
        </button>
      </div>
    </details>
  );
}
