import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/schools", label: "Browse schools" },
  { href: "/compare", label: "Compare schools" },
  { href: "/school-register", label: "List your school" },
  { href: "/login", label: "Parent login" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/disclaimer", label: "Data Disclaimer" },
];

export default function Footer() {
  return (
    <footer className="border-t border-blue-800 bg-blue-900 text-blue-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-flex items-center">
              <div className="rounded-xl bg-white/95 px-4 py-2.5 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Lakshya One"
                  width={180}
                  height={48}
                  className="h-9 w-auto"
                  priority={false}
                />
              </div>
            </Link>

            <p className="max-w-xs font-body text-sm leading-relaxed text-blue-200/90">
              A trusted school discovery and comparison platform helping parents
              find the right school and helping schools build a stronger digital
              presence.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <p className="mb-4 font-heading text-sm font-semibold text-white">
              Explore
            </p>

            <ul className="space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-blue-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal navigation">
            <p className="mb-4 font-heading text-sm font-semibold text-white">
              Legal
            </p>

            <ul className="space-y-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-blue-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-4 font-heading text-sm font-semibold text-white">
              Contact
            </p>

            <ul className="space-y-3 font-body text-sm text-blue-200/90">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
                info.lakshyaone@gmail.com
              </li>
              <li className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                  aria-hidden
                />
                Starting from Prayagraj, Uttar Pradesh
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-blue-800 pt-8 sm:flex-row">
          <p className="font-body text-xs text-blue-300/80">
            &copy; {new Date().getFullYear()} Lakshya One. All rights reserved.
          </p>
          <p className="font-body text-xs text-blue-300/60">
            The Right School. The Right Student. One Platform.
          </p>
        </div>
      </div>
    </footer>
  );
}