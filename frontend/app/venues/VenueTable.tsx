"use client";

import { deleteVenue, updateVenue } from "../actions";
import { AutoGrowTextarea } from "../AutoGrowTextarea";
import { useResizableTable } from "../useResizableTable";

export type Venue = {
  venue_type: "club" | "festival";
  id: number;
  name: string;
  city: string;
  state: string | null;
  country: string | null;
  email: string | null;
  contact_person: string | null;
  website: string | null;
  phone: string | null;
};

const initialColumnWidths = [12, 7, 9, 7, 14, 9, 14, 9, 6, 13];
const minimumColumnWidths = [6, 5, 6, 5, 8, 6, 8, 6, 5, 10];

type VenueTableProps = {
  venues: Venue[];
};

export function VenueTable({ venues }: VenueTableProps) {
  const {
    gridTemplateColumns,
    rowHeights,
    startColumnResize,
    startRowResize,
  } = useResizableTable({
    storageKey: "jba:venues-table-layout",
    initialColumnWidths,
    minimumColumnWidths,
    initialRowHeight: 30,
    minimumRowHeight: 28,
  });

  const headers = [
    "Name",
    "Stadt",
    "Bundesland",
    "Land",
    "E-Mail",
    "Ansprechperson",
    "Website",
    "Telefon",
    "Typ",
    "Aktionen",
  ];

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
        {venues.map((venue) => {
          const formId = `update-venue-${venue.id}`;

          return (
            <div
              className="resizable-table-row resizable-table-data-row"
              role="row"
              key={venue.id}
              style={{
                gridTemplateColumns,
                minHeight: rowHeights[venue.id] ?? 30,
              }}
              suppressHydrationWarning
            >
              <div className="resizable-table-cell" role="cell">
                <AutoGrowTextarea
                  form={formId}
                  name="name"
                  defaultValue={venue.name}
                  required
                />
              </div>
              <div className="resizable-table-cell" role="cell">
                <AutoGrowTextarea
                  form={formId}
                  name="city"
                  defaultValue={venue.city}
                  required
                />
              </div>
              <div className="resizable-table-cell" role="cell">
                <AutoGrowTextarea
                  form={formId}
                  name="state"
                  defaultValue={venue.state ?? ""}
                />
              </div>
              <div className="resizable-table-cell" role="cell">
                <AutoGrowTextarea
                  form={formId}
                  name="country"
                  defaultValue={venue.country ?? ""}
                />
              </div>
              <div className="resizable-table-cell" role="cell">
                <AutoGrowTextarea
                  form={formId}
                  name="email"
                  defaultValue={venue.email ?? ""}
                />
              </div>
              <div className="resizable-table-cell" role="cell">
                <AutoGrowTextarea
                  form={formId}
                  name="contact_person"
                  defaultValue={venue.contact_person ?? ""}
                />
              </div>
              <div className="resizable-table-cell" role="cell">
                <AutoGrowTextarea
                  form={formId}
                  name="website"
                  defaultValue={venue.website ?? ""}
                />
              </div>
              <div className="resizable-table-cell" role="cell">
                <AutoGrowTextarea
                  form={formId}
                  name="phone"
                  defaultValue={venue.phone ?? ""}
                />
              </div>
              <div className="resizable-table-cell" role="cell">
                <select
                  form={formId}
                  name="venue_type"
                  defaultValue={venue.venue_type}
                >
                  <option value="club">Club</option>
                  <option value="festival">Festival</option>
                </select>
              </div>
              <div
                className="resizable-table-cell resizable-table-actions"
                role="cell"
              >
                <form id={formId} action={updateVenue}>
                  <input type="hidden" name="id" value={venue.id} />
                </form>
                <button
                  className="primary-button resizable-table-button"
                  type="submit"
                  form={formId}
                >
                  Speichern
                </button>
                <form action={deleteVenue}>
                  <input type="hidden" name="id" value={venue.id} />
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
                onMouseDown={(event) => startRowResize(venue.id, event)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
