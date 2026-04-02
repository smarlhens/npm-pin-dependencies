import { file as findFile } from 'empathic/find';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('find-up behavior (non-regression)', () => {
  describe('pathExists (existsSync)', () => {
    it('should return true for existing file', () => {
      const result = existsSync(join(__dirname, '..', 'package.json'));
      expect(result).toEqual(true);
    });

    it('should return false for non-existing file', () => {
      const result = existsSync(join(__dirname, '..', 'non-existing-file.json'));
      expect(result).toEqual(false);
    });
  });

  describe('findFile (empathic)', () => {
    it('should find lock file in current directory', () => {
      const result = findFile('package-lock.json', { cwd: join(__dirname, '..') });
      expect(result).toBeDefined();
      expect(result!.endsWith('package-lock.json')).toEqual(true);
    });

    it('should find lock file in parent directory (walk-up)', () => {
      const result = findFile('package-lock.json', {
        cwd: join(__dirname, '..', 'examples', 'workspace', 'foo'),
      });
      expect(result).toBeDefined();
      expect(result).toContain('package-lock.json');
      expect(result).toContain('workspace');
    });

    it('should return undefined for non-existing files', () => {
      const result = findFile('non-existing-lock.json');
      expect(result).toBeUndefined();
    });

    it('should find each requested file individually', () => {
      const cwd = join(__dirname, '..');
      const packageJson = findFile('package.json', { cwd });
      const packageLock = findFile('package-lock.json', { cwd });
      expect(packageJson).toBeDefined();
      expect(packageLock).toBeDefined();
      expect(packageJson!.endsWith('package.json')).toEqual(true);
      expect(packageLock!.endsWith('package-lock.json')).toEqual(true);
    });

    it('should return closest match when searching from subdirectory', () => {
      const result = findFile('package-lock.json', {
        cwd: join(__dirname, '..', 'examples', 'workspace', 'foo'),
      });
      expect(result).toMatch(/workspace[/\\]package-lock\.json$/);
    });
  });
});
