import { Show, For } from 'solid-js';

interface RigLogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkSize?: number;
  gap?: number;
}

const PIPE_SEGMENTS: Array<[number, number]> = [
  [4, 15],
  [21, 14],
  [37, 15],
];
const PIPE_X = [4, 18, 32];
const CENTER_PIPE_INDEX = 1;

export function RigLogo(props: RigLogoProps) {
  const size = () => props.size ?? 24;
  const wordmarkSize = () => props.wordmarkSize ?? 15;
  const gap = () => props.gap ?? 8;
  const width = () => Math.round((44 / 56) * size());

  return (
    <div style={{ display: 'flex', 'align-items': 'center', gap: `${gap()}px` }}>
      <svg
        width={width()}
        height={size()}
        viewBox="0 0 44 56"
        style={{ 'flex-shrink': '0', display: 'block' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="rig-logo-gradient"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="4"
            x2="0"
            y2="52"
          >
            <stop offset="0%" stop-color="var(--logo-gradient-top)" />
            <stop offset="100%" stop-color="var(--logo-gradient-bottom)" />
          </linearGradient>
        </defs>
        <For each={PIPE_X}>
          {(x, i) => (
            <For each={PIPE_SEGMENTS}>
              {([y, h]) => (
                <rect
                  x={x}
                  y={y}
                  width={8}
                  height={h}
                  fill={i() === CENTER_PIPE_INDEX ? 'url(#rig-logo-gradient)' : 'var(--fg)'}
                />
              )}
            </For>
          )}
        </For>
      </svg>
      <Show when={props.showWordmark ?? true}>
        <span
          style={{
            'font-size': `${wordmarkSize()}px`,
            'font-weight': '500',
            color: 'var(--fg)',
            'font-family': "'JetBrains Mono', ui-monospace, Menlo, monospace",
            'letter-spacing': '0',
            display: 'inline-flex',
            'align-items': 'baseline',
            gap: '1px',
          }}
        >
          Rig
          <span
            class="rig-logo-cursor"
            style={{
              'font-weight': '600',
              color: 'var(--logo-gradient-top)',
            }}
          >
            _
          </span>
        </span>
      </Show>
    </div>
  );
}
