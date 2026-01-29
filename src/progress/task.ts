export interface Task {
	id: number;
	description: string;
	total: number;
	completed: number;
	visible: boolean;
	finished: boolean;
	startTime: number | null;
	endTime: number | null;
}
