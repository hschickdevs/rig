// Helpers for drag-drop of files (typically images) into a terminal pane.
// Kept pure so it can be unit tested without Electron or xterm.

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif|tiff?|ico)$/i;

export interface DroppedFileLike {
  name: string;
  type: string;
}

export function isImageFile(file: DroppedFileLike): boolean {
  if (file.type && file.type.startsWith('image/')) return true;
  return IMAGE_EXT_RE.test(file.name);
}

// Backslash-escape any character that isn't a "safe" path char. Matches the
// format Terminal.app / iTerm2 / Warp insert when a file is dragged onto the
// terminal (e.g. `/Users/me/My\ Pictures/shot.png`).
//
// CLI agents like Claude Code detect this form and render it as `[Image #N]`
// inline. Single-quoted paths (`'…'`) work at a shell prompt but are *not*
// recognized by Claude Code's path detector — so we match the native drop
// format instead of shell-quoting.
export function shellEscapePath(p: string): string {
  return p.replace(/([^A-Za-z0-9._/\-+=,@:])/g, '\\$1');
}

export function buildDroppedPathsInput(paths: string[]): string {
  return paths
    .filter((p) => p.length > 0)
    .map(shellEscapePath)
    .join(' ');
}
