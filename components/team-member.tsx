"use client"

import Image from "next/image"
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react"
import { motion } from "framer-motion"

interface TeamMemberProps {
  name: string
  position: string
  bio: string
  image: string
  socialLinks: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
}

export default function TeamMember({ name, position, bio, image, socialLinks }: TeamMemberProps) {
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          {socialLinks.facebook && (
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
            >
              <Facebook className="h-4 w-4" />
              <span className="sr-only">Facebook</span>
            </a>
          )}
          {socialLinks.instagram && (
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-pink-600 transition-colors hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white"
            >
              <Instagram className="h-4 w-4" />
              <span className="sr-only">Instagram</span>
            </a>
          )}
          {socialLinks.twitter && (
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-400 transition-colors hover:bg-blue-400 hover:text-white"
            >
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </a>
          )}
          {socialLinks.linkedin && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-700 transition-colors hover:bg-blue-700 hover:text-white"
            >
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">LinkedIn</span>
            </a>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold">{name}</h3>
        <p className="text-sm text-red-600">{position}</p>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{bio}</p>
      </div>
    </motion.div>
  )
}
