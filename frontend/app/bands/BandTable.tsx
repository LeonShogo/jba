"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import {
  deleteBand,
  deleteBandDocument,
  updateBand,
  uploadBandDocument,
} from "../actions";
import { AutoGrowTextarea } from "../AutoGrowTextarea";
import { useResizableTable } from "../useResizableTable";

export type BandRow = {
  id: number;
  name: string;
  genre: string | null;
  lineup: string | null;
  website: string | null;
  epk_url: string | null;
  photo_url: string | null;
  music_url: string | null;
  equipment: string | null;
  equipment_pdf_url: string | null;
  tech_rider_url: string | null;
  stage_plan_url: string | null;
  description: string | null;
  band_text: string | null;
  description_pdf_url: string | null;
  band_text_pdf_url: string | null;
};

const initialColumnWidths = [10, 7, 9, 8, 8, 7, 7, 9, 7, 7, 7, 7, 7];
const minimumColumnWidths = [5, 4, 5, 5, 5, 4, 4, 5, 4, 4, 4, 4, 6];

type BandTableProps = {
  bands: BandRow[];
  apiUrl: string;
};

type FieldProps = {
  formId: string;
  name: string;
  label: string;
  value: string | null;
};

type BandDocumentType =
  | "equipment"
  | "tech-rider"
  | "stage-plan"
  | "description"
  | "band-text";

type PdfProps = {
  bandId: number;
  documentType: BandDocumentType;
  label: string;
  value: string | null;
  apiUrl: string;
};

