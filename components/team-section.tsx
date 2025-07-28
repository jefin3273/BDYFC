"use client";

import React from "react";
import TeamCarousel, { TeamMember } from "./ui/TeamCarousel";

// Convert original data shape to new TeamMember type
interface OriginalTeamMember {
  id: number;
  name: string;
  position: string;
  image_url: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_linkedin?: string;
}

interface TeamSectionProps {
  title: string;
  // subtitle: string;
  members: OriginalTeamMember[];
}

export default function TeamSection({
  title,
  // subtitle,
  members,
}: TeamSectionProps) {
  // Map original members to new TeamMember format for the carousel
  const carouselMembers: TeamMember[] = members.map((m) => ({
    id: m.id.toString(),
    name: m.name,
    role: m.position,
    image:
      m.image_url ||
      "/placeholder.svg?height=400&width=300", // fallback if image_url missing
    bio: undefined, // bio not provided in original data, you can add if needed
  }));

  return (
    <section className="py-16 bg-slate-50 min-h-screen flex flex-col items-center">
      <div className="max-w-4xl px-4 md:px-6 text-center">
        <h2
          className="text-7xl font-bold mb-4"
          style={{
            background:
              "linear-gradient(to bottom, rgba(220, 38, 38, 1) 40%, transparent 96%)", // use your red color gradient accent from old style
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {title}
        </h2>
        {/* <p className="text-lg text-muted-foreground max-w-2xl mx-auto opacity-80">
          {subtitle}
        </p> */}
      </div>

      <TeamCarousel
        members={carouselMembers}
        title={undefined} // title is displayed above, so hide internal title
        cardWidth={280}
        cardHeight={380}
        cardRadius={20}
        showArrows={true}
        showDots={true}
        keyboardNavigation={true}
        touchNavigation={true}
        animationDuration={600}
        autoPlay={5000}
        pauseOnHover={true}
        visibleCards={2}
        sideCardScale={0.9}
        sideCardOpacity={0.8}
        grayscaleEffect={true}
        className="relative w-full max-w-6xl"
        infoPosition="bottom"
        infoTextColor="rgb(220 38 38)" // Tailwind red-600 rgb value like original color text
        infoBackground="transparent"
      />
    </section>
  );
}
