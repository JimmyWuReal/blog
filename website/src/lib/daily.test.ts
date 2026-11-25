import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DAYS, axisTicks, dayLabel, taipeiDay, toPoints } from './daily.ts';

test('days turn over at midnight in Taipei', () => {
  assert.equal(taipeiDay(Date.parse('2026-11-25T15:59:59Z')), '2026-11-25');
  assert.equal(taipeiDay(Date.parse('2026-11-25T16:00:00Z')), '2026-11-26');
  assert.equal(dayLabel('2026-11-25'), 'Nov 25');
});

test('fills days without views and leaves days before recording empty', () => {
  const points = toPoints(
    [
      { day: '2026-11-22', count: 3, total: 103 },
      { day: '2026-11-24', count: 2, total: 105 },
    ],
    '2026-11-25',
  );
  assert.equal(points.length, DAYS);
  assert.equal(points[0].day, '2026-10-27');
  assert.deepEqual(points.slice(-5), [
    { day: '2026-11-21', count: null, total: null },
    { day: '2026-11-22', count: 3, total: 103 },
    { day: '2026-11-23', count: 0, total: 103 },
    { day: '2026-11-24', count: 2, total: 105 },
    { day: '2026-11-25', count: 0, total: 105 },
  ]);
});

test('carries the total over from before the charts start', () => {
  const points = toPoints([{ day: '2026-01-01', count: 1, total: 50 }], '2026-11-25');
  assert.ok(points.every(({ count, total }) => count === 0 && total === 50));
});

test('ends on the newest counted day when the clock is behind', () => {
  assert.equal(toPoints([{ day: '2026-11-25', count: 1, total: 1 }], '2026-11-24').at(-1)!.day, '2026-11-25');
});

test('has nothing to show without rows', () => {
  assert.ok(toPoints([], '2026-11-25').every(({ count, total }) => count === null && total === null));
});

test('axis ticks are whole numbers around the data', () => {
  assert.deepEqual(axisTicks(0, 0), [0, 1]);
  assert.deepEqual(axisTicks(0, 2), [0, 1, 2]);
  assert.deepEqual(axisTicks(0, 27), [0, 10, 20, 30]);
  assert.deepEqual(axisTicks(1004, 1290), [1000, 1100, 1200, 1300]);
  assert.deepEqual(axisTicks(50, 50), [50, 51]);
});
