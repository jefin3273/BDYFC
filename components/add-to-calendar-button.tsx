"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AddToCalendarButtonProps {
  event: {
    title: string;
    description: string;
    location: string;
    startDate: Date;
    endDate: Date;
  };
}

export default function AddToCalendarButton({
  event,
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const googleCalendarUrl = () => {
    const startDate = formatDate(event.startDate);
    const endDate = formatDate(event.endDate);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
      event.description
    )}&location=${encodeURIComponent(event.location)}&sprop=&sprop=name:`;
  };

  const yahooCalendarUrl = () => {
    const startDate = formatDate(event.startDate);
    const endDate = formatDate(event.endDate);

    return `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(
      event.title
    )}&st=${startDate}&et=${endDate}&desc=${encodeURIComponent(
      event.description
    )}&in_loc=${encodeURIComponent(event.location)}`;
  };

  const outlookCalendarUrl = () => {
    const startDate = formatDate(event.startDate);
    const endDate = formatDate(event.endDate);

    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
      event.title
    )}&startdt=${startDate}&enddt=${endDate}&body=${encodeURIComponent(
      event.description
    )}&location=${encodeURIComponent(event.location)}`;
  };

  const icsFileContent = () => {
    const startDate = formatDate(event.startDate);
    const endDate = formatDate(event.endDate);

    return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${window.location.href}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
  };

  const downloadIcsFile = () => {
    const blob = new Blob([icsFileContent()], {
      type: "text/calendar;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/\s+/g, "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="lg" className="bg-red-600 hover:bg-red-700">
          <Calendar className="mr-2 h-4 w-4" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={() => window.open(googleCalendarUrl(), "_blank")}
        >
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(outlookCalendarUrl(), "_blank")}
        >
          Outlook Calendar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(yahooCalendarUrl(), "_blank")}
        >
          Yahoo Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadIcsFile}>
          Download .ics File
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
