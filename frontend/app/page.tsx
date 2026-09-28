import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Jazz Booking App</h1>
      <p>Bands, Venues und Booking-Anfragen verwalten.</p>
      <nav>
        <Link href="/bands">Bands</Link>
        <Link href="/venues">Clubs & Festivals</Link>
        <Link href="/bookings">Bookings</Link>
        <Link href="/email-drafts">E-Mail-Entwürfe</Link>
      </nav>
    </main>
  );
}
