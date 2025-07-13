"use client";

import { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  Facebook,
  Mail
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface ShareEventButtonProps {
  event: {
    title: string;
    url: string;
  };
}

export default function ShareEventButton({ event }: ShareEventButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${event.url}`
      : event.url;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);

    toast({
      title: "Link copied",
      description: "Event link has been copied to clipboard",
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        fullUrl
      )}`,
      "_blank"
    );
  };

  const shareByWhatsapp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `Check out this event: ${event.title}\n\n${fullUrl}`
      )}`,
      "_blank"
    );
  };

  const shareByEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(
      `Event: ${event.title}`
    )}&body=${encodeURIComponent(
      `Check out this event: ${event.title}\n\n${fullUrl}`
    )}`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="lg" variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share Event
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <Check className="mr-2 h-4 w-4" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook}>
          <Facebook className="mr-2 h-4 w-4" />
          Share to Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareByEmail}>
          <Mail className="mr-2 h-4 w-4" />
          Share by Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareByWhatsapp}>
          <FaWhatsapp className="mr-2 h-4 w-4" />
          Share by Whatsapp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
