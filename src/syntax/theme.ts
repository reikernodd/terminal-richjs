import { Style } from "../core/style";

export interface SyntaxTheme {
	name: string;
	styles: Record<string, Style>;
	background?: string;
}

// Monokai theme - classic dark theme inspired by Sublime Text
export const MONOKAI: SyntaxTheme = {
	name: "monokai",
	background: "#272822",
	styles: {
		// Keywords and control flow
		keyword: Style.parse("#f92672 bold"),
		built_in: Style.parse("#66d9ef"),
		type: Style.parse("#66d9ef italic"),
		literal: Style.parse("#ae81ff"),

		// Values
		number: Style.parse("#ae81ff"),
		string: Style.parse("#e6db74"),
		regexp: Style.parse("#e6db74"),
		symbol: Style.parse("#ae81ff"),

		// Comments and docs
		comment: Style.parse("#75715e dim"),
		doctag: Style.parse("#75715e"),
		meta: Style.parse("#75715e"),

		// Functions and classes
		function: Style.parse("#a6e22e"),
		title: Style.parse("#a6e22e"),
		"title.function": Style.parse("#a6e22e"),
		"title.class": Style.parse("#a6e22e italic"),
		"title.class.inherited": Style.parse("#a6e22e"),

		// Variables and parameters
		params: Style.parse("#fd971f italic"),
		variable: Style.parse("#f8f8f2"),
		"variable.language": Style.parse("#fd971f"),
		"variable.constant": Style.parse("#ae81ff"),

		// Properties and attributes
		property: Style.parse("#66d9ef"),
		attr: Style.parse("#a6e22e"),
		attribute: Style.parse("#a6e22e"),

		// Operators and punctuation
		operator: Style.parse("#f92672"),
		punctuation: Style.parse("#f8f8f2"),

		// Misc
		tag: Style.parse("#f92672"),
		name: Style.parse("#a6e22e"),
		"selector-tag": Style.parse("#f92672"),
		"selector-class": Style.parse("#a6e22e"),
		"selector-id": Style.parse("#a6e22e"),

		// Template literals
		"template-variable": Style.parse("#e6db74"),
		"template-tag": Style.parse("#f92672"),
		subst: Style.parse("#f8f8f2"),
	},
};

// Dracula theme - popular dark theme
export const DRACULA: SyntaxTheme = {
	name: "dracula",
	background: "#282a36",
	styles: {
		keyword: Style.parse("#ff79c6 bold"),
		built_in: Style.parse("#8be9fd"),
		type: Style.parse("#8be9fd italic"),
		literal: Style.parse("#bd93f9"),
		number: Style.parse("#bd93f9"),
		string: Style.parse("#f1fa8c"),
		regexp: Style.parse("#f1fa8c"),
		comment: Style.parse("#6272a4 dim"),
		function: Style.parse("#50fa7b"),
		title: Style.parse("#50fa7b"),
		"title.function": Style.parse("#50fa7b"),
		"title.class": Style.parse("#50fa7b italic"),
		params: Style.parse("#ffb86c italic"),
		variable: Style.parse("#f8f8f2"),
		property: Style.parse("#8be9fd"),
		attr: Style.parse("#50fa7b"),
		operator: Style.parse("#ff79c6"),
		tag: Style.parse("#ff79c6"),
	},
};

// GitHub Light theme
export const GITHUB_LIGHT: SyntaxTheme = {
	name: "github",
	styles: {
		keyword: Style.parse("#d73a49 bold"),
		built_in: Style.parse("#005cc5"),
		type: Style.parse("#005cc5"),
		literal: Style.parse("#005cc5"),
		number: Style.parse("#005cc5"),
		string: Style.parse("#032f62"),
		regexp: Style.parse("#032f62"),
		comment: Style.parse("#6a737d dim"),
		function: Style.parse("#6f42c1"),
		title: Style.parse("#6f42c1"),
		"title.function": Style.parse("#6f42c1"),
		"title.class": Style.parse("#6f42c1 bold"),
		params: Style.parse("#24292e"),
		variable: Style.parse("#24292e"),
		property: Style.parse("#005cc5"),
		attr: Style.parse("#6f42c1"),
		operator: Style.parse("#d73a49"),
		tag: Style.parse("#22863a"),
	},
};

// One Dark theme (Atom)
export const ONE_DARK: SyntaxTheme = {
	name: "one-dark",
	background: "#282c34",
	styles: {
		keyword: Style.parse("#c678dd bold"),
		built_in: Style.parse("#e5c07b"),
		type: Style.parse("#e5c07b italic"),
		literal: Style.parse("#d19a66"),
		number: Style.parse("#d19a66"),
		string: Style.parse("#98c379"),
		regexp: Style.parse("#98c379"),
		comment: Style.parse("#5c6370 dim"),
		function: Style.parse("#61afef"),
		title: Style.parse("#61afef"),
		"title.function": Style.parse("#61afef"),
		"title.class": Style.parse("#e5c07b bold"),
		params: Style.parse("#abb2bf italic"),
		variable: Style.parse("#e06c75"),
		property: Style.parse("#e06c75"),
		attr: Style.parse("#d19a66"),
		operator: Style.parse("#56b6c2"),
		tag: Style.parse("#e06c75"),
	},
};

// Theme registry
export const SYNTAX_THEMES: Record<string, SyntaxTheme> = {
	monokai: MONOKAI,
	dracula: DRACULA,
	github: GITHUB_LIGHT,
	"github-light": GITHUB_LIGHT,
	"one-dark": ONE_DARK,
	atom: ONE_DARK,
};

export function getTheme(name: string): SyntaxTheme {
	return SYNTAX_THEMES[name] ?? MONOKAI;
}

// Legacy export for backwards compatibility
export const MONOKAI_THEME = {
	keyword: Style.parse("bold magenta"),
	string: Style.parse("yellow"),
	number: Style.parse("magenta"),
	comment: Style.parse("dim white"),
	operator: Style.parse("bold white"),
	function: Style.parse("green"),
	class: Style.parse("bold blue"),
	title: Style.parse("bold white"),
};
