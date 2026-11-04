import Link from "next/link";

export default async function Home() {
  const responses = await Promise.all([
    fetch(`${process.env.API_URL}/bands`, { cache: "no-store" }),
    fetch(`${process.env.API_URL}/venues`, { cache: "no-store" }),
    fetch(`${process.env.API_URL}/bookings`, { cache: "no-store" }),
    fetch(`${process.env.API_URL}/email-drafts`, { cache: "no-store" }),
  ]);

  if (responses.some((response) => !response.ok)) {
    throw new Error("Übersichtsdaten konnten nicht geladen werden.");
  }

  const [bands, venues, bookings, emailDrafts]: unknown[][] =
    await Promise.all(responses.map((response) => response.json()));

  const sections = [
    {
      href: "/bands",
      title: "Bands",
      count: bands.length,
      description: "Bandprofile und Kontaktdaten",
    },
    {
      href: "/venues",
      title: "Clubs & Festivals",
      count: venues.length,
      description: "Venues und Ansprechpartner",
    },
    {
      href: "/bookings",
      title: "Bookings",
      count: bookings.length,
      description: "Anfragen und aktueller Status",
    },
    {
      href: "/email-drafts",
      title: "E-Mail-Entwürfe",
      count: emailDrafts.length,
      description: "Vorbereiten und manuell freigeben",
    },
  ];

  return (
    <main>
      <h1 className="text-2xl font-semibold">Übersicht</h1>
      <p className="mt-1 text-sm text-[#b9aa9c]">
        Bands, Venues und Booking-Anfragen auf einen Blick.
      </p>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => (
          <Link
            className="flex min-h-32 flex-col justify-between rounded-lg border border-[#4a3c32] bg-[#1d1916] p-4 transition hover:-translate-y-0.5 hover:border-[#b98555] hover:bg-[#211c18]"
            href={section.href}
            key={section.href}
          >
            <span className="text-sm text-[#cdbdac]">{section.title}</span>
            <strong className="text-3xl font-semibold">{section.count}</strong>
            <span className="text-xs text-[#9f9185]">
              {section.description}
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
