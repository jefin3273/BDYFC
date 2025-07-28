import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import ContactForm from "@/components/contact-form";
import { MapPin, Phone, Mail, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Bombay Diocesan Youth Fellowship Committee",
  description:
    "Get in touch with the Bombay Diocesan Youth Fellowship Committee",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Contact Us"
        subtitle="Get in touch with us for any inquiries"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Feel Free to Contact Us
              </h2>
              <p className="text-muted-foreground mb-8">
                Have questions about our events or want to get involved? Reach
                out to us using the form or contact details below. We'd love to
                hear from you!
              </p>

              <ContactForm />
            </div>

            <div className="space-y-8">
              <div className="rounded-lg overflow-hidden h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.8615486729536!2d72.8295174746619!3d18.937521456306317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7d1de993eaaab%3A0x86b59c45c19d4d9c!2sBDYFC!5e0!3m2!1sen!2sin!4v1745435839117!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Address</h3>
                      <p className="text-sm text-muted-foreground">
                        19, Hazarimal Somani Rd, Azad Maidan, Fort, Mumbai,
                        Maharashtra 400001
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Phone</h3>
                      <p className="text-sm text-muted-foreground">
                        +91 9768555858
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-sm text-muted-foreground">
                        cni.bdyfc@gmail.com
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Website</h3>
                      <p className="text-sm text-muted-foreground">
                        www.bdyfc.org
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
