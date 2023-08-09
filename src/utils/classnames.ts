import clsx from "clsx"
import { twMerge } from "tailwind-merge"

import type { ClassValue } from "clsx"

export function cn(...args: ClassValue[]) {
  return twMerge(clsx(args))
}
