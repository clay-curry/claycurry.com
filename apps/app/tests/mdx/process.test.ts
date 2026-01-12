import { compile } from "@mdx-js/mdx";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { mdxOptions } from "../../next.config";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("MDX processing", () => {
  it("should compile test-page.mdx", async () => {
    
    const mdxPath = join(__dirname, "./test-page.mdx");
    const mdxContent = readFileSync(mdxPath, "utf-8");

    const result = await compile(mdxContent, mdxOptions);

    expect(result.value).toBeDefined();
    expect(typeof result.value).toBe("string");
    // Verify frontmatter was extracted
    expect(result.value).toContain("frontmatter");
  });
});
