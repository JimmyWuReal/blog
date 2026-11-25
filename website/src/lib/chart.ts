// Draws a UI kit bar or line chart of daily values as SVG, for /views (its styles are in
// pages/views.astro). Pointing at a day, or the arrow keys, show its value in a tooltip.
import { axisTicks, dayLabel } from './daily';

/** `value` is null on a day with nothing recorded; those all come before the first value. */
type Datum = { day: string; value: number | null };

const HEIGHT = 200;
const TOP = 10;
const BOTTOM = 26;
// Half of the last day's label, which is centered under its day.
const RIGHT = 16;

const format = (n: number) => n.toLocaleString('en-US');
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function svg<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number>, text = '') {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
  el.textContent = text;
  return el;
}

/** A smooth curve through every point that never overshoots them (a monotone cubic). */
function smoothPath(points: [number, number][]) {
  const n = points.length;
  const secants = points.slice(1).map(([x, y], i) => (y - points[i][1]) / (x - points[i][0]));
  const tangents = points.map((_, i) => {
    if (i === 0) return secants[0];
    if (i === n - 1) return secants[n - 2];
    const [a, b] = [secants[i - 1], secants[i]];
    return a * b <= 0 ? 0 : Math.sign(a) * Math.min(Math.abs(a), Math.abs(b), Math.abs(a + b) / 4) * 2;
  });
  return points.reduce((path, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = points[i - 1];
    const h = (x - px) / 3;
    return `${path}C${px + h},${py + tangents[i - 1] * h} ${x - h},${y - tangents[i] * h} ${x},${y}`;
  }, '');
}

/** Fills `plot` with a chart of `data`, which needs at least one value, and keeps it sized to fit. */
export function drawChart(plot: HTMLElement, data: Datum[], kind: 'bar' | 'line') {
  const first = data.findIndex(({ value }) => value !== null);
  const last = data.length - 1;
  const values = data.slice(first).map(({ value }) => value!);
  // Bars start at zero. The line's axis fits its data, so it still rises on a large total.
  const ticks = axisTicks(kind === 'bar' ? 0 : Math.min(...values), Math.max(...values));
  const [min, max] = [ticks[0], ticks.at(-1)!];
  // Room for the widest tick label: 6px a digit, plus a gap.
  const left = Math.max(...ticks.map((tick) => format(tick).length)) * 6 + 10;

  const tip = document.createElement('div');
  tip.className = `chart-tip is-${kind}`;
  const [tipDay, tipValue] = [document.createElement('span'), document.createElement('b')];
  tip.append(tipDay, tipValue);

  // A slider, so that a screen reader reads out each day's value as the arrow keys move.
  plot.tabIndex = 0;
  plot.setAttribute('role', 'slider');
  plot.setAttribute('aria-valuemin', String(first));
  plot.setAttribute('aria-valuemax', String(last));

  let index = last; // The day last shown
  let shown = false; // Whether it's shown now
  let step = 0; // The width of a day
  let bars: SVGElement[] = [];
  let cross: SVGElement | undefined;
  let dot: SVGElement | undefined;

  const x = (i: number) => left + (i + 0.5) * step;
  const y = (value: number) => TOP + (1 - (value - min) / (max - min)) * (HEIGHT - TOP - BOTTOM);

  function draw(width: number) {
    step = (width - left - RIGHT) / data.length;
    const root = svg('svg', { width, height: HEIGHT, 'aria-hidden': 'true' });
    if (!plot.querySelector('svg')) root.classList.add('is-entering');

    for (const tick of ticks) {
      root.append(
        svg('line', { class: 'chart-grid', x1: left, x2: width - RIGHT, y1: y(tick), y2: y(tick) }),
        svg('text', { class: 'chart-axis', x: 0, y: y(tick), dy: '.32em' }, format(tick)),
      );
    }
    // One label a week, counting back from today.
    data.forEach(({ day }, i) => {
      if ((last - i) % 7 === 0) root.append(svg('text', { class: 'chart-axis', x: x(i), y: HEIGHT - 4, 'text-anchor': 'middle' }, dayLabel(day)));
    });

    if (kind === 'bar') {
      const w = Math.max(1, Math.min(step - 2, 26));
      bars = data.map(({ value }, i) => {
        const [l, base] = [x(i) - w / 2, y(0)];
        const h = value ? Math.max(2, base - y(value)) : 0;
        const r = Math.min(4, w / 2, h);
        const bar = svg('path', {
          class: `chart-bar${i === last ? ' is-today' : ''}`,
          style: `--delay: ${i * 20}ms`,
          d: h ? `M${l},${base}v${r - h}q0,${-r} ${r},${-r}h${w - 2 * r}q${r},0 ${r},${r}v${h - r}z` : '',
        });
        root.append(bar);
        return bar;
      });
    } else {
      cross = svg('line', { class: 'chart-cross', y1: TOP, y2: HEIGHT - BOTTOM });
      dot = svg('circle', { class: 'chart-end', r: 4 });
      root.append(cross);
      if (values.length > 1) {
        root.append(svg('path', { class: 'chart-line', pathLength: 1, d: smoothPath(values.map((value, i) => [x(first + i), y(value)])) }));
      }
      root.append(dot);
    }
    plot.replaceChildren(root, tip);
    update();
  }

  /** Shows `index`'s day, or the chart at rest. */
  function update() {
    const { day, value } = data[index];
    const text = `${format(value!)} ${value === 1 ? 'view' : 'views'}`;
    plot.setAttribute('aria-valuenow', String(index));
    plot.setAttribute('aria-valuetext', `${dayLabel(day)}, ${text}`);

    bars.forEach((bar, i) => bar.classList.toggle('is-active', shown && i === index));
    cross?.classList.toggle('is-active', shown);
    cross?.setAttribute('x1', String(x(index)));
    cross?.setAttribute('x2', String(x(index)));
    const at = shown ? index : last; // At rest the dot marks today
    dot?.setAttribute('cx', String(x(at)));
    dot?.setAttribute('cy', String(y(data[at].value!)));

    tip.classList.toggle('is-active', shown);
    if (!shown) return; // The tooltip fades out where it was
    tipDay.textContent = dayLabel(day);
    tipValue.textContent = text;
    // Beside the day, on the side with more room.
    const before = index >= data.length / 2;
    tip.style.top = `${TOP}px`;
    tip.style.left = `${x(index) + (before ? -12 : 12)}px`;
    tip.style.transform = before ? 'translateX(-100%)' : '';
  }

  function show(i: number) {
    index = clamp(i, first, last);
    shown = true;
    update();
  }
  function hide() {
    shown = false;
    index = last;
    update();
  }

  const point = (event: PointerEvent) => show(Math.floor((event.clientX - plot.getBoundingClientRect().left - left) / step));
  plot.addEventListener('pointermove', point);
  plot.addEventListener('pointerdown', point);
  // After a tap the value stays until the reader taps elsewhere (the chart loses focus).
  plot.addEventListener('pointerleave', (event) => event.pointerType !== 'touch' && hide());
  plot.addEventListener('blur', hide);
  plot.addEventListener('focus', () => plot.matches(':focus-visible') && show(index));
  plot.addEventListener('keydown', (event) => {
    const to = { ArrowLeft: index - 1, ArrowDown: index - 1, ArrowRight: index + 1, ArrowUp: index + 1, Home: first, End: last }[event.key];
    if (to !== undefined) show(to);
    else if (event.key === 'Escape') hide();
    else return;
    event.preventDefault();
  });

  new ResizeObserver(([entry]) => {
    if (entry.contentRect.width > 0) draw(entry.contentRect.width);
  }).observe(plot);
}
