import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">404 - Page Not Found</h1>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="flex justify-center">
            <Link href="/">
              <Button className="bg-red-600 hover:bg-red-700">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
