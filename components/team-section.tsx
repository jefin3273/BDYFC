"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

interface TeamMember {
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
  subtitle: string;
  members: TeamMember[];
}

export default function TeamSection({
  title,
  subtitle,
  members,
}: TeamSectionProps) {
  // Split members into rows of 3
  const rows = [];
  for (let i = 0; i < members.length; i += 3) {
    rows.push(members.slice(i, i + 3));
  }

  return (
    <section className="py-16 bg-slate-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {subtitle}
          </motion.p>
        </div>

        <div className="space-y-12">
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`grid gap-8 md:grid-cols-3`}
            >
              {row.map((member, index) => (
                <motion.div
                  key={member.id}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="relative overflow-hidden rounded-lg bg-white shadow-lg">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image
                        src={
                          member.image_url ||
                          "/placeholder.svg?height=400&width=300"
                        }
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-xl font-bold">{member.name}</h3>
                      <p className="text-sm font-medium text-red-600">
                        {member.position}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
