import Image from "next/image"
import { MapPin, Calendar } from "lucide-react"
import { format } from "date-fns"

interface EventCardProps {
  title: string
  location: string
  image: string
  color: string
  date?: Date
}

export default function EventCard({ title, location, image, color, date }: EventCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg h-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image || "/placeholder.svg?height=300&width=400"}
          alt={title}
          width={400}
          height={300}
          className="object-cover transition-transform duration-500 group-hover:scale-110 h-full w-full"
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent ${color} mix-blend-multiply`} />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
        <h3 className="mb-2 text-xl font-bold">{title}</h3>
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        {date && (
          <div className="flex items-center gap-1 text-sm mt-1">
            <Calendar className="h-4 w-4" />
            <span>{format(date, "MMMM d, yyyy")}</span>
          </div>
        )}
      </div>
    </div>
  )
}
