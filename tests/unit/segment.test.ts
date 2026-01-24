import { describe, it, expect, beforeAll } from 'vitest';
import { Segment } from '../../src/core/segment';
import { Style } from '../../src/core/style';
import chalk from 'chalk';

describe('Segment', () => {
  beforeAll(() => {
    chalk.level = 3; // Force truecolor support for tests
  });

  it('should calculate cell length', () => {
    const segment = new Segment('Hello');
    expect(segment.cellLength()).toBe(5);
  });

  it('should calculate cell length for emoji', () => {
    const segment = new Segment('👋');
    expect(segment.cellLength()).toBe(2);
  });

  it('should render styled text', () => {
    const style = new Style({ color: 'red' });
    const segment = new Segment('Error', style);
    // We expect ANSI codes, but checking exact string might be brittle across envs
    // Just check it's not plain 'Error'
    expect(segment.render()).not.toBe('Error');
    expect(segment.render()).toContain('Error');
  });
});
