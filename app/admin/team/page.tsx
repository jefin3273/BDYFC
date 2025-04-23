import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Pencil, Trash } from "lucide-react"
import { supabaseServer } from "@/lib/supabase"

async function getTeamMembers() {
  const supabase = supabaseServer()

  const { data, error } = await supabase.from("team_members").select("*").order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching team members:", error)
    return []
  }

  return data || []
}

export default async function AdminTeamPage() {
  const teamMembers = await getTeamMembers()

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <Link href="/admin/team/new">
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teamMembers.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={member.image_url || "/placeholder.svg?height=300&width=300"}
                alt={member.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity hover:opacity-100">
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Link href={`/admin/team/${member.id}`}>
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </Link>
                  <Button size="icon" variant="destructive" className="h-8 w-8">
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold">{member.name}</h3>
              <p className="text-sm text-red-600">{member.position}</p>
              <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">{member.bio}</div>
            </CardContent>
          </Card>
        ))}

        {teamMembers.length === 0 && (
          <Card className="col-span-full p-8 text-center">
            <p className="mb-4 text-muted-foreground">
              No team members found. Add your first team member to get started.
            </p>
            <Link href="/admin/team/new">
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
