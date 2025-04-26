import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { supabaseServer } from "@/lib/supabase";
import PageHeader from "@/components/page-header";
import RegistrationForm from "@/components/registration-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddToCalendarButton from "@/components/add-to-calendar-button";
import ShareEventButton from "@/components/share-event-button";

interface EventPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const event = await getEvent(params.slug);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `${event.title} | Bombay Diocesan Youth Fellowship Committee`,
    description: event.description,
  };
}

async function getEvent(slug: string) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    return null;
  }

  return data;
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEvent(params.slug);

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.event_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={event.title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Events", href: "/events" },
          { label: event.title },
        ]}
      />

      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={
                    event.image_url || "/placeholder.svg?height=400&width=600"
                  }
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                    {event.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-5 w-5 text-red-600" />
                      <span>{format(eventDate, "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-5 w-5 text-red-600" />
                      <span>
                        {format(eventDate, "h:mm a")} -{" "}
                        {endDate ? format(endDate, "h:mm a") : "TBD"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-5 w-5 text-red-600" />
                      <span>{event.location}</span>
                    </div>
                    {event.is_online && (
                      <div className="flex items-center gap-1">
                        <Users className="h-5 w-5 text-red-600" />
                        <span>Online Event</span>
                      </div>
                    )}
                  </div>
                </div>

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Event Details</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="pt-4">
                    <div className="prose max-w-none">
                      <p>{event.description}</p>
                      <h3>Who Should Attend</h3>
                      <p>
                        This event is open to all youth members of the Bombay
                        Diocese. Whether you're a regular participant or joining
                        us for the first time, you're welcome to be part of this
                        exciting event.
                      </p>
                      <h3>What to Bring</h3>
                      <ul>
                        <li>Your enthusiasm and energy</li>
                        <li>A notebook and pen</li>
                        <li>Water bottle</li>
                        {!event.is_online && (
                          <li>Comfortable clothing and footwear</li>
                        )}
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="schedule" className="pt-4">
                    <div className="space-y-4">
                      <div className="rounded-md border p-4">
                        <div className="font-medium">Opening Session</div>
                        <div className="text-sm text-muted-foreground">
                          {format(eventDate, "h:mm a")} -{" "}
                          {format(
                            new Date(eventDate.getTime() + 3600000),
                            "h:mm a"
                          )}
                        </div>
                        <div className="mt-2 text-sm">
                          Welcome address and introduction to the event
                        </div>
                      </div>
                      <div className="rounded-md border p-4">
                        <div className="font-medium">Main Program</div>
                        <div className="text-sm text-muted-foreground">
                          {format(
                            new Date(eventDate.getTime() + 3600000),
                            "h:mm a"
                          )}{" "}
                          -{" "}
                          {format(
                            new Date(eventDate.getTime() + 7200000),
                            "h:mm a"
                          )}
                        </div>
                        <div className="mt-2 text-sm">
                          Core activities and presentations
                        </div>
                      </div>
                      <div className="rounded-md border p-4">
                        <div className="font-medium">Closing Session</div>
                        <div className="text-sm text-muted-foreground">
                          {format(
                            new Date(eventDate.getTime() + 7200000),
                            "h:mm a"
                          )}{" "}
                          -{" "}
                          {endDate
                            ? format(endDate, "h:mm a")
                            : format(
                                new Date(eventDate.getTime() + 10800000),
                                "h:mm a"
                              )}
                        </div>
                        <div className="mt-2 text-sm">
                          Wrap-up, awards, and closing prayer
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex flex-wrap gap-4">
                  <AddToCalendarButton
                    event={{
                      title: event.title,
                      description: event.description,
                      location: event.location,
                      startDate: eventDate,
                      endDate:
                        endDate || new Date(eventDate.getTime() + 7200000),
                    }}
                  />
                  <ShareEventButton
                    event={{
                      title: event.title,
                      url: `/events/${event.slug}`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <RegistrationForm
                eventId={event.id}
                eventTitle={event.title}
                eventDate={eventDate}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
