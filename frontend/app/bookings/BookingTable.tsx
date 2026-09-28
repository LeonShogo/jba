"use client";

import { deleteBooking, updateBooking } from "../actions";
import { useResizableTable } from "../useResizableTable";

export type BookingRow = {
  id: number;
  bandName: string;
  venueName: string;
  status: string;
  notes: string | null;
};

const initialColumnWidths = [20, 24, 18, 24, 14];
const minimumColumnWidths = [10, 10, 10, 15, 10];

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

  const headers = ["Band", "Venue", "Status", "Notiz", "Aktionen"];

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

          return (
            <div
              className="resizable-table-row resizable-table-data-row"
              role="row"
              key={booking.id}
              style={{
                gridTemplateColumns,
                height: rowHeights[booking.id] ?? 38,
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
                <textarea
                  form={formId}
                  name="notes"
                  defaultValue={booking.notes ?? ""}
                />
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
