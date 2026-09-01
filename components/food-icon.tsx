import {
  Baby,
  Beef,
  Bubbles,
  Candy,
  Citrus,
  Croissant,
  CupSoda,
  Droplets,
  IceCreamCone,
  Martini,
  Milk,
  Popcorn,
  Soup,
  Utensils,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Resolves a food category's icon name to a component. Explicit map rather
 * than a dynamic lookup so the bundle only carries the fourteen icons in use.
 */
const ICONS: Record<string, LucideIcon> = {
  Baby,
  Beef,
  Bubbles,
  Candy,
  Citrus,
  Croissant,
  CupSoda,
  Droplets,
  IceCreamCone,
  Martini,
  Milk,
  Popcorn,
  Soup,
  Wheat,
};

export function FoodIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Utensils;
  return <Icon className={cn("size-5 shrink-0", className)} strokeWidth={1.5} aria-hidden />;
}
