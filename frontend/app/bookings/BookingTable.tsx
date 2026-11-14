"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteBooking, updateBooking } from "../actions";
import { AutoGrowTextarea } from "../AutoGrowTextarea";
import { useResizableTable } from "../useResizableTable";

export type BookingRow = {
  id: number;
  bandName: string;
  venueName: string;
  status: string;
  notes: string | null;
  firstSentAt: string | null;
  draftCount: number;
};

const initialColumnWidths = [16, 18, 14, 13, 17, 11, 11];
const minimumColumnWidths = [8, 8, 8, 8, 10, 8, 9];
type SortKey = "status" | "date" | "name";

const statusLabels: Record<string, string> = {
  draft: "Entwurf",
  sent: "Gesendet",
  replied: "Antwort erhalten",
  follow_up: "Nachfassen",
  accepted: "Zugesagt",
  rejected: "Abgelehnt",
};

function formatSentDate(value: string | null) {
  if (!value) return "–";
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

type BookingTableProps = {
  bookings: BookingRow[];
};

export function BookingTable({ bookings }: BookingTableProps) {
  const {
    gridTemplateColumns,
    rowHeights,
    startColumnResize,
    startRowResize,
  } = useResizableTable({
    storageKey: "jba:bookings-table-layout-compact-3",
    initialColumnWidths,
    minimumColumnWidths,
    initialRowHeight: 32,
    minimumRowHeight: 28,
  });
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusValues, setStatusValues] = useState<Record<number, string>>(
    () => Object.fromEntries(bookings.map((booking) => [booking.id, booking.status])),
  );

  const sortedBookings = [...bookings].sort((a, b) => {
    let comparison = 0;
    if (sortKey === "status") {
      comparison = (statusLabels[a.status] ?? a.status).localeCompare(
        statusLabels[b.status] ?? b.status,
        "de",
      );
    } else if (sortKey === "date") {
      if (!a.firstSentAt && b.firstSentAt) comparison = 1;
      else if (a.firstSentAt && !b.firstSentAt) comparison = -1;
      else {
        comparison =
          (Date.parse(a.firstSentAt ?? "") || 0) -
          (Date.parse(b.firstSentAt ?? "") || 0);
      }
    } else {
      comparison = `${a.bandName} ${a.venueName}`.localeCompare(
        `${b.bandName} ${b.venueName}`,
        "de",
        { sensitivity: "base" },
      );
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const headers = [
    "Band",
    "Venue",
    "Status",
    "Erster Versand",
    "Notiz",
    "E-Mail",
    "Aktionen",
  ];

  return (
    <>
      <div className="booking-table-toolbar">
        <label>
          Sortieren nach
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
          >
            <option value="name">Alphabetisch</option>
            <option value="status">Status</option>
            <option value="date">Erster Versand</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() =>
            setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
          }
        >
          {sortDirection === "asc" ? "Aufsteigend ↑" : "Absteigend ↓"}
        </button>
      </div>
      <div className="resizable-table booking-table" role="table">
      <div
        className="resizable-table-row resizable-table-header"
        role="row"
        style={{ gridTemplateColumns }}
        suppressHydrationWarning
      >
        {headers.map((header, index) => (
          <div
            className="resizable-table-cell"
            role="columnheader"
            key={header}
          >
            {header}
            {index < headers.length - 1 && (
              <div
                className="column-resize-handle"
                onMouseDown={(event) => startColumnResize(index, event)}
              />
            )}
          </div>
        ))}
      </div>

      <div role="rowgroup">
        {sortedBookings.map((booking) => {
          const formId = `update-booking-${booking.id}`;
          const draftReference =
            booking.draftCount === 0
              ? `${booking.bandName} – ${booking.venueName} · Entwurf anlegen`
              : booking.draftCount === 1
                ? `${booking.bandName} – ${booking.venueName} · Entwurf Nr. 1`
                : `${booking.bandName} – ${booking.venueName} · Entwürfe Nr. 1–${booking.draftCount}`;

          return (
            <div
              id={`booking-${booking.id}`}
              className="resizable-table-row resizable-table-data-row"
              role="row"
              key={booking.id}
              style={{
                gridTemplateColumns,
                minHeight: rowHeights[booking.id] ?? 32,
              }}
              suppressHydrationWarning
            >
              <div className="resizable-table-cell" role="cell">
                <span className="resizable-table-text">{booking.bandName}</span>
              </div>
              <div className="resizable-table-cell" role="cell">
                <span className="resizable-table-text">
                  {booking.venueName}
                </span>
              </div>
              <div className="resizable-table-cell" role="cell">
                <select
                  className={`booking-status-select booking-status-${(statusValues[booking.id] ?? booking.status).replace("_", "-")}`}
                  form={formId}
                  name="status"
                  value={statusValues[booking.id] ?? booking.status}
                  onChange={(event) =>
                    setStatusValues((current) => ({
                      ...current,
                      [booking.id]: event.target.value,
                    }))
                  }
                >
                  <option value="draft">Entwurf</option>
                  <option value="sent">Gesendet</option>
                  <option value="replied">Antwort erhalten</option>
                  <option value="follow_up">Nachfassen</option>
                  <option value="accepted">Zugesagt</option>
                  <option value="rejected">Abgelehnt</option>
                </select>
              </div>
              <div className="resizable-table-cell" role="cell">
                <span className="resizable-table-text">
                  {formatSentDate(booking.firstSentAt)}
                </span>
              </div>
              <div className="resizable-table-cell" role="cell">
                <AutoGrowTextarea
                  form={formId}
                  name="notes"
                  defaultValue={booking.notes ?? ""}
                />
              </div>
              <div className="resizable-table-cell" role="cell">
                <Link
                  className="resizable-table-link booking-draft-link"
                  href={`/email-drafts?booking_id=${booking.id}`}
                  title={draftReference}
                >
                  {draftReference}
                </Link>
              </div>
              <div
                className="resizable-table-cell resizable-table-actions"
                role="cell"
              >
                <form id={formId} action={updateBooking}>
                  <input type="hidden" name="id" value={booking.id} />
                </form>
                <button
                  className="primary-button resizable-table-button"
                  type="submit"
                  form={formId}
                >
                  Speichern
                </button>
                <form action={deleteBooking}>
                  <input type="hidden" name="id" value={booking.id} />
                  <button
                    className="danger-button resizable-table-button"
                    type="submit"
                  >
                    Löschen
                  </button>
                </form>
              </div>

              <div
                className="row-resize-handle"
                onMouseDown={(event) => startRowResize(booking.id, event)}
              />
            </div>
          );
        })}
      </div>
      </div>
    </>
  );
}
