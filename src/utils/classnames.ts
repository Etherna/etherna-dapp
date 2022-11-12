import clsx from "clsx"
import { twMerge } from "tailwind-merge"

import type { ClassValue } from "clsx"

export default function classNames(...args: ClassValue[]) {
  return twMerge(clsx(args))
}
