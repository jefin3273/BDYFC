import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: BreadcrumbItem[]
  className?: string
}

export default function PageHeader({ title, subtitle, breadcrumb, className }: PageHeaderProps) {
  return (
    <section className={cn("bg-zinc-900 py-12 text-white", className)}>
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-4 text-lg text-zinc-300">{subtitle}</p>}
        </div>

        {breadcrumb && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center space-x-1 text-sm">
              <Link href="/" className="flex items-center text-zinc-300 hover:text-white">
                <Home className="mr-1 h-4 w-4" />
              </Link>
              {breadcrumb.map((item, index) => (
                <div key={index} className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                  {item.href ? (
                    <Link href={item.href} className="ml-1 text-zinc-300 hover:text-white">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="ml-1 text-zinc-100">{item.label}</span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </section>
  )
}
