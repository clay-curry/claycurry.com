"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function CIcon() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by rendering a placeholder until mounted
  if (!mounted) {
    return (
      <Image
        src="/favicon-light.svg"
        alt="CC"
        width={48}
        height={48}
      />
    );
  }

  return (
    <Image
      src={resolvedTheme === "dark" ? "/favicon-dark.svg" : "/favicon-light.svg"}
      alt="CC"
      width={48}
      height={48}
    />
  );
}
