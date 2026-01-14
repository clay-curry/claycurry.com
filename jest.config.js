/** @type {import('jest').Config} */
const config = {
	preset: "ts-jest/presets/default-esm",
	testEnvironment: "node",
	testMatch: ["**/tests/**/*.test.ts"],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
	extensionsToTreatAsEsm: [".ts"],
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				useESM: true,
				tsconfig: {
					module: "ESNext",
					moduleResolution: "node",
					esModuleInterop: true,
				},
			},
		],
	},
	transformIgnorePatterns: [
		"node_modules/(?!(@mdx-js|remark-frontmatter|remark-mdx-frontmatter|remark-gfm|unified|unist-.*|vfile.*|bail|trough|is-plain-obj|mdast-.*|micromark.*|decode-named-character-reference|character-entities|estree-.*|hast-.*|property-information|space-separated-tokens|comma-separated-tokens|devlop|ccount|escape-string-regexp|markdown-.*)/)",
	],
};

module.exports = config;