function documentUrl(apiUrl: string, value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${apiUrl.replace(/\/$/, "")}${value}`;
}

function closeOnBackdropClick(event: ReactMouseEvent<HTMLDialogElement>) {
  const dialog = event.currentTarget;
  const bounds = dialog.getBoundingClientRect();
  const clickedInside =
    event.clientX >= bounds.left &&
    event.clientX <= bounds.right &&
    event.clientY >= bounds.top &&
    event.clientY <= bounds.bottom;

  if (!clickedInside) dialog.close();
}

function PdfUploadControls({
  bandId,
  documentType,
  label,
  value,
  apiUrl,
}: PdfProps) {
  return (
    <div className="band-pdf-controls">
      <form action={uploadBandDocument}>
        <input type="hidden" name="band_id" value={bandId} />
        <input type="hidden" name="document_type" value={documentType} />
        <input type="file" name="file" accept="application/pdf,.pdf" required />
        <button className="primary-button" type="submit">
          PDF hochladen
        </button>
      </form>
      {value && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <a href={documentUrl(apiUrl, value)} target="_blank" rel="noreferrer">
            {label} öffnen ↗
          </a>
          <form action={deleteBandDocument}>
            <input type="hidden" name="band_id" value={bandId} />
            <input type="hidden" name="document_type" value={documentType} />
            <button className="danger-button" type="submit">
              PDF entfernen
            </button>
          </form>
        </div>
      )}
      <p>Nur PDF, maximal 10 MB.</p>
    </div>
  );
}

function PdfDialogField(props: PdfProps) {
  const dialogId = `band-${props.bandId}-${props.documentType}`;
  const statusLabel = props.value
    ? `${props.label}: PDF vorhanden`
    : `${props.label}: PDF fehlt`;

  return (
    <div className="resizable-table-cell" role="cell">
      <button
        className={`band-link-status band-link-status-${props.value ? "saved" : "missing"}`}
        type="button"
        aria-label={statusLabel}
        title={statusLabel}
        onClick={() => {
          const dialog = document.getElementById(dialogId);
          if (dialog instanceof HTMLDialogElement) dialog.showModal();
        }}
      >
        {props.value ? "✓" : "○"}
      </button>
      <dialog
        className="band-link-dialog"
        id={dialogId}
        onClick={closeOnBackdropClick}
      >
        <h2 className="text-base font-semibold">{props.label}</h2>
        <PdfUploadControls {...props} />
        <button
          className="mt-3"
          type="button"
          onClick={(event) => {
            const dialog = event.currentTarget.closest("dialog");
            if (dialog instanceof HTMLDialogElement) dialog.close();
          }}
        >
          Schließen
        </button>
      </dialog>
    </div>
  );
}

function isUsableUrl(value: string | null) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function LinkDialogField({ formId, name, label, value }: FieldProps) {
  const dialogId = `${formId}-${name}`;
  const valid = isUsableUrl(value);
  const status = !value ? "missing" : valid ? "saved" : "invalid";
  const statusLabel =
    status === "saved"
      ? `${label}: Link gespeichert`
      : status === "missing"
        ? `${label}: Link fehlt`
        : `${label}: Link prüfen`;

  return (
    <div className="resizable-table-cell" role="cell">
      <button
        className={`band-link-status band-link-status-${status}`}
        type="button"
        aria-label={statusLabel}
        title={statusLabel}
        onClick={() => {
          const dialog = document.getElementById(dialogId);
          if (dialog instanceof HTMLDialogElement) dialog.showModal();
        }}
      >
        {status === "saved" ? "✓" : status === "missing" ? "○" : "?"}
      </button>
      <dialog
        className="band-link-dialog"
        id={dialogId}
        onClick={closeOnBackdropClick}
      >
        <h2 className="text-base font-semibold">{label}</h2>
        <input
          type="url"
          pattern="https?://.+"
          form={formId}
          name={name}
          defaultValue={value ?? ""}
          placeholder="https://…"
          aria-label={label}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button className="primary-button" type="submit" form={formId}>
            Speichern
          </button>
          <button
            type="button"
            onClick={(event) => {
              const dialog = event.currentTarget.closest("dialog");
              if (dialog instanceof HTMLDialogElement) dialog.close();
            }}
          >
            Schließen
          </button>
          {valid && (
            <a href={value ?? ""} target="_blank" rel="noreferrer">
              Link testen ↗
            </a>
          )}
        </div>
      </dialog>
    </div>
  );
}

type LongTextFieldProps = FieldProps & {
  bandId: number;
  documentType: "equipment" | "description" | "band-text";
  pdfValue: string | null;
  apiUrl: string;
};

function LongTextField({
  formId,
  name,
  label,
  value,
  bandId,
  documentType,
  pdfValue,
  apiUrl,
}: LongTextFieldProps) {
  const dialogId = `${formId}-${name}`;

  return (
    <div className="resizable-table-cell" role="cell">
      <button
        className="band-content-status"
        type="button"
        title={`${label}: Text ${value ? "vorhanden" : "fehlt"}, PDF ${pdfValue ? "vorhanden" : "fehlt"}`}
        onClick={() => {
          const dialog = document.getElementById(dialogId);
          if (dialog instanceof HTMLDialogElement) dialog.showModal();
        }}
      >
        <span className={value ? "status-saved" : "status-missing"}>
          T{value ? "✓" : "○"}
        </span>
        <span className={pdfValue ? "status-saved" : "status-missing"}>
          P{pdfValue ? "✓" : "○"}
        </span>
      </button>
      <dialog
        className="band-text-dialog"
        id={dialogId}
        onClick={closeOnBackdropClick}
      >
        <h2 className="text-lg font-semibold">{label}</h2>
        <textarea
          form={formId}
          name={name}
          defaultValue={value ?? ""}
          placeholder={`${label} eingeben`}
        />
        <div className="mt-3 flex gap-2">
          <button className="primary-button" type="submit" form={formId}>
            Speichern
          </button>
          <button
            type="button"
            onClick={(event) => {
              const dialog = event.currentTarget.closest("dialog");
              if (dialog instanceof HTMLDialogElement) dialog.close();
            }}
          >
            Schließen
          </button>
        </div>
        <PdfUploadControls
          bandId={bandId}
          documentType={documentType}
          label={`${label} als PDF`}
          value={pdfValue}
          apiUrl={apiUrl}
        />
      </dialog>
    </div>
  );
}

export function BandTable({ bands, apiUrl }: BandTableProps) {
  const {
    gridTemplateColumns,
    rowHeights,
    startColumnResize,
    startRowResize,
  } = useResizableTable({
    storageKey: "jba:bands-table-layout",
    initialColumnWidths,
    minimumColumnWidths,
    initialRowHeight: 34,
    minimumRowHeight: 30,
  });

  const headers = [
    "Bandname",
    "Genre",
    "Besetzung",
    "Webseite",
    "EPK",
    "Fotos",
    "Musik",
    "Equipment",
    "Techrider",
    "Stageplan",
    "Beschreibung",
    "Bandtext",
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
        {bands.map((band) => {
          const formId = `update-band-${band.id}`;

          return (
            <div
              id={`band-${band.id}`}
              className="resizable-table-row resizable-table-data-row"
              role="row"
              key={band.id}
              style={{
                gridTemplateColumns,
                minHeight: rowHeights[band.id] ?? 34,
              }}
              suppressHydrationWarning
            >
              <div className="resizable-table-cell" role="cell">
                <AutoGrowTextarea
                  form={formId}
                  name="name"
                  defaultValue={band.name}
                  aria-label={`Name von ${band.name}`}
                  required
                />
              </div>
              <div className="resizable-table-cell" role="cell">
                <AutoGrowTextarea
                  form={formId}
                  name="genre"
                  defaultValue={band.genre ?? ""}
                  placeholder="–"
                  aria-label={`Genre von ${band.name}`}
                />
              </div>
              <div className="resizable-table-cell" role="cell">
                <AutoGrowTextarea
                  form={formId}
                  name="lineup"
                  defaultValue={band.lineup ?? ""}
                  placeholder="Instrument – Name"
                  aria-label={`Besetzung von ${band.name}`}
                />
              </div>
              <LinkDialogField
                formId={formId}
                name="website"
                label={`Webseite von ${band.name}`}
                value={band.website}
              />
              <LinkDialogField
                formId={formId}
                name="epk_url"
                label={`EPK von ${band.name}`}
                value={band.epk_url}
              />
              <LinkDialogField
                formId={formId}
                name="photo_url"
                label={`Fotos von ${band.name}`}
                value={band.photo_url}
              />
              <LinkDialogField
                formId={formId}
                name="music_url"
                label={`Musik von ${band.name}`}
                value={band.music_url}
              />
              <LongTextField
                formId={formId}
                name="equipment"
                label={`Equipment: ${band.name}`}
                value={band.equipment}
                bandId={band.id}
                documentType="equipment"
                pdfValue={band.equipment_pdf_url}
                apiUrl={apiUrl}
              />
              <PdfDialogField
                bandId={band.id}
                documentType="tech-rider"
                label={`Techrider von ${band.name}`}
                value={band.tech_rider_url}
                apiUrl={apiUrl}
              />
              <PdfDialogField
                bandId={band.id}
                documentType="stage-plan"
                label={`Stageplan von ${band.name}`}
                value={band.stage_plan_url}
                apiUrl={apiUrl}
              />
              <LongTextField
                formId={formId}
                name="description"
                label={`Bandbeschreibung: ${band.name}`}
                value={band.description}
                bandId={band.id}
                documentType="description"
                pdfValue={band.description_pdf_url}
                apiUrl={apiUrl}
              />
              <LongTextField
                formId={formId}
                name="band_text"
                label={`Bandtext: ${band.name}`}
                value={band.band_text}
                bandId={band.id}
                documentType="band-text"
                pdfValue={band.band_text_pdf_url}
                apiUrl={apiUrl}
              />
              <div
                className="resizable-table-cell resizable-table-actions"
                role="cell"
              >
                <form id={formId} action={updateBand}>
                  <input type="hidden" name="id" value={band.id} />
                </form>
                <button
                  className="primary-button resizable-table-button"
                  type="submit"
                  form={formId}
                >
                  Speichern
                </button>
                <form action={deleteBand}>
                  <input type="hidden" name="id" value={band.id} />
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
                onMouseDown={(event) => startRowResize(band.id, event)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
