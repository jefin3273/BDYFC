import Image from "next/image";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/event-card";
import MissionCard from "@/components/mission-card";
import CountdownTimer from "@/components/countdown-timer";
import SocialMediaFeed from "@/components/social-media-feed";
import AnimatedSection from "@/components/animated-section";

// Define interfaces for your data types
interface Event {
  id: number | string;
  title: string;
  slug: string;
  location: string;
  event_date: string;
  image_url?: string;
  color?: string;
}

interface GalleryImage {
  id: number | string;
  title: string;
  category: string;
  image_url?: string;
  display_order: number;
}

async function getEvents(): Promise<Event[]> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .limit(4);

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return data || [];
}

async function getGalleryImages(): Promise<GalleryImage[]> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("display_order", { ascending: true })
    .limit(6);

  if (error) {
    console.error("Error fetching gallery images:", error);
    return [];
  }

  return data || [];
}

export default async function Home() {
  const events = await getEvents();
  const galleryImages = await getGalleryImages();

  // Get the first upcoming event for the countdown
  const upcomingEvent = events.length > 0 ? events[0] : null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/church-building.jpg"
            alt="Church Building"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative flex h-full flex-col items-center justify-center text-center text-white">
          <div className="container px-4 md:px-6">
            <AnimatedSection>
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Diocesan
                <br />
                Youth Fellowship
                <br />
                Committee
              </h1>
              <p className="mt-4 text-xl opacity-90 md:text-2xl">BOMBAY CNI</p>
              <div className="mt-8"></div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Bible Verse Section */}
      <AnimatedSection>
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <h2 className="relative mb-8 text-center text-3xl font-bold">
              <span className="relative">
                Bible Verse
                <span className="absolute -bottom-2 left-1/2 h-1 w-12 -translate-x-1/2 bg-red-600"></span>
              </span>
            </h2>
            <blockquote className="mx-auto max-w-3xl text-center text-lg italic text-muted-foreground">
              "Don't let anyone look down on you because you are young, but set
              an example for the believers in speech, in conduct, in love, in
              faith and in purity." - 1 Timothy 4:12
            </blockquote>

            {upcomingEvent && (
              <div className="mt-16 grid gap-8 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                  <h3 className="text-2xl font-bold">{upcomingEvent.title}</h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{upcomingEvent.location}</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {new Date(upcomingEvent.event_date).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}{" "}
                    -{" "}
                    {new Date(upcomingEvent.event_date).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                  <div className="mt-4">
                    <CountdownTimer
                      targetDate={new Date(upcomingEvent.event_date)}
                    />
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-lg">
                  <Image
                    src={upcomingEvent.image_url || "/talent-show.jpg"}
                    alt={upcomingEvent.title}
                    width={600}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </AnimatedSection>

      {/* Mission Section */}
      <AnimatedSection>
        <section className="bg-slate-50 py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <h2 className="relative mb-12 text-center text-3xl font-bold">
              <span className="relative">
                We Build You To
                <span className="absolute -bottom-2 left-1/2 h-1 w-12 -translate-x-1/2 bg-red-600"></span>
              </span>
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <MissionCard
                icon="gift"
                title="Help The Poor"
                description="Empower lives, support the underprivileged. Join us in our mission to uplift the less fortunate. Together, we can make a difference in the lives of the poor."
              />
              <MissionCard
                icon="compass"
                title="Guide The Youth"
                description="Empowering the future leaders, we guide the youth towards their full potential. Join us in shaping a brighter tomorrow."
              />
              <MissionCard
                icon="heart"
                title="Support Christianity"
                description="Join us in supporting Christianity's values of love, compassion, and community. Together, we embrace faith and make a positive impact on lives."
              />
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Events Section */}
      <AnimatedSection>
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <h2 className="relative mb-12 text-center text-3xl font-bold">
              <span className="relative">
                Our Upcoming Events
                <span className="absolute -bottom-2 left-1/2 h-1 w-12 -translate-x-1/2 bg-red-600"></span>
              </span>
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {events.map((event: Event) => (
                <Link key={event.id} href={`/events/${event.slug}`}>
                  <EventCard
                    title={event.title}
                    location={event.location}
                    image={event.image_url || "/placeholder.svg"}
                    color={event.color || "#FFFFFF"}
                    date={new Date(event.event_date)}
                  />
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/events">
                <Button
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                >
                  View All Events
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Gallery Preview Section */}
      <AnimatedSection>
        <section className="bg-slate-50 py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <h2 className="relative mb-12 text-center text-3xl font-bold">
              <span className="relative">
                Gallery
                <span className="absolute -bottom-2 left-1/2 h-1 w-12 -translate-x-1/2 bg-red-600"></span>
              </span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {galleryImages.map((image: GalleryImage) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-lg"
                >
                  <div className="aspect-square">
                    <Image
                      src={
                        image.image_url ||
                        "/placeholder.svg?height=300&width=300"
                      }
                      alt={image.title}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <h3 className="text-lg font-bold">{image.title}</h3>
                      <p className="mt-1 text-sm">{image.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/gallery">
                <Button
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                >
                  View Full Gallery
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Social Connect Section */}
      <AnimatedSection>
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <h2 className="relative mb-12 text-center text-3xl font-bold">
              <span className="relative">
                Social Connect
                <span className="absolute -bottom-2 left-1/2 h-1 w-12 -translate-x-1/2 bg-red-600"></span>
              </span>
            </h2>
            <SocialMediaFeed />
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
