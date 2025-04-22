import type { Metadata } from "next"
import Image from "next/image"
import { getSupabaseServerClient } from "@/lib/supabase"
import PageHeader from "@/components/page-header"
import TeamMember from "@/components/team-member"

export const metadata: Metadata = {
  title: "About Us | Bombay Diocesan Youth Fellowship Committee",
  description: "Learn about the Bombay Diocesan Youth Fellowship Committee and our mission",
}

async function getTeamMembers() {
  const { data, error } = await getSupabaseServerClient
    .from("team_members")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching team members:", error)
    return []
  }

  return data || []
}

export default async function AboutPage() {
  const teamMembers = await getTeamMembers()

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="About Us"
        subtitle="Learn about our mission and the team behind BDYFC"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About Us" }]}
      />

      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Our Mission</h2>
              <div className="prose max-w-none">
                <p>
                  The Bombay Diocesan Youth Fellowship Committee (BDYFC) is dedicated to nurturing the spiritual,
                  intellectual, and social development of young people within the Bombay Diocese of the Church of North
                  India (CNI).
                </p>
                <p>
                  Established in 1915, our committee has been at the forefront of youth ministry, providing a platform
                  for young people to grow in faith, develop leadership skills, and contribute meaningfully to the
                  church and society.
                </p>
                <p>
                  We organize various events, workshops, and outreach programs throughout the year to engage youth and
                  help them discover their potential while strengthening their relationship with God and the community.
                </p>
                <h3>Our Core Values</h3>
                <ul>
                  <li>
                    <strong>Faith:</strong> Nurturing a deep and personal relationship with God
                  </li>
                  <li>
                    <strong>Fellowship:</strong> Building meaningful connections within the community
                  </li>
                  <li>
                    <strong>Service:</strong> Reaching out to those in need with compassion and love
                  </li>
                  <li>
                    <strong>Leadership:</strong> Developing the next generation of church and community leaders
                  </li>
                  <li>
                    <strong>Inclusivity:</strong> Welcoming all young people regardless of background
                  </li>
                </ul>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden">
              <Image
                src="/about-image.jpg"
                alt="Youth gathering at church"
                width={600}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 lg:py-20 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground">
              Our dedicated team works tirelessly to organize events, provide guidance, and create meaningful
              experiences for the youth of our diocese.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teamMembers.map((member) => (
              <TeamMember
                key={member.id}
                name={member.name}
                position={member.position}
                bio={member.bio}
                image={member.image_url}
                socialLinks={{
                  facebook: member.social_facebook,
                  instagram: member.social_instagram,
                  twitter: member.social_twitter,
                  linkedin: member.social_linkedin,
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
