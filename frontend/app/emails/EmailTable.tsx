"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type EmailRow = {
  id: number;
  bookingId: number;
  subject: string;
  recipientEmail: string;
  body: string;
  tourPeriod: string | null;
  bandName: string;
  venueName: string;
  country: string;
  bookingStatus: string;
  firstSentAt: string | null;
};

type SortKey = "club" | "country" | "date" | "status";

const statusLabels: Record<string, string> = {
  accepted: "Zusage",
  rejected: "Absage",
  replied: "Antwort erhalten",
  follow_up: "Nachfassen",
  sent: "Gesendet",
  draft: "Entwurf",
};

function statusLabel(status: string) {
  return statusLabels[status] ?? status;
}

function formatDate(value: string | null) {
  if (!value) return "Kein Datum";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function EmailTable({ emails }: { emails: EmailRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [descending, setDescending] = useState(true);

  const sortedEmails = useMemo(() => {
    return [...emails].sort((a, b) => {
      let result = 0;
      if (sortKey === "club") {
        result = a.venueName.localeCompare(b.venueName, "de");
      } else if (sortKey === "country") {
        result = a.country.localeCompare(b.country, "de");
      } else if (sortKey === "status") {
        result = statusLabel(a.bookingStatus).localeCompare(
          statusLabel(b.bookingStatus),
          "de",
        );
      } else {
        result =
          (Date.parse(a.firstSentAt ?? "") || 0) -
          (Date.parse(b.firstSentAt ?? "") || 0);
      }
      return descending ? -result : result;
    });
  }, [descending, emails, sortKey]);

  function changeSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setDescending((current) => !current);
    } else {
      setSortKey(nextKey);
      setDescending(nextKey === "date");
    }
  }

  return (
    <section aria-label="Gesendete E-Mails">
      <div className="email-list-toolbar">
        <label>
          Sortieren nach
          <select
            value={sortKey}
            onChange={(event) => changeSort(event.target.value as SortKey)}
          >
            <option value="club">Club</option>
            <option value="country">Land</option>
            <option value="date">Datum</option>
            <option value="status">Zusage / Status</option>
          </select>
        </label>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setDescending((current) => !current)}
        >
          {descending ? "Absteigend ↓" : "Aufsteigend ↑"}
        </button>
        <span className="text-muted">{emails.length} gesendete E-Mail(s)</span>
      </div>
      <div className="email-list">
        {sortedEmails.map((email) => (
          <Link className="email-row" href={`/emails/${email.id}`} key={email.id}>
            <div>
              <div className="email-row-subject">{email.subject}</div>
              <div className="email-row-meta">
                {email.bandName} · {email.recipientEmail}
              </div>
            </div>
            <div className="email-row-meta">
              <strong>{email.venueName}</strong>
              <br />
              {email.country}
            </div>
            <div className="email-row-meta">{formatDate(email.firstSentAt)}</div>
            <div className="email-row-status email-row-status-sent">
              {statusLabel(email.bookingStatus)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
