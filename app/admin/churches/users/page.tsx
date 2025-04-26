"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Eye,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Search,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  role: string;
  church_id?: number;
  church_name?: string;
  is_church_approved?: boolean;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRoles, setUserRoles] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchUserRoles();
    fetchUsers();
  }, []);

  async function fetchUserRoles() {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, name");

      if (error) {
        throw error;
      }

      const roles: { [key: string]: string } = {};
      data?.forEach((role) => {
        roles[role.id] = role.name;
      });

      setUserRoles(roles);
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true);

      // First get all users from auth.users
      const { data: authUsers, error: authError } =
        await supabase.auth.admin.listUsers();

      if (authError) {
        throw authError;
      }

      // Get user roles
      const { data: roleAssignments, error: roleError } = await supabase
        .from("user_role_assignments")
        .select("user_id, role_id");

      if (roleError) {
        throw roleError;
      }

      // Get church information for users with churches
      const { data: churchData, error: churchError } = await supabase
        .from("churches")
        .select("id, user_id, name, is_approved");

      if (churchError) {
        throw churchError;
      }

      // Map role assignments to users
      const roleMap: { [key: string]: number } = {};
      roleAssignments?.forEach((assignment) => {
        roleMap[assignment.user_id] = assignment.role_id;
      });

      // Map churches to users
      const churchMap: {
        [key: string]: { id: number; name: string; is_approved: boolean };
      } = {};
      churchData?.forEach((church) => {
        churchMap[church.user_id] = {
          id: church.id,
          name: church.name,
          is_approved: church.is_approved,
        };
      });

      // Combine data
      const formattedUsers = authUsers?.users.map((user) => ({
        id: user.id,
        email: user.email || "", // Ensure email is always a string
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        created_at: user.created_at,
        role: userRoles[roleMap[user.id]] || "User", // Default to "User" if no role found
        church_id: churchMap[user.id]?.id,
        church_name: churchMap[user.id]?.name,
        is_church_approved: churchMap[user.id]?.is_approved,
      }));

      setUsers(formattedUsers || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function getFilteredUsers() {
    if (!searchTerm) return users;

    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name || ""} ${user.last_name || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        user.church_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage all registered users in the system
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchUsers}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <p>Loading users...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Church</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredUsers().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      {searchTerm
                        ? "No users found matching your search"
                        : "No users found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  getFilteredUsers().map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : "No Name"}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.church_name ? (
                          <div className="flex items-center gap-2">
                            {user.church_name}
                            {user.is_church_approved ? (
                              <Badge className="bg-green-100 text-green-800">
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Pending
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No church
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/users/${user.id}`)
                            }
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                          {user.church_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/admin/churches/${user.church_id}`)
                              }
                            >
                              <UserCheck className="mr-1 h-4 w-4" />
                              View Church
                            </Button>
                          )}
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
