"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

export default function CIcon() {
  const { resolvedTheme } = useTheme();

  return (
    <Image
      src={resolvedTheme === "dark" ? "/favicon-dark.svg" : "/favicon-light.svg"}
      alt="CC"
      width={48}
      height={48}
    />
  );
}
