import { inspect, RichHandler } from "../src";

const handler = new RichHandler();

// 1. Simulate logging
console.log("--- Logging Demo ---");
handler.handle({
	level: "info",
	message: "Application started",
	timestamp: new Date(),
	context: { env: "production" },
});

handler.handle({
	level: "warn",
	message: "Cache miss detected",
	timestamp: new Date(),
});

handler.handle({
	level: "error",
	message: "Database connection failed",
	timestamp: new Date(),
	context: { db: "mongo", timeout: 5000 },
});

// 2. Simulate Inspection
console.log("\n--- Inspect Demo ---");

class User {
	constructor(
		public name: string,
		public role: string,
		public active: boolean,
	) {}
}

const user = new User("Alice", "Admin", true);
inspect(user);
