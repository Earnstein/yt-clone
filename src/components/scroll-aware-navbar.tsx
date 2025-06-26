"use client";

import { Icons } from "@/components/global/icon-template";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  ChevronDown,
  FileText,
  Menu,
  Phone,
  Shield,
  ShoppingBag,
  Smartphone,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: typeof Icons.add;
  description?: string;
  badge?: string;
  children?: NavigationItem[];
}

export const gampNavigationData: NavigationItem[] = [
  {
    id: "products",
    label: "Products",
    href: "/products",
    icon: ShoppingBag,
    description: "Explore our device solutions",
    children: [
      {
        id: "devices",
        label: "Devices",
        href: "/shop",
        icon: Smartphone,
        description: "Latest devices for your business",
        badge: "Popular",
        children: [
          {
            id: "laptops",
            label: "Laptops",
            href: "/shop/laptops",
            description: "High-performance business laptops",
          },
          {
            id: "phones",
            label: "Smartphones",
            href: "/shop/phones",
            description: "Latest mobile devices",
          },
          {
            id: "tablets",
            label: "Tablets",
            href: "/shop/tablets",
            description: "Portable computing solutions",
          },
        ],
      },
      {
        id: "financing",
        label: "Device Financing",
        href: "/device-financing",
        icon: FileText,
        description: "Flexible payment options",
        children: [
          {
            id: "business-plans",
            label: "Business Plans",
            href: "/device-financing/business",
            description: "Financing for businesses",
          },
          {
            id: "individual-plans",
            label: "Individual Plans",
            href: "/device-financing/individual",
            description: "Personal device financing",
          },
          {
            id: "trade-in",
            label: "Trade-in Program",
            href: "/device-financing/trade-in",
            description: "Trade your old devices",
          },
        ],
      },
      {
        id: "protection",
        label: "Device Protection",
        href: "/protect-device",
        icon: Shield,
        description: "Comprehensive device insurance",
        children: [
          {
            id: "insurance",
            label: "Device Insurance",
            href: "/protect-device/insurance",
            description: "Full coverage protection",
          },
          {
            id: "warranty",
            label: "Extended Warranty",
            href: "/protect-device/warranty",
            description: "Extended manufacturer warranty",
          },
          {
            id: "theft-protection",
            label: "Theft Protection",
            href: "/protect-device/theft",
            description: "Protection against theft and loss",
          },
        ],
      },
    ],
  },
  {
    id: "services",
    label: "Services",
    href: "/services",
    icon: Wrench,
    description: "Professional device services",
    children: [
      {
        id: "repairs",
        label: "Device Repairs",
        href: "/repair",
        icon: Wrench,
        description: "Expert repair services",
        badge: "24/7",
        children: [
          {
            id: "screen-repair",
            label: "Screen Repair",
            href: "/repair/screen",
            description: "Professional screen replacement",
          },
          {
            id: "battery-replacement",
            label: "Battery Replacement",
            href: "/repair/battery",
            description: "Battery replacement service",
          },
          {
            id: "water-damage",
            label: "Water Damage",
            href: "/repair/water-damage",
            description: "Water damage restoration",
          },
          {
            id: "pickup-delivery",
            label: "Pickup & Delivery",
            href: "/repair/pickup",
            description: "Convenient pickup and delivery",
          },
        ],
      },
      {
        id: "mdm",
        label: "Device Management",
        href: "/device-manager",
        icon: Smartphone,
        description: "Mobile device management solutions",
        children: [
          {
            id: "fleet-management",
            label: "Fleet Management",
            href: "/device-manager/fleet",
            description: "Manage device fleets",
          },
          {
            id: "security",
            label: "Security Solutions",
            href: "/device-manager/security",
            description: "Enterprise security features",
          },
          {
            id: "app-management",
            label: "App Management",
            href: "/device-manager/apps",
            description: "Application deployment and control",
          },
        ],
      },
      {
        id: "business-solutions",
        label: "Business Solutions",
        href: "/businesses",
        icon: Briefcase,
        description: "Complete business packages",
        children: [
          {
            id: "enterprise",
            label: "Enterprise Solutions",
            href: "/businesses/enterprise",
            description: "Large-scale business solutions",
          },
          {
            id: "smb",
            label: "Small Business",
            href: "/businesses/small-business",
            description: "Solutions for small businesses",
          },
          {
            id: "onboarding",
            label: "Employee Onboarding",
            href: "/businesses/onboarding",
            description: "Streamlined device deployment",
          },
        ],
      },
    ],
  },
  {
    id: "support",
    label: "Support",
    href: "/support",
    icon: Users,
    description: "Get help when you need it",
    children: [
      {
        id: "help-center",
        label: "Help Center",
        href: "/faq",
        icon: FileText,
        description: "Find answers to common questions",
        children: [
          {
            id: "faq",
            label: "FAQ",
            href: "/faq",
            description: "Frequently asked questions",
          },
          {
            id: "guides",
            label: "User Guides",
            href: "/support/guides",
            description: "Step-by-step guides",
          },
          {
            id: "troubleshooting",
            label: "Troubleshooting",
            href: "/support/troubleshooting",
            description: "Fix common issues",
          },
        ],
      },
      {
        id: "contact",
        label: "Contact Us",
        href: "/contact",
        icon: Phone,
        description: "Get in touch with our team",
        children: [
          {
            id: "live-chat",
            label: "Live Chat",
            href: "/contact/chat",
            description: "Chat with our support team",
          },
          {
            id: "email",
            label: "Email Support",
            href: "/contact/email",
            description: "Send us an email",
          },
          {
            id: "phone",
            label: "Phone Support",
            href: "/contact/phone",
            description: "Call our support line",
          },
        ],
      },
    ],
  },
];

