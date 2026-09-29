export default function AboutPage() {
  return (
    <main className="max-w-3xl">
      <p className="text-sm uppercase tracking-[0.18em] text-[#b98555]">
        Über die Anwendung
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Jazz Booking App</h1>
      <div className="mt-6 space-y-4 text-[#d8cbbd] leading-7">
        <p>
          Die Jazz Booking App bündelt Bands, Spielstätten,
          Booking-Anfragen und E-Mail-Entwürfe an einem Ort.
        </p>
        <p>
          Sie soll den wiederkehrenden organisatorischen Aufwand reduzieren,
          ohne die persönliche Kontrolle über Kontakte und Nachrichten
          abzugeben.
        </p>
        <p>
          KI-Funktionen können später bei Recherche und Formulierung helfen;
          jede E-Mail wird vor dem Versand weiterhin manuell geprüft.
        </p>
      </div>
    </main>
  );
}
