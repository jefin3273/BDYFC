"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Trash2, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface ChurchMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface MembershipRequest {
  id: string;
  user_id: string;
  created_at: string;
  user_profile: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function ChurchMembersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [members, setMembers] = useState<ChurchMember[]>([]);
  const [membershipRequests, setMembershipRequests] = useState<
    MembershipRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  const [churchId, setChurchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchChurchId = async () => {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      if (!sessionData.session) return;

      const { data: churchData } = await supabaseBrowser
        .from("churches")
        .select("id")
        .eq("user_id", sessionData.session.user.id)
        .single();

      if (churchData) {
        setChurchId(churchData.id);
        fetchMembers(churchData.id);
        fetchMembershipRequests(churchData.id);
      }
    };

    fetchChurchId();
  }, []);

  const fetchMembers = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabaseBrowser
      .from("church_members")
      .select("*")
      .eq("church_id", id)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching members:", error);
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  };

  const fetchMembershipRequests = async (id: string) => {
    const { data, error } = await supabaseBrowser
      .from("church_membership_requests")
      .select(
        `
        id,
        user_id,
        created_at,
        user_profile:user_profiles(name, email, phone)
      `
      )
      .eq("church_id", id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching membership requests:", error);
    } else {
      setMembershipRequests(
        (data || []).map((request: any) => ({
          ...request,
          user_profile: Array.isArray(request.user_profile)
            ? request.user_profile[0]
            : request.user_profile,
        }))
      );
    }
  };

  const handleDeleteClick = (id: number) => {
    setMemberToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (memberToDelete === null || churchId === null) return;

    const { error } = await supabaseBrowser
      .from("church_members")
      .delete()
      .eq("id", memberToDelete)
      .eq("church_id", churchId);

    if (error) {
      console.error("Error deleting member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    } else {
      setMembers(members.filter((member) => member.id !== memberToDelete));
      toast({
        title: "Member removed",
        description: "The member has been removed successfully.",
      });
    }

    setIsDeleteDialogOpen(false);
    setMemberToDelete(null);
  };

  const handleApproveRequest = async (requestId: string, userId: string) => {
    if (!churchId) return;

    try {
      // Begin transaction
      // 1. Update the membership request status
      const { error: requestError } = await supabaseBrowser
        .from("church_membership_requests")
        .update({ status: "approved" })
        .eq("id", requestId);

      if (requestError) throw requestError;

      // 2. Update the user profile
      const { error: profileError } = await supabaseBrowser
        .from("user_profiles")
        .update({
          church_id: churchId,
          church_membership_status: "approved",
        })
        .eq("user_id", userId);

      if (profileError) throw profileError;

      // 3. Add to church members
      const { data: userData } = await supabaseBrowser
        .from("user_profiles")
        .select("name, email, phone")
        .eq("user_id", userId)
        .single();

      if (userData) {
        const { error: memberError } = await supabaseBrowser
          .from("church_members")
          .insert([
            {
              church_id: churchId,
              user_id: userId,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
            },
          ]);

        if (memberError) throw memberError;
      }

      // Refresh data
      fetchMembershipRequests(churchId);
      fetchMembers(churchId);

      toast({
        title: "Request approved",
        description: "The membership request has been approved successfully.",
      });
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string, userId: string) => {
    if (!churchId) return;

    try {
      // 1. Update the membership request status
      const { error: requestError } = await supabaseBrowser
        .from("church_membership_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (requestError) throw requestError;

      // 2. Update the user profile
      const { error: profileError } = await supabaseBrowser
        .from("user_profiles")
        .update({
          church_id: null,
          church_membership_status: null,
        })
        .eq("user_id", userId);

      if (profileError) throw profileError;

      // Refresh data
      fetchMembershipRequests(churchId);

      toast({
        title: "Request rejected",
        description: "The membership request has been rejected.",
      });
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery)
  );

  return (
    <div className="container space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Church Members</h1>
          <p className="text-muted-foreground">
            Manage your church members and membership requests
          </p>
        </div>
        <Link href="/church/members/new">
          <Button className="gap-2">
            <UserPlus size={16} />
            Add Member
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="requests">
            Membership Requests
            {membershipRequests.length > 0 && (
              <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
                {membershipRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <div className="flex items-center gap-2 mb-4">
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
                        <TableCell className="font-medium">
                          {member.name}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell>
                          {new Date(member.created_at).toLocaleDateString()}
                        </TableCell>
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
                        {searchQuery
                          ? "No members match your search"
                          : "No members found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membershipRequests.length > 0 ? (
                  membershipRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.user_profile.name}
                      </TableCell>
                      <TableCell>{request.user_profile.email}</TableCell>
                      <TableCell>
                        {request.user_profile.phone || "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() =>
                              handleApproveRequest(request.id, request.user_id)
                            }
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() =>
                              handleRejectRequest(request.id, request.user_id)
                            }
                          >
                            <XCircle size={16} className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No pending membership requests
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
