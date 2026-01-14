import { compile } from "@mdx-js/mdx";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("remarkFrontmatter", () => {
	const fixturesDir = __dirname;
	const mdxContent = fs.readFileSync(path.join(fixturesDir, "page.mdx"), "utf-8");

	it("should parse YAML frontmatter and export it as metadata", async () => {
		const resultPromise = compile(mdxContent, { remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter], jsx: true });
		const result = await resultPromise;
		const code = String(result);

		// Check that frontmatter is exported
		expect(code).toContain("export const frontmatter");

		// Check that frontmatter values are present in the output
		expect(code).toContain("Test Page");
		expect(code).toContain("A test page for frontmatter parsing");
		expect(code).toContain("Clay Curry");
	});

	it("should remove frontmatter from the rendered content", async () => {
		const result = await compile(mdxContent, { remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter], jsx: true });

		const code = String(result);

		// The YAML block delimiters should not appear in the output
		expect(code).not.toMatch(/^---$/m);
	});

	it("should work without remarkMdxFrontmatter (just strips frontmatter)", async () => {
		const result = await compile(mdxContent, {
			remarkPlugins: [remarkFrontmatter],
			jsx: true,
		});

		const code = String(result);

		// Without remarkMdxFrontmatter, frontmatter is stripped but not exported
		expect(code).not.toContain("export const frontmatter");
		// The YAML block should be removed
		expect(code).not.toMatch(/^---$/m);
	});

	it("should preserve MDX content after frontmatter", async () => {
		const result = await compile(mdxContent, { remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter], jsx: true });

		const code = String(result);

		// Check that the actual content is preserved
		expect(code).toContain("Hello World");
		expect(code).toContain("test MDX file with frontmatter");
	});

	it("should handle custom frontmatter export name", async () => {
		const result = await compile(mdxContent, {
			remarkPlugins: [
				remarkFrontmatter,
				[remarkMdxFrontmatter, { name: "meta" }],
			],
			jsx: true,
		});

		const code = String(result);

		// Check that frontmatter is exported with custom name
		expect(code).toContain("export const meta");
	});
});
