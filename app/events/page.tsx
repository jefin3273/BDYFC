import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import PageHeader from "@/components/page-header";
import EventCard from "@/components/event-card";

export const metadata: Metadata = {
  title: "Events | Bombay Diocesan Youth Fellowship Committee",
  description:
    "Upcoming events organized by the Bombay Diocesan Youth Fellowship Committee",
};

async function getEvents() {
  const { data, error } = await getSupabaseServerClient
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return data || [];
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Events"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Events" }]}
      />

      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Upcoming Events
            </h2>
            <p className="text-muted-foreground">
              Join us for these exciting events organized by the Bombay Diocesan
              Youth Fellowship Committee. Click on an event to learn more and
              register.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`}>
                <EventCard
                  title={event.title}
                  location={event.location}
                  image={event.image_url}
                  color={event.color}
                  date={new Date(event.event_date)}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
