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
                The Bombay Diocesan Youth Fellowship Committee exists to ignite hearts and shape lives by leading young people toward a deeper relationship with Jesus Christ.
              </p>
              <p className="text-muted-foreground">
                We strive to be a guiding light, helping youth find their identity and purpose in Him. Through fellowship, worship, creative expression, and community support, we offer a platform where every young soul can boldly submit their talents to God and grow in faith.
              </p>
              <p className="text-muted-foreground">
                Whether it's spiritual guidance, a listening ear, or simply a space to belong, we stand together, building up a generation that lives boldly for Christ.
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
        members={teamMembers}
      />
    </div>
  );
}
