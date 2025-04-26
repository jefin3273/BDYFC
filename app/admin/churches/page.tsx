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
import { CheckCircle, XCircle, Eye, Users, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Church = {
  id: number;
  name: string;
  address: string;
  phone: string;
  contact_person: string;
  logo_url: string;
  is_approved: boolean;
  created_at: string;
};

export default function ChurchesPage() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchChurches();
  }, []);

  async function fetchChurches() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("churches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setChurches(data || []);
    } catch (error) {
      console.error("Error fetching churches:", error);
      toast.error("Failed to load churches");
    } finally {
      setLoading(false);
    }
  }

  async function toggleChurchApproval(
    churchId: number,
    currentStatus: boolean
  ) {
    try {
      const { error } = await supabase
        .from("churches")
        .update({ is_approved: !currentStatus })
        .eq("id", churchId);

      if (error) {
        throw error;
      }

      // Update the local state
      setChurches(
        churches.map((church) =>
          church.id === churchId
            ? { ...church, is_approved: !currentStatus }
            : church
        )
      );

      toast.success(
        `Church ${!currentStatus ? "verified" : "unverified"} successfully`
      );
    } catch (error) {
      console.error("Error updating church status:", error);
      toast.error("Failed to update church verification status");
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>All Churches</CardTitle>
          <CardDescription>
            Manage all registered churches in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <p>Loading churches...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Church</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {churches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No churches found
                    </TableCell>
                  </TableRow>
                ) : (
                  churches.map((church) => (
                    <TableRow key={church.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {church.logo_url ? (
                            <div className="h-10 w-10 overflow-hidden rounded-full">
                              <Image
                                src={church.logo_url}
                                alt={church.name}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                              {church.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{church.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {church.address}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{church.contact_person}</TableCell>
                      <TableCell>{church.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant={church.is_approved ? "default" : "secondary"}
                          className={
                            church.is_approved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {church.is_approved ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toggleChurchApproval(
                                church.id,
                                church.is_approved
                              )
                            }
                          >
                            {church.is_approved ? (
                              <>
                                <XCircle className="mr-1 h-4 w-4" />
                                Unverify
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Verify
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/churches/${church.id}`)
                            }
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/admin/churches/members?churchId=${church.id}`
                              )
                            }
                          >
                            <Users className="mr-1 h-4 w-4" />
                            Members
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
