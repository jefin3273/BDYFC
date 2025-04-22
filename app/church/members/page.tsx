"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, Trash2, UserPlus } from "lucide-react"
import { supabaseBrowser } from "@/lib/supabase"

interface ChurchMember {
  id: number
  name: string
  email: string
  phone: string
  created_at: string
}

export default function ChurchMembersPage() {
  const router = useRouter()
  const [members, setMembers] = useState<ChurchMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null)
  const [churchId, setChurchId] = useState<number | null>(null)

  useEffect(() => {
    const fetchChurchId = async () => {
      const { data: sessionData } = await supabaseBrowser.auth.getSession()
      if (!sessionData.session) return

      const { data: churchData } = await supabaseBrowser
        .from("churches")
        .select("id")
        .eq("user_id", sessionData.session.user.id)
        .single()

      if (churchData) {
        setChurchId(churchData.id)
        fetchMembers(churchData.id)
      }
    }

    fetchChurchId()
  }, [])

  const fetchMembers = async (id: number) => {
    setLoading(true)
    const { data, error } = await supabaseBrowser
      .from("church_members")
      .select("*")
      .eq("church_id", id)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching members:", error)
    } else {
      setMembers(data || [])
    }
    setLoading(false)
  }

  const handleDeleteClick = (id: number) => {
    setMemberToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (memberToDelete === null || churchId === null) return

    const { error } = await supabaseBrowser
      .from("church_members")
      .delete()
      .eq("id", memberToDelete)
      .eq("church_id", churchId)

    if (error) {
      console.error("Error deleting member:", error)
    } else {
      setMembers(members.filter((member) => member.id !== memberToDelete))
    }

    setIsDeleteDialogOpen(false)
    setMemberToDelete(null)
  }

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery),
  )

  return (
    <div className="container space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Church Members</h1>
          <p className="text-muted-foreground">Manage your church members</p>
        </div>
        <Link href="/church/members/new">
          <Button className="gap-2">
            <UserPlus size={16} />
            Add Member
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search members..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p>Loading members...</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(member.id)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchQuery ? "No members match your search" : "No members found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
