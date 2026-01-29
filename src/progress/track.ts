import { Progress } from "./progress";

/**
 * Track progress of an iterable.
 */
export function* track<T>(
	sequence: Iterable<T> | T[],
	description: string = "Working...",
): Generator<T> {
	const progress = new Progress();
	const arr = Array.isArray(sequence) ? sequence : Array.from(sequence);
	const total = arr.length;

	progress.start();
	const taskId = progress.addTask(description, { total });

	try {
		for (let i = 0; i < total; i++) {
			yield arr[i];
			progress.update(taskId, { completed: i + 1 });
		}
	} finally {
		progress.stop();
	}
}
