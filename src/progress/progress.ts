/** biome-ignore-all assist/source/organizeImports: false */
import type { Task } from './task';
import { Style } from '../core/style';

export interface ProgressOptions {
  autoRefresh?: boolean;
}

export class Progress {
  private tasks: Task[] = [];
  private taskIdCounter = 0;
  private started = false;
  private refreshInterval: ReturnType<typeof setInterval> | null = null;
  private lastRenderedLines = 0;

  addTask(description: string, options: { total?: number; completed?: number } = {}): number {
    const taskId = this.taskIdCounter++;
    this.tasks.push({
      id: taskId,
      description,
      total: options.total ?? 100,
      completed: options.completed ?? 0,
      visible: true,
      finished: false,
      startTime: Date.now(),
      endTime: null,
    });
    this.refresh();
    return taskId;
  }

  update(taskId: number, options: { completed?: number; description?: string }): void {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (options.completed !== undefined) task.completed = options.completed;
    if (options.description !== undefined) task.description = options.description;

    if (task.completed >= task.total) {
      task.finished = true;
      task.endTime = Date.now();
    }

    this.refresh();
  }

  start(): void {
    if (this.started) return;
    this.started = true;

    // Hide cursor
    process.stdout.write('\x1b[?25l');

    // Start auto-refresh
    this.refreshInterval = setInterval(() => this.refresh(), 100);
    this.refresh();
  }

  stop(): void {
    if (!this.started) return;

    // Stop refresh
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    // Show cursor
    process.stdout.write('\x1b[?25h');
    this.started = false;
  }

  private refresh(): void {
    if (!this.started) return;

    // Clear previous output
    if (this.lastRenderedLines > 0) {
      process.stdout.write(`\x1b[${this.lastRenderedLines}A`);
      for (let i = 0; i < this.lastRenderedLines; i++) {
        process.stdout.write('\x1b[2K\n');
      }
      process.stdout.write(`\x1b[${this.lastRenderedLines}A`);
    }

    // Build output
    const lines: string[] = [];
    for (const task of this.tasks.filter((t) => t.visible)) {
      const percent = Math.floor((task.completed / task.total) * 100);
      const barStr = this.renderSimpleBar(task.completed, task.total, 30);
      const percentStyle = percent >= 100 ? Style.parse('#50fa7b bold') : Style.parse('#61afef');
      lines.push(`${task.description.padEnd(20)} ${barStr} ${percentStyle.apply(`${percent}%`)}`);
    }

    const output = lines.join('\n') + '\n';
    this.lastRenderedLines = lines.length;
    process.stdout.write(output);
  }

  private renderSimpleBar(completed: number, total: number, width: number): string {
    const percentage = Math.min(1, Math.max(0, completed / total));
    const filledWidth = Math.floor(width * percentage);
    const remainingWidth = width - filledWidth;

    const filledStyle = percentage >= 1 ? Style.parse('#50fa7b bold') : Style.parse('#61afef');
    const remainingStyle = Style.parse('#3a3a3a dim');

    const filled = filledStyle.apply('━'.repeat(filledWidth));
    const remaining = remainingStyle.apply('━'.repeat(remainingWidth));

    return filled + remaining;
  }
}
