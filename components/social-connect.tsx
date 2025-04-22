import Link from "next/link"
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react"

interface SocialConnectProps {
  facebook?: string
  instagram?: string
  youtube?: string
  twitter?: string
  className?: string
}

export default function SocialConnect({ facebook, instagram, youtube, twitter, className = "" }: SocialConnectProps) {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {facebook && (
        <Link
          href={facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-600 transition-colors hover:text-red-600"
          aria-label="Facebook"
        >
          <Facebook size={20} />
        </Link>
      )}
      {instagram && (
        <Link
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-600 transition-colors hover:text-red-600"
          aria-label="Instagram"
        >
          <Instagram size={20} />
        </Link>
      )}
      {youtube && (
        <Link
          href={youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-600 transition-colors hover:text-red-600"
          aria-label="YouTube"
        >
          <Youtube size={20} />
        </Link>
      )}
      {twitter && (
        <Link
          href={twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-600 transition-colors hover:text-red-600"
          aria-label="Twitter"
        >
          <Twitter size={20} />
        </Link>
      )}
    </div>
  )
}
