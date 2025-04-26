"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Search, Download, Eye } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Registration {
  id: number;
  event_id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  payment_status: string;
  status: string;
  events: {
    id: number;
    title: string;
    event_date: string;
    location: string;
  };
}

export default function ChurchRegistrationsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
        fetchRegistrations(churchData.id);
      }
    };

    fetchChurchId();
  }, []);

  const fetchRegistrations = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabaseBrowser
      .from("registrations")
      .select(
        `
        *,
        events (id, title, event_date, location)
      `
      )
      .eq("church_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching registrations:", error);
    } else {
      setRegistrations(data || []);
    }
    setLoading(false);
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return;

    // Create CSV content
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Event",
      "Event Date",
      "Registration Date",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...registrations.map((reg) =>
        [
          `"${reg.name}"`,
          `"${reg.email}"`,
          `"${reg.phone}"`,
          `"${reg.events.title}"`,
          `"${format(new Date(reg.events.event_date), "MMM d, yyyy")}"`,
          `"${format(new Date(reg.created_at), "MMM d, yyyy")}"`,
          `"${reg.status}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `church-registrations-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.events.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Event Registrations
          </h1>
          <p className="text-muted-foreground">
            Manage your church's event registrations
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={exportToCSV}
          disabled={registrations.length === 0}
        >
          <Download size={16} />
          Export to CSV
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search registrations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p>Loading registrations...</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Registrations</CardTitle>
            <CardDescription>
              View and manage all event registrations for your church
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Registered On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <div className="font-medium">{registration.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {registration.email}
                          </div>
                        </TableCell>
                        <TableCell>{registration.events.title}</TableCell>
                        <TableCell>
                          {format(
                            new Date(registration.events.event_date),
                            "MMM d, yyyy"
                          )}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(registration.created_at),
                            "MMM d, yyyy"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              registration.status === "confirmed"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            }
                          >
                            {registration.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {searchQuery
                          ? "No registrations match your search"
                          : "No registrations found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
