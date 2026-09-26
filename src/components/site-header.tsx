"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronDown,
  FileText,
  Menu,
  Phone,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { navItems } from "@/lib/nav";

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <Image
        src="/icons/icon-192.png"
        alt="GovTender Pro"
        width={compact ? 32 : 40}
        height={compact ? 32 : 40}
        className={
          compact
            ? "h-8 w-8 rounded-lg object-cover"
            : "h-10 w-10 rounded-xl object-cover shadow-md shadow-[#b86b35]/30 group-hover:scale-105 transition-all"
        }
      />
      {compact ? (
        <span className="text-sm font-extrabold tracking-tight text-foreground">
          GovTender{" "}
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold uppercase tracking-wider">
            Pro
          </span>
        </span>
      ) : (
        <div className="flex flex-col">
          <span className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
            GovTender{" "}
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold uppercase tracking-wider">
              Pro
            </span>
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest -mt-0.5">
            PSU BIDDING INTELLIGENCE
          </span>
        </div>
      )}
    </>
  );
}

export function SiteHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const closeMobile = () => {
    setMobileMenuOpen(false);
    setMobileExpanded(null);
  };

  return (
    <>
      {/* Top Marketing & Announcement Bar */}
      <div className="h-9 w-full bg-slate-900 dark:bg-slate-950 text-slate-100 flex items-center justify-between px-[2%] text-xs font-medium border-b border-slate-800 z-[60] fixed top-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold border border-primary/30">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            ENTERPRISE HUB
          </span>
          <span className="hidden sm:inline text-slate-300">
            EPC, Turnkey &amp; PSU Infrastructure Tenders
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="tel:+919661221326"
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-primary" />
            <span className="hidden md:inline font-semibold">Contact:</span> +91
            9661221326
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="fixed top-9 z-50 w-full border-b border-border/80 bg-card/90 backdrop-blur-xl shadow-xs">
        <div className="flex h-16 w-full items-center justify-between px-[2%] gap-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <BrandMark />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={item.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeDropdown === item.label
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  {item.label}
                  {item.dropdown && (
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                        activeDropdown === item.label ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  )}
                </a>
                <AnimatePresence>
                  {item.dropdown && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-1.5 w-80 rounded-2xl dropdown-popover p-2 shadow-2xl z-[100] border border-border bg-card text-card-foreground"
                    >
                      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1 flex items-center justify-between">
                        <span>{item.label} Modules</span>
                        <Sparkles className="h-3 w-3 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        {item.dropdown.map((subItem) => {
                          const IconComponent = subItem.icon || FileText;
                          return (
                            <a
                              key={subItem.label}
                              href={subItem.href}
                              target={subItem.target}
                              rel={subItem.target ? "noopener noreferrer" : undefined}
                              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all group/item cursor-pointer"
                            >
                              <div className="h-8 w-8 rounded-lg bg-secondary group-hover/item:bg-primary/20 flex items-center justify-center text-muted-foreground group-hover/item:text-primary transition-colors flex-shrink-0 mt-0.5">
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-foreground group-hover/item:text-primary flex items-center justify-between">
                                  <span>{subItem.label}</span>
                                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </div>
                                {subItem.description && (
                                  <p className="text-[11px] text-muted-foreground group-hover/item:text-primary/80 line-clamp-1 mt-0.5">
                                    {subItem.description}
                                  </p>
                                )}
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs shadow-md hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Left Sidebar Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] bg-slate-950/50 backdrop-blur-sm lg:hidden"
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: mobileMenuOpen ? "0%" : "-100%" }}
        transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="fixed top-9 bottom-0 left-0 z-[120] flex w-[85%] max-w-sm flex-col bg-card border-r border-border shadow-2xl lg:hidden overflow-y-auto"
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <BrandMark compact />
          </div>
          <button
            onClick={closeMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {navItems.map((item) => (
            <div key={item.label} className="rounded-xl">
              {item.dropdown ? (
                <>
                  <button
                    onClick={() =>
                      setMobileExpanded(mobileExpanded === item.label ? null : item.label)
                    }
                    className="flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                        mobileExpanded === item.label ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileExpanded === item.label && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-0.5 pl-2 pr-1 pb-1">
                          {item.dropdown.map((subItem) => {
                            const IconComponent = subItem.icon || FileText;
                            return (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                target={subItem.target}
                                rel={subItem.target ? "noopener noreferrer" : undefined}
                                onClick={closeMobile}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                              >
                                <IconComponent className="h-4 w-4 text-primary/80 flex-shrink-0" />
                                <span className="flex-1 min-w-0">{subItem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={closeMobile}
                  className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all cursor-pointer"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </motion.aside>
    </>
  );
}
