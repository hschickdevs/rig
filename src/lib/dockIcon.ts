import { invoke } from './ipc';
import { IPC } from '../../electron/ipc/channels';
import type { LookPreset } from './look';

interface IconPalette {
  fg: string;
  gradTop: string;
  gradBottom: string;
}

const PALETTE: Record<LookPreset, IconPalette> = {
  graphite: { fg: '#d7e4f0', gradTop: '#0ea5e9', gradBottom: '#a7ecff' },
  midnight: { fg: '#d7e4f0', gradTop: '#0ea5e9', gradBottom: '#a7ecff' },
  classic: { fg: '#cccdd2', gradTop: '#3a5bff', gradBottom: '#b8c5ff' },
  indigo: { fg: '#deddff', gradTop: '#5a58e6', gradBottom: '#d4d3ff' },
  ember: { fg: '#f2ddd1', gradTop: '#e05a15', gradBottom: '#ffd28a' },
  glacier: { fg: '#e5eff5', gradTop: '#1fb5a5', gradBottom: '#b8f5ee' },
  minimal: { fg: '#ececec', gradTop: '#a89d7c', gradBottom: '#ece4cc' },
  zenburnesque: { fg: '#dcdccc', gradTop: '#a86e6e', gradBottom: '#ebc7c7' },
};

const ICON_BG = '#0a0e1a';
const ICON_SIZE = 1024;

function buildIconSvg(look: LookPreset): string {
  const c = PALETTE[look];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="4" x2="0" y2="52"><stop offset="0%" stop-color="${c.gradTop}"/><stop offset="100%" stop-color="${c.gradBottom}"/></linearGradient></defs><rect width="${ICON_SIZE}" height="${ICON_SIZE}" rx="200" fill="${ICON_BG}"/><g transform="translate(204, 120) scale(14)"><rect x="4" y="4" width="8" height="15" fill="${c.fg}"/><rect x="4" y="21" width="8" height="14" fill="${c.fg}"/><rect x="4" y="37" width="8" height="15" fill="${c.fg}"/><rect x="18" y="4" width="8" height="15" fill="url(#g)"/><rect x="18" y="21" width="8" height="14" fill="url(#g)"/><rect x="18" y="37" width="8" height="15" fill="url(#g)"/><rect x="32" y="4" width="8" height="15" fill="${c.fg}"/><rect x="32" y="21" width="8" height="14" fill="${c.fg}"/><rect x="32" y="37" width="8" height="15" fill="${c.fg}"/></g></svg>`;
}

async function rasterizeIcon(look: LookPreset): Promise<string> {
  const svg = buildIconSvg(look);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load SVG'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = ICON_SIZE;
    canvas.height = ICON_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    ctx.drawImage(img, 0, 0, ICON_SIZE, ICON_SIZE);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function updateDockIcon(look: LookPreset): Promise<void> {
  const dataUrl = await rasterizeIcon(look);
  await invoke(IPC.SetDockIcon, { dataUrl });
}
