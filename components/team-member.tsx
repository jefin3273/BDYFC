"use client";

import Image from "next/image";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

interface TeamMemberProps {
  name: string;
  position: string;
  bio: string;
  image: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export default function TeamMember({
  name,
  position,
  bio,
  image,
  socialLinks,
}: TeamMemberProps) {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={image || "/placeholder.svg?height=300&width=300"}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          {socialLinks.facebook && (
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-600 shadow-md transition-colors hover:bg-blue-600 hover:text-white"
              aria-label={`${name}'s Facebook`}
            >
              <Facebook className="h-5 w-5" />
            </a>
          )}
          {socialLinks.instagram && (
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-pink-600 shadow-md transition-colors hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white"
              aria-label={`${name}'s Instagram`}
            >
              <Instagram className="h-5 w-5" />
            </a>
          )}
          {socialLinks.twitter && (
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-400 shadow-md transition-colors hover:bg-blue-400 hover:text-white"
              aria-label={`${name}'s Twitter`}
            >
              <Twitter className="h-5 w-5" />
            </a>
          )}
          {socialLinks.linkedin && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-700 shadow-md transition-colors hover:bg-blue-700 hover:text-white"
              aria-label={`${name}'s LinkedIn`}
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-sm font-medium text-red-600">{position}</p>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{bio}</p>
      </div>
    </motion.div>
  );
}
