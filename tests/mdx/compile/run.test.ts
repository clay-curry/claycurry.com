import { compile } from "@mdx-js/mdx";
import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * A basic remark plugin that duplicates all paragraph content
 */
const remarkDuplicateContent: Plugin<[], Root> = () => {
	return (tree: Root) => {
		visit(tree, "paragraph", (node) => {
			// Duplicate text nodes within the paragraph
			const textChildren = node.children.filter(
				(child): child is { type: "text"; value: string } => child.type === "text",
			);

			for (const textChild of textChildren) {
				textChild.value = `${textChild.value} ${textChild.value}`;
			}
		});
	};
};

/**
 * A plugin that wraps all paragraphs in a custom marker
 */
const remarkWrapParagraphs: Plugin<[], Root> = () => {
	return (tree: Root) => {
		visit(tree, "paragraph", (node) => {
			for (const child of node.children) {
				if (child.type === "text") {
					child.value = `[WRAPPED] ${child.value} [/WRAPPED]`;
				}
			}
		});
	};
};

describe("MDX compiler plugin tests", () => {
	it("should compile basic MDX content", async () => {
		const mdxContent = "Hello world";

		const result = await compile(mdxContent, { jsx: true });
		const code = String(result);

		expect(code).toContain("Hello world");
	});

	it("should apply duplicate content plugin", async () => {
		const mdxContent = "Hello world";

		const result = await compile(mdxContent, {
			remarkPlugins: [remarkDuplicateContent],
			jsx: true,
		});
		const code = String(result);

		expect(code).toContain("Hello world Hello world");
	});

	it("should apply wrap paragraphs plugin", async () => {
		const mdxContent = "Test content";

		const result = await compile(mdxContent, {
			remarkPlugins: [remarkWrapParagraphs],
			jsx: true,
		});
		const code = String(result);

		expect(code).toContain("[WRAPPED]");
		expect(code).toContain("[/WRAPPED]");
		expect(code).toContain("Test content");
	});

	it("should chain multiple plugins in order", async () => {
		const mdxContent = "Original";

		// First duplicate, then wrap
		const result = await compile(mdxContent, {
			remarkPlugins: [remarkDuplicateContent, remarkWrapParagraphs],
			jsx: true,
		});
		const code = String(result);

		// Should see duplicated content wrapped
		expect(code).toContain("[WRAPPED] Original Original [/WRAPPED]");
	});

	it("should handle multiple paragraphs", async () => {
		const mdxContent = `First paragraph

Second paragraph

Third paragraph`;

		const result = await compile(mdxContent, {
			remarkPlugins: [remarkDuplicateContent],
			jsx: true,
		});
		const code = String(result);

		expect(code).toContain("First paragraph First paragraph");
		expect(code).toContain("Second paragraph Second paragraph");
		expect(code).toContain("Third paragraph Third paragraph");
	});

	it("should not affect headings with paragraph plugin", async () => {
		const mdxContent = `# Heading

Paragraph content`;

		const result = await compile(mdxContent, {
			remarkPlugins: [remarkDuplicateContent],
			jsx: true,
		});
		const code = String(result);

		// Heading should not be duplicated (plugin only targets paragraphs)
		expect(code).toMatch(/Heading/);
		expect(code).not.toContain("Heading Heading");

		// But paragraph should be duplicated
		expect(code).toContain("Paragraph content Paragraph content");
	});

	it("should handle empty content", async () => {
		const mdxContent = "";

		const result = await compile(mdxContent, {
			remarkPlugins: [remarkDuplicateContent],
			jsx: true,
		});
		const code = String(result);

		// Should compile without error
		expect(code).toBeDefined();
	});
});
