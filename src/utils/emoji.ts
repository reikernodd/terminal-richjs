/**
 * Emoji codes database - common emoji shortcodes
 * Subset of Python Rich's emoji database for practical use
 */
export const EMOJI: Record<string, string> = {
	// Common emojis
	rocket: "🚀",
	star: "⭐",
	sparkles: "✨",
	fire: "🔥",
	heart: "❤️",
	thumbs_up: "👍",
	thumbs_down: "👎",
	clap: "👏",
	wave: "👋",
	ok_hand: "👌",

	// Faces
	smile: "😊",
	grin: "😁",
	joy: "😂",
	wink: "😉",
	thinking: "🤔",
	sunglasses: "😎",
	heart_eyes: "😍",
	sob: "😭",
	angry: "😠",
	scream: "😱",
	skull: "💀",
	ghost: "👻",
	robot: "🤖",

	// Status
	check: "✅",
	check_mark: "✔️",
	x: "❌",
	cross_mark: "❌",
	warning: "⚠️",
	exclamation: "❗",
	question: "❓",
	info: "ℹ️",
	bulb: "💡",
	gear: "⚙️",
	wrench: "🔧",
	hammer: "🔨",
	bug: "🐛",
	construction: "🚧",

	// Weather & Nature
	sun: "☀️",
	moon: "🌙",
	cloud: "☁️",
	rain: "🌧️",
	snow: "❄️",
	thunder: "⚡",
	rainbow: "🌈",
	tree: "🌳",
	flower: "🌸",
	leaf: "🍃",

	// Objects
	book: "📖",
	books: "📚",
	pencil: "✏️",
	pen: "🖊️",
	clipboard: "📋",
	folder: "📁",
	file_folder: "📁",
	package: "📦",
	inbox: "📥",
	outbox: "📤",
	email: "📧",
	computer: "💻",
	keyboard: "⌨️",
	phone: "📱",
	camera: "📷",
	video_camera: "📹",
	clock: "🕐",
	hourglass: "⏳",
	key: "🔑",
	lock: "🔒",
	unlock: "🔓",
	link: "🔗",
	trophy: "🏆",
	medal: "🏅",
	crown: "👑",
	gem: "💎",
	money: "💰",
	coin: "🪙",

	// Arrows & Symbols
	arrow_right: "➡️",
	arrow_left: "⬅️",
	arrow_up: "⬆️",
	arrow_down: "⬇️",
	arrow_forward: "▶️",
	arrow_backward: "◀️",
	play: "▶️",
	pause: "⏸️",
	stop: "⏹️",
	refresh: "🔄",
	plus: "➕",
	minus: "➖",

	// Animals
	dog: "🐕",
	cat: "🐈",
	bird: "🐦",
	fish: "🐟",
	butterfly: "🦋",
	bee: "🐝",
	snake: "🐍",
	turtle: "🐢",
	crab: "🦀",
	octopus: "🐙",
	unicorn: "🦄",
	dragon: "🐉",

	// Food & Drink
	coffee: "☕",
	tea: "🍵",
	beer: "🍺",
	wine: "🍷",
	pizza: "🍕",
	burger: "🍔",
	fries: "🍟",
	taco: "🌮",
	sushi: "🍣",
	apple: "🍎",
	banana: "🍌",
	cake: "🎂",
	cookie: "🍪",

	// Celebrations
	party: "🎉",
	balloon: "🎈",
	confetti: "🎊",
	gift: "🎁",
	christmas_tree: "🎄",
	fireworks: "🎆",

	// Hands
	point_up: "☝️",
	point_down: "👇",
	point_left: "👈",
	point_right: "👉",
	raised_hand: "✋",
	fist: "✊",
	v: "✌️",
	muscle: "💪",
	pray: "🙏",

	// Transport
	car: "🚗",
	bus: "🚌",
	train: "🚆",
	plane: "✈️",
	ship: "🚢",
	bike: "🚲",

	// Places
	house: "🏠",
	office: "🏢",
	hospital: "🏥",
	school: "🏫",
	globe: "🌍",
	earth: "🌍",
	earth_americas: "🌎",
	earth_asia: "🌏",

	// Colors
	red_circle: "🔴",
	orange_circle: "🟠",
	yellow_circle: "🟡",
	green_circle: "🟢",
	blue_circle: "🔵",
	purple_circle: "🟣",
	white_circle: "⚪",
	black_circle: "⚫",

	// Misc
	zap: "⚡",
	boom: "💥",
	hundred: "💯",
	zzz: "💤",
	speech_balloon: "💬",
	thought_balloon: "💭",
	mega: "📣",
	bell: "🔔",
	pin: "📌",
	scissors: "✂️",
	art: "🎨",
	music: "🎵",
	notes: "🎶",
	mic: "🎤",
	headphones: "🎧",
	game: "🎮",
	dice: "🎲",

	// Programming
	terminal: "💻",
	code: "💻",
	database: "🗄️",
	api: "🔌",
	test_tube: "🧪",
	microscope: "🔬",
	satellite: "🛰️",
	atom: "⚛️",
};

/**
 * Replace emoji shortcodes in text with actual emoji characters.
 * Shortcodes are in the format :emoji_name:
 */
export function replaceEmoji(text: string): string {
	return text.replace(/:([a-z0-9_]+):/gi, (match, name) => {
		const emoji = EMOJI[name.toLowerCase()];
		return emoji ?? match; // Return original if not found
	});
}

/**
 * Get all available emoji names
 */
export function listEmoji(): string[] {
	return Object.keys(EMOJI);
}

/**
 * Check if an emoji shortcode exists
 */
export function hasEmoji(name: string): boolean {
	return name.toLowerCase() in EMOJI;
}
