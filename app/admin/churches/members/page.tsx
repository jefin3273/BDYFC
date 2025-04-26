"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, UserPlus, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type ChurchMember = {
  id: number;
  church_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
};

type Church = {
  id: number;
  name: string;
  is_approved: boolean;
};

export default function ChurchMembersPage() {
  const [members, setMembers] = useState<ChurchMember[]>([]);
  const [church, setChurch] = useState<Church | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const churchId = searchParams.get("churchId");
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (churchId) {
      fetchChurchDetails();
      fetchChurchMembers();
    } else {
      router.push("/admin/churches");
    }
  }, [churchId]);

  async function fetchChurchDetails() {
    try {
      if (!churchId) return;

      const { data, error } = await supabase
        .from("churches")
        .select("id, name, is_approved")
        .eq("id", churchId)
        .single();

      if (error) {
        throw error;
      }

      setChurch(data);
    } catch (error) {
      console.error("Error fetching church details:", error);
      toast.error("Failed to load church details");
    }
  }

  async function fetchChurchMembers() {
    try {
      if (!churchId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("church_members")
        .select("*")
        .eq("church_id", churchId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching church members:", error);
      toast.error("Failed to load church members");
    } finally {
      setLoading(false);
    }
  }

  async function deleteMember(memberId: number) {
    try {
      const { error } = await supabase
        .from("church_members")
        .delete()
        .eq("id", memberId);

      if (error) {
        throw error;
      }

      // Remove the member from the local state
      setMembers(members.filter((member) => member.id !== memberId));
      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Failed to remove member");
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="outline"
        className="mb-4"
        onClick={() => router.push("/admin/churches")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Churches
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {church ? church.name : "Church"} Members
                {church && !church.is_approved && (
                  <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                    Church Pending Verification
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Manage members registered under this church
              </CardDescription>
            </div>
            <Button
              onClick={() =>
                router.push(`/admin/churches/members/add?churchId=${churchId}`)
              }
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <p>Loading members...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="flex flex-col items-center justify-center py-6">
                        <p className="text-muted-foreground">
                          No members found for this church
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() =>
                            router.push(
                              `/admin/churches/members/add?churchId=${churchId}`
                            )
                          }
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add New Member
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {member.phone}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {member.address}
                      </TableCell>
                      <TableCell>
                        {new Date(member.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/admin/churches/members/edit?id=${member.id}`
                              )
                            }
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to remove this member?"
                                )
                              ) {
                                deleteMember(member.id);
                              }
                            }}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