export const ScrollAwareNavbar = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuExpanded, setMobileMenuExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setLastScrollY(currentScrollY);

      // Only close menus when scrolling down if no mobile submenu is expanded
      if (currentScrollY > lastScrollY && !mobileMenuExpanded) {
        if (isMenuOpen && !activeParent) {
          setIsMenuOpen(false);
        }
        if (activeParent && !isMenuOpen) {
          setActiveParent(null);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMenuOpen, mobileMenuExpanded, activeParent]);

  // Reset mobile menu expanded state when main menu closes
  useEffect(() => {
    if (!isMenuOpen) {
      setMobileMenuExpanded(false);
      setActiveParent(null);
    }
  }, [isMenuOpen]);

  const getMenuState = () => {
    if (scrollY < 100) return "top";
    return "floating";
  };

  const menuState = getMenuState();
  const activeParentData = gampNavigationData.find(
    (item) => item.id === activeParent
  );

  return (
    <div>
      {/* Scroll-Aware Navbar */}
      <motion.header
        initial={{ y: 0 }}
        animate={{
          y: 0,
          scale: menuState === "floating" ? 0.98 : 1,
          borderRadius: menuState === "floating" ? 12 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          menuState === "floating" &&
            "mx-4 mt-4 shadow-2xl border border-green-400 bg-neutral-00/50 backdrop-blur-md",
          menuState === "top" && "bg-white/95"
        )}
      >
        <div className="container flex justify-between items-center px-4 mx-auto h-20">
          {/* Logo */}
          <Link href="/">
            <Icons.gamp className="size-24 text-gampprimary" />
          </Link>

          {/* Desktop Navigation with Mega Menu */}
          <nav className="hidden items-center space-x-1 md:flex">
            {gampNavigationData.map((item) => (
              <div key={item.id} className="relative">
                <Button
                  onMouseEnter={() => setActiveParent(item.id)}
                  onMouseLeave={() => setActiveParent(null)}
                  onClick={() =>
                    setActiveParent(activeParent === item.id ? null : item.id)
                  }
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                    activeParent === item.id
                      ? "bg-green-700 text-white"
                      : "hover:bg-green-700 hover:text-white text-neutral-900",
                    scrollY > 100
                      ? "bg-inherit text-black hover:text-white"
                      : "bg-white text-neutral-900 hover:text-white"
                  )}
                >
                  {item.icon && <item.icon className="size-4" />}
                  <span className="text-subheading-1">{item.label}</span>
                </Button>
              </div>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden items-center space-x-3 md:flex">
            <Button className="text-green-700 transition-all duration-300 bg-neutral-200 hover:bg-neutral-100 hover:text-green-700">
              Get started
            </Button>
            <Button>Sign in</Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsMenuOpen((prev) => {
                const newIsOpen = !prev;
                // when closing the menu, reset all submenu states
                if (!newIsOpen) {
                  setActiveParent(null);
                  setMobileMenuExpanded(false);
                }
                return newIsOpen;
              });
            }}
            className="md:hidden"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Desktop Mega Menu Panel */}
        <AnimatePresence>
          {activeParent && activeParentData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-gradient-to-r border-t border-green-200 backdrop-blur-md from-white/95 to-green-100/95"
              onMouseEnter={() => setActiveParent(activeParent)}
              onMouseLeave={() => setActiveParent(null)}
            >
              <div className="p-6 mx-auto max-w-7xl">
                <div className="flex gap-4 items-center mb-6">
                  {activeParentData.icon && (
                    <div className="p-3 text-white bg-gradient-to-br from-green-700 to-green-800 rounded-full">
                      <activeParentData.icon className="size-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-subheading-1">
                      {activeParentData.label}
                    </h3>
                    <p className="text-body-1">
                      {activeParentData.description}
                    </p>
                  </div>
                </div>

                {activeParentData.children && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeParentData.children.map((child, index) => (
                      <motion.div
                        key={child.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl border border-green-200 backdrop-blur-sm transition-all duration-200 bg-white/60 hover:shadow-lg hover:bg-green-50 hover:border-green-300"
                      >
                        <div className="flex gap-3 items-start">
                          {child.icon && (
                            <div className="p-2 bg-green-400 rounded-full">
                              <child.icon className="text-white size-5" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex gap-2 items-center mb-1">
                              <h4 className="text-subheading-1">
                                {child.label}
                              </h4>
                            </div>
                            <p className="mb-3 text-body-1">
                              {child.description}
                            </p>

                            {child.children && (
                              <div className="space-y-1">
                                {child.children
                                  .slice(0, 3)
                                  .map((grandchild) => (
                                    <Link
                                      key={grandchild.id}
                                      href={grandchild.href}
                                      className="block text-caption-1 hover:text-green-700 text-neutral-700 !font-normal"
                                    >
                                      • {grandchild.label}
                                    </Link>
                                  ))}
                                {child.children.length > 3 && (
                                  <span className="text-xs text-slate-400">
                                    +{child.children.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-green-200 backdrop-blur-md md:hidden bg-white/95"
            >
              <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
                {gampNavigationData.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => {
                        const newActiveParent =
                          activeParent === item.id ? null : item.id;
                        setActiveParent(newActiveParent);
                        setMobileMenuExpanded(newActiveParent !== null);
                      }}
                      className="flex gap-3 items-center p-3 w-full text-left rounded-lg transition-colors hover:bg-green-700 hover:text-white"
                    >
                      {item.icon && (
                        <item.icon className="w-5 h-5 text-slate-600" />
                      )}
                      <span className="font-medium text-slate-800">
                        {item.label}
                      </span>
                      {item.children && (
                        <ChevronDown
                          className={`w-4 h-4 ml-auto transition-transform ${
                            activeParent === item.id ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>

                    <AnimatePresence>
                      {activeParent === item.id && item.children && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-2 ml-8 space-y-1"
                        >
                          {item.children.map((child) => (
                            <a
                              key={child.id}
                              href={child.href}
                              className="block p-2 text-sm rounded transition-colors text-slate-600 hover:text-white hover:bg-green-700"
                            >
                              {child.label}
                            </a>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </div>
  );
};
