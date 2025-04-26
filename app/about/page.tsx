import { supabaseServer } from "@/lib/supabase";
import PageHeader from "@/components/page-header";
import TeamSection from "@/components/team-section";
import Image from "next/image";

async function getTeamMembers() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching team members:", error);
    return [];
  }

  return data || [];
}

export default async function AboutPage() {
  const teamMembers = await getTeamMembers();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="About Us"
        subtitle="Learn more about the Bombay Diocesan Youth Fellowship Committee"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground">
                The Bombay Diocesan Youth Fellowship Committee (BDYFC) is
                dedicated to nurturing the spiritual growth of young people
                through fellowship, worship, and service.
              </p>
              <p className="text-muted-foreground">
                We strive to create a vibrant community where young people can
                grow in their faith, develop leadership skills, and make a
                positive impact in their churches and communities. Through
                various events, workshops, and outreach programs, we aim to
                empower the youth to live out their Christian values in today's
                world.
              </p>
              <p className="text-muted-foreground">
                Founded in 1970, BDYFC has been serving the youth of the Bombay
                Diocese for over five decades. Our committee consists of
                dedicated volunteers who are passionate about youth ministry and
                committed to fostering an environment of spiritual growth and
                fellowship.
              </p>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg lg:aspect-square">
              <Image
                src="/about-image.jpg"
                alt="BDYFC Community"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <TeamSection
        title="Meet Our Team"
        subtitle="Dedicated individuals working together to serve the youth of Bombay Diocese"
        members={teamMembers}
      />
    </div>
  );
}
