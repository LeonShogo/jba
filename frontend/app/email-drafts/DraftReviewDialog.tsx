"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteEmailDraft,
  regenerateEmailDraft,
  sendEmailDraft,
  updateEmailDraft,
} from "../actions";

type ReviewDraft = {
  id: number;
  booking_id: number;
  tour_period: string | null;
  recipient_email: string;
  subject: string;
  body: string;
  status: "draft" | "approved" | "sent";
};

function inferTourPeriod(draft: ReviewDraft | undefined): string {
  if (!draft) return "";
  if (draft.tour_period?.trim()) return draft.tour_period;

  const source = `${draft.subject}\n${draft.body}`;
  const seasonalPeriod = source.match(/\b(?:Frühling|Sommer|Herbst|Winter)\s+\d{4}\b/i);
  if (seasonalPeriod) return seasonalPeriod[0];

  const datePeriod = source.match(/\b\d{1,2}\.\s*[-–]\s*\d{1,2}\.\s*[A-Za-zÄÖÜäöü]+\s+\d{4}\b/);
  return datePeriod?.[0] ?? "";
}

export function DraftReviewDialog({
  drafts: initialDrafts,
  initialDraftId,
}: {
  drafts: ReviewDraft[];
  initialDraftId: number | null;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastInitialDraftId = useRef(initialDraftId);
  const foundInitialIndex = initialDrafts.findIndex((draft) => draft.id === initialDraftId);
  const initialIndex = foundInitialIndex >= 0 ? foundInitialIndex : 0;
  const initialDraft = initialDrafts[initialIndex];
  const [drafts, setDrafts] = useState(initialDrafts);
  const [index, setIndex] = useState(initialIndex);
  const [recipientEmail, setRecipientEmail] = useState(initialDraft?.recipient_email ?? "");
  const [subject, setSubject] = useState(initialDraft?.subject ?? "");
  const [body, setBody] = useState(initialDraft?.body ?? "");
  const [regenerationOpen, setRegenerationOpen] = useState(false);
  const [regenerationPeriod, setRegenerationPeriod] = useState(inferTourPeriod(initialDraft));
  const [regenerationNotes, setRegenerationNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const currentDraft = drafts[index];

  useEffect(() => {
    const routeChanged = lastInitialDraftId.current !== initialDraftId;
    const initialDraftMissing = initialDraftId !== null && !drafts.some((draft) => draft.id === initialDraftId);
    if (!routeChanged && !initialDraftMissing) return;

    lastInitialDraftId.current = initialDraftId;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setDrafts(initialDrafts);
      if (initialDraftId === null) {
        dialogRef.current?.close();
        return;
      }

      const nextIndex = initialDrafts.findIndex((draft) => draft.id === initialDraftId);
      if (nextIndex < 0) return;
      const nextDraft = initialDrafts[nextIndex];
      setIndex(nextIndex);
      setRecipientEmail(nextDraft.recipient_email);
      setSubject(nextDraft.subject);
      setBody(nextDraft.body);
      setRegenerationPeriod(inferTourPeriod(nextDraft));
      setRegenerationOpen(false);
      setError(null);
    });
    return () => {
      cancelled = true;
    };
  }, [drafts, initialDraftId, initialDrafts]);

  useEffect(() => {
    if (initialDraftId !== null && currentDraft && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, [currentDraft, initialDraftId]);

  function selectDraft(nextDraft: ReviewDraft, nextIndex: number) {
    setIndex(nextIndex);
    setRecipientEmail(nextDraft.recipient_email);
    setSubject(nextDraft.subject);
    setBody(nextDraft.body);
    setRegenerationPeriod(inferTourPeriod(nextDraft));
    setRegenerationOpen(false);
    setError(null);
  }

  function addRegenerationInstruction(instruction: string) {
    setRegenerationNotes((current) =>
      current.trim() ? `${current.trim()} ${instruction}.` : `${instruction}.`,
    );
  }

  function toggleRegeneration() {
    if (!regenerationOpen) {
      setRegenerationPeriod(inferTourPeriod(currentDraft));
    }
    setRegenerationOpen((current) => !current);
  }

  useEffect(() => {
    function handleArrowNavigation(event: KeyboardEvent) {
      const target = event.target;
      if (
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight"
      ) return;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable) ||
        isPending
      ) return;
      const nextIndex = event.key === "ArrowLeft" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= drafts.length) return;
      event.preventDefault();
      selectDraft(drafts[nextIndex], nextIndex);
    }

    window.addEventListener("keydown", handleArrowNavigation);
    return () => window.removeEventListener("keydown", handleArrowNavigation);
  }, [drafts, index, isPending]);

  function closeDialog() {
    dialogRef.current?.close();
    router.push("/email-drafts");
  }

  function saveDraft(status: "draft" | "approved") {
    if (!currentDraft) return;
    const formData = new FormData();
    formData.set("id", String(currentDraft.id));
    formData.set("recipient_email", recipientEmail);
    formData.set("subject", subject);
    formData.set("body", body);
    formData.set("status", status);
    setError(null);
    startTransition(() => {
      void updateEmailDraft(formData)
        .then(() => {
          setDrafts((current) =>
            current.map((draft) =>
              draft.id === currentDraft.id
                ? { ...draft, recipient_email: recipientEmail, subject, body, status }
                : draft,
            ),
          );
          router.refresh();
          if (status === "approved") closeDialog();
        })
        .catch(() => setError("Der Entwurf konnte nicht gespeichert werden."));
    });
  }

  function sendCurrentDraft() {
    if (!currentDraft || currentDraft.status === "sent") return;

    const updateData = new FormData();
    updateData.set("id", String(currentDraft.id));
    updateData.set("recipient_email", recipientEmail);
    updateData.set("subject", subject);
    updateData.set("body", body);
    updateData.set("status", "approved");

    const sendData = new FormData();
    sendData.set("id", String(currentDraft.id));
    setError(null);
    startTransition(() => {
      void updateEmailDraft(updateData)
        .then(() => sendEmailDraft(sendData))
        .then(() => {
          setDrafts((current) =>
            current.map((draft) =>
              draft.id === currentDraft.id ? { ...draft, status: "sent" } : draft,
            ),
          );
          router.refresh();
          closeDialog();
        })
        .catch(() => setError("Die E-Mail konnte nicht versendet werden."));
    });
  }

  function removeDraft() {
    if (!currentDraft) return;
    const formData = new FormData();
    formData.set("id", String(currentDraft.id));
    setError(null);
    startTransition(() => {
      void deleteEmailDraft(formData)
        .then(() => {
          const remaining = drafts.filter((draft) => draft.id !== currentDraft.id);
          setDrafts(remaining);
          if (remaining.length === 0) {
            closeDialog();
            return;
          }
          const nextIndex = Math.min(index, remaining.length - 1);
          selectDraft(remaining[nextIndex], nextIndex);
          router.refresh();
        })
        .catch(() => setError("Der Entwurf konnte nicht gelöscht werden."));
    });
  }

  function regenerateDraft() {
    if (!currentDraft || !regenerationPeriod.trim()) {
      setError("Bitte einen Tourzeitraum für die neue Generierung angeben.");
      return;
    }
    const formData = new FormData();
    formData.set("booking_id", String(currentDraft.booking_id));
    formData.set("tour_period", regenerationPeriod);
    formData.set("notes", regenerationNotes);
    formData.append("style_attributes", "professional");
    formData.set("length", "medium");
    setError(null);
    setIsRegenerating(true);
    startTransition(() => {
      void regenerateEmailDraft(formData).then((result) => {
        if (result.error || !result.draft) {
          setIsRegenerating(false);
          setError(result.error ?? "Der Entwurf konnte nicht neu erstellt werden.");
          return;
        }
        const regeneratedDraft = result.draft;
        const nextDrafts = [...drafts, regeneratedDraft];
        setDrafts(nextDrafts);
        selectDraft(regeneratedDraft, nextDrafts.length - 1);
        setRegenerationOpen(false);
        setRegenerationNotes("");
        setIsRegenerating(false);
        router.refresh();
      }).catch(() => {
        setIsRegenerating(false);
        setError("Der Entwurf konnte nicht neu erstellt werden.");
      });
    });
  }

  if (initialDraftId === null || !currentDraft) return null;

  return (
    <dialog
      className="email-review-dialog"
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeDialog();
        }
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted">
            Entwurf {index + 1} von {drafts.length}
          </p>
          <h2 className="text-xl font-semibold">E-Mail prüfen</h2>
        </div>
        <button type="button" onClick={closeDialog} aria-label="Dialog schließen">×</button>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Empfänger
          <input value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Betreff
          <input value={subject} onChange={(event) => setSubject(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Nachricht
          <textarea rows={12} value={body} onChange={(event) => setBody(event.target.value)} />
        </label>
      </div>

      {regenerationOpen && (
        <div className="email-review-regeneration mt-4 grid gap-2">
          <strong className="text-sm">Neue Generierung</strong>
          <input
            placeholder="Tourzeitraum, zum Beispiel Mai bis Juni 2027"
            value={regenerationPeriod}
            onChange={(event) => setRegenerationPeriod(event.target.value)}
          />
          <div className="email-review-quick-actions" aria-label="Schnelle Anweisungen">
            {["länger", "kürzer", "direkter", "persönlicher", "wärmer", "formeller", "konkreter", "weniger werblich"].map((instruction) => (
              <button
                type="button"
                key={instruction}
                onClick={() => addRegenerationInstruction(`Bitte die Mail ${instruction} formulieren`)}
              >
                {instruction}
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            placeholder="Was soll diesmal anders sein?"
            value={regenerationNotes}
            onChange={(event) => setRegenerationNotes(event.target.value)}
          />
          <button type="button" className="primary-button w-fit" onClick={regenerateDraft} disabled={isPending}>
            {isRegenerating ? "KI generiert neuen Entwurf …" : "Neu generieren"}
          </button>
        </div>
      )}

      {isRegenerating && (
        <p className="mt-3 text-sm" role="status">
          KI generiert neuen Entwurf …
        </p>
      )}

      {error && <p className="mt-3" role="alert">{error}</p>}

      <div className="email-review-actions mt-5">
        <div className="email-review-navigation">
          <button type="button" onClick={() => selectDraft(drafts[index - 1], index - 1)} disabled={index === 0 || isPending}>Zurück</button>
          <button type="button" onClick={() => selectDraft(drafts[index + 1], index + 1)} disabled={index === drafts.length - 1 || isPending}>Weiter</button>
        </div>
        <div className="email-review-action-buttons">
          <button type="button" onClick={removeDraft} className="danger-button" disabled={isPending}>Löschen</button>
          <button type="button" onClick={toggleRegeneration} disabled={isPending}>Neu generieren</button>
          <button type="button" onClick={closeDialog} disabled={isPending}>Behalten</button>
          <button type="button" onClick={() => saveDraft("draft")} disabled={isPending}>Bearbeitung speichern</button>
          <button type="button" className="primary-button" onClick={() => saveDraft("approved")} disabled={isPending}>
            Für später freigeben
          </button>
          <button
            type="button"
            className="send-button"
            onClick={sendCurrentDraft}
            disabled={isPending || currentDraft.status === "sent"}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m3 11 18-8-8 18-2-8-8-2Z" />
              <path d="m11 13 5-5" />
            </svg>
            {currentDraft.status === "sent" ? "Bereits gesendet" : "Jetzt senden"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
