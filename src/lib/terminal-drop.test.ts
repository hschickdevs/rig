import { describe, expect, it } from 'vitest';
import { buildDroppedPathsInput, isImageFile, shellEscapePath } from './terminal-drop';

describe('isImageFile', () => {
  it('matches by MIME type', () => {
    expect(isImageFile({ name: 'whatever', type: 'image/png' })).toBe(true);
    expect(isImageFile({ name: 'whatever', type: 'image/jpeg' })).toBe(true);
    expect(isImageFile({ name: 'whatever', type: 'image/svg+xml' })).toBe(true);
  });

  it('falls back to file extension when MIME is missing', () => {
    expect(isImageFile({ name: 'shot.PNG', type: '' })).toBe(true);
    expect(isImageFile({ name: 'pic.jpeg', type: '' })).toBe(true);
    expect(isImageFile({ name: 'logo.svg', type: '' })).toBe(true);
    expect(isImageFile({ name: 'photo.HEIC', type: '' })).toBe(true);
  });

  it('rejects non-image files', () => {
    expect(isImageFile({ name: 'notes.txt', type: 'text/plain' })).toBe(false);
    expect(isImageFile({ name: 'archive.zip', type: 'application/zip' })).toBe(false);
    expect(isImageFile({ name: 'README', type: '' })).toBe(false);
  });
});

describe('shellEscapePath', () => {
  it('leaves safe paths untouched', () => {
    expect(shellEscapePath('/tmp/foo.png')).toBe('/tmp/foo.png');
    expect(shellEscapePath('/Users/me/Downloads/shot-01.jpg')).toBe(
      '/Users/me/Downloads/shot-01.jpg',
    );
  });

  it('backslash-escapes spaces (matches iTerm/Terminal drag format)', () => {
    expect(shellEscapePath('/Users/me/My Pictures/shot.png')).toBe(
      '/Users/me/My\\ Pictures/shot.png',
    );
  });

  it('escapes apostrophes, parens, and other shell metacharacters', () => {
    expect(shellEscapePath(`/tmp/it's (final).png`)).toBe(`/tmp/it\\'s\\ \\(final\\).png`);
  });
});

describe('buildDroppedPathsInput', () => {
  it('joins multiple paths with spaces', () => {
    expect(buildDroppedPathsInput(['/a/b.png', '/c/d.jpg'])).toBe('/a/b.png /c/d.jpg');
  });

  it('drops empty paths', () => {
    expect(buildDroppedPathsInput(['/a.png', '', '/b.png'])).toBe('/a.png /b.png');
  });

  it('escapes spaces in paths while joining', () => {
    expect(buildDroppedPathsInput(['/My Dir/a.png', '/b.png'])).toBe('/My\\ Dir/a.png /b.png');
  });

  it('returns empty string for no paths', () => {
    expect(buildDroppedPathsInput([])).toBe('');
  });
});
