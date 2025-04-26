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
import { CheckCircle, Eye, AlertCircle } from "lucide-react";
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

export default function PendingChurchesPage() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPendingChurches();
  }, []);

  async function fetchPendingChurches() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("churches")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setChurches(data || []);
    } catch (error) {
      console.error("Error fetching pending churches:", error);
      toast.error("Failed to load pending churches");
    } finally {
      setLoading(false);
    }
  }

  async function approveChurch(churchId: number) {
    try {
      const { error } = await supabase
        .from("churches")
        .update({ is_approved: true })
        .eq("id", churchId);

      if (error) {
        throw error;
      }

      // Remove the church from the pending list
      setChurches(churches.filter((church) => church.id !== churchId));
      toast.success("Church verified successfully");
    } catch (error) {
      console.error("Error approving church:", error);
      toast.error("Failed to verify church");
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending Verification</CardTitle>
              <CardDescription>
                Churches waiting for verification and approval
              </CardDescription>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800">
              {churches.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <p>Loading pending churches...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Church</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Registered On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {churches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="flex flex-col items-center justify-center py-6">
                        <CheckCircle className="mb-2 h-10 w-10 text-green-500" />
                        <p className="text-muted-foreground">
                          No pending churches to verify
                        </p>
                      </div>
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
                        {new Date(church.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveChurch(church.id)}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Verify
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
