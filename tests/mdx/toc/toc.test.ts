import { compile } from "@mdx-js/mdx";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import type { Plugin } from "unified";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TocEntry {
	depth: number;
	text: string;
	slug: string;
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

let extractedToc: TocEntry[] = [];

const extractTocPlugin: Plugin<[], Root> = () => {
	return (tree: Root) => {
		const toc: TocEntry[] = [];

		visit(tree, "heading", (node) => {
			const text = node.children
				.filter((child): child is { type: "text"; value: string } => child.type === "text")
				.map((child) => child.value)
				.join("");

			if (text) {
				toc.push({
					depth: node.depth,
					text,
					slug: slugify(text),
				});
			}
		});

		extractedToc = toc;
	};
};

describe("Table of Contents extraction", () => {
	const fixturesDir = __dirname;
	const mdxContent = fs.readFileSync(path.join(fixturesDir, "page.mdx"), "utf-8");

	it("should extract all headings from MDX content", async () => {

		await compile(mdxContent, {
			remarkPlugins: [extractTocPlugin],
			jsx: true,
		});

		// Should have extracted headings
		expect(extractedToc.length).toBeGreaterThan(0);

		// Check for specific headings from page.mdx
		expect(extractedToc).toContainEqual({ depth: 1, text: "Hello World", slug: "hello-world" });
		expect(extractedToc).toContainEqual({ depth: 2, text: "Section 1", slug: "section-1" });
		expect(extractedToc).toContainEqual({ depth: 3, text: "Subsection 1.1", slug: "subsection-1-1" });
		expect(extractedToc).toContainEqual({ depth: 2, text: "Conclusion", slug: "conclusion" });
	});

	it("should correctly identify heading depths", async () => {
		await compile(mdxContent, {
			remarkPlugins: [extractTocPlugin],
			jsx: true,
		});

		
		// Count headings by depth
		const h1Count = extractedToc.filter((h) => h.depth === 1).length;
		const h2Count = extractedToc.filter((h) => h.depth === 2).length;
		const h3Count = extractedToc.filter((h) => h.depth === 3).length;
		const h4Count = extractedToc.filter((h) => h.depth === 4).length;

		expect(h1Count).toBe(1); // "Hello World"
		expect(h2Count).toBe(5); // Section 1, Section 2, Section 3, Section 4, Conclusion
		expect(h3Count).toBe(5); // Subsection 1.1, 1.2, 1.3, 2.1, 4.1
		expect(h4Count).toBe(1); // Subsection 1.2.1
	});

	it("should generate correct slugs for headings", async () => {
		// Test the slugify function directly
		expect(slugify("Hello World")).toBe("hello-world");
		expect(slugify("Section 1")).toBe("section-1");
		expect(slugify("Subsection 1.1")).toBe("subsection-1-1");
		expect(slugify("  Multiple   Spaces  ")).toBe("multiple-spaces");
		expect(slugify("Special!@#Characters")).toBe("special-characters");
	});

	it("should preserve heading order", async () => {

		await compile(mdxContent, {
			remarkPlugins: [extractTocPlugin],
			jsx: true,
		});

		// Check that headings are in document order
		const headingTexts = extractedToc.map((h) => h.text);
		const expectedOrder = [
			"Hello World",
			"Section 1",
			"Subsection 1.1",
			"Subsection 1.2",
			"Subsection 1.2.1",
			"Subsection 1.3",
			"Section 2",
			"Subsection 2.1",
			"Section 3",
			"Section 4",
			"Subsection 4.1",
			"Conclusion",
		];

		expect(headingTexts).toEqual(expectedOrder);
	});

	it("should handle empty content gracefully", async () => {

		await compile("Just some text without headings", {
			remarkPlugins: [extractTocPlugin],
			jsx: true,
		});

		expect(extractedToc).toEqual([]);
	});
});
