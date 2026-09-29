"use client";

import Link from "next/link";
import { deleteBooking, updateBooking } from "../actions";
import { AutoGrowTextarea } from "../AutoGrowTextarea";
import { useResizableTable } from "../useResizableTable";

export type BookingRow = {
  id: number;
  bandName: string;
  venueName: string;
  status: string;
  notes: string | null;
  draftCount: number;
};

const initialColumnWidths = [17, 20, 15, 20, 14, 14];
const minimumColumnWidths = [9, 9, 8, 12, 8, 10];

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
    storageKey: "jba:bookings-table-layout",
    initialColumnWidths,
    minimumColumnWidths,
    initialRowHeight: 38,
    minimumRowHeight: 32,
  });

  const headers = ["Band", "Venue", "Status", "Notiz", "E-Mail", "Aktionen"];

  return (
    <div className="resizable-table" role="table">
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
        {bookings.map((booking) => {
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
                minHeight: rowHeights[booking.id] ?? 38,
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
                  form={formId}
                  name="status"
                  defaultValue={booking.status}
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
                <AutoGrowTextarea
                  form={formId}
                  name="notes"
                  defaultValue={booking.notes ?? ""}
                />
              </div>
              <div className="resizable-table-cell" role="cell">
                <Link
                  className="resizable-table-link"
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
  );
}
