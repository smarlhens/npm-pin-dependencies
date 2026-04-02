import { findUpMultiple, pathExists } from 'find-up';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('find-up behavior (non-regression)', () => {
  describe('pathExists', () => {
    it('should return true for existing file', async () => {
      const result = await pathExists(join(__dirname, '..', 'package.json'));
      expect(result).toEqual(true);
    });

    it('should return false for non-existing file', async () => {
      const result = await pathExists(join(__dirname, '..', 'non-existing-file.json'));
      expect(result).toEqual(false);
    });

    it('should match existsSync behavior', async () => {
      const files = ['package.json', 'package-lock.json', 'non-existing.json'];
      for (const file of files) {
        const fullPath = join(__dirname, '..', file);
        const pathExistsResult = await pathExists(fullPath);
        const existsSyncResult = existsSync(fullPath);
        expect(pathExistsResult).toEqual(existsSyncResult);
      }
    });
  });

  describe('findUpMultiple', () => {
    it('should find lock file in current directory', async () => {
      const results = await findUpMultiple(['package-lock.json'], { type: 'file', cwd: join(__dirname, '..') });
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].endsWith('package-lock.json')).toEqual(true);
    });

    it('should find lock file in parent directory (walk-up)', async () => {
      const results = await findUpMultiple(['package-lock.json'], {
        type: 'file',
        cwd: join(__dirname, '..', 'examples', 'workspace', 'foo'),
      });
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0]).toContain('package-lock.json');
      expect(results[0]).toContain('workspace');
    });

    it('should return empty array for non-existing files', async () => {
      const results = await findUpMultiple(['non-existing-lock.json'], { type: 'file' });
      expect(results).toEqual([]);
    });

    it('should find each requested file individually', async () => {
      const cwd = join(__dirname, '..');
      const pkgJson = await findUpMultiple(['package.json'], { type: 'file', cwd });
      const pkgLock = await findUpMultiple(['package-lock.json'], { type: 'file', cwd });
      expect(pkgJson.length).toBeGreaterThanOrEqual(1);
      expect(pkgLock.length).toBeGreaterThanOrEqual(1);
      expect(pkgJson[0].endsWith('package.json')).toEqual(true);
      expect(pkgLock[0].endsWith('package-lock.json')).toEqual(true);
    });

    it('should return closest match first when searching from subdirectory', async () => {
      const results = await findUpMultiple(['package-lock.json'], {
        type: 'file',
        cwd: join(__dirname, '..', 'examples', 'workspace', 'foo'),
      });
      expect(results[0]).toMatch(/workspace[/\\]package-lock\.json$/);
    });
  });
});
