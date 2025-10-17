import fs from 'fs/promises';
import path from 'path';

export class LockManager {
  constructor(projectRoot, agentId) {
    this.projectRoot = projectRoot;
    this.agentId = agentId;
  }

  getLockPath(filePath) {
    const normalized = path.normalize(filePath).replace(/[/\\]/g, '_');
    return path.join(this.projectRoot, `.sync-lock-${normalized}`);
  }

  async acquireLock(filePath, timeout = 30000) {
    const lockPath = this.getLockPath(filePath);
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        // Try to create lock file exclusively
        await fs.writeFile(lockPath, JSON.stringify({
          agentId: this.agentId,
          file: filePath,
          acquiredAt: new Date().toISOString()
        }), { flag: 'wx' });

        return true;
      } catch (error) {
        if (error.code === 'EEXIST') {
          // Lock exists, check if it's stale
          try {
            const lockData = await fs.readFile(lockPath, 'utf-8');
            const lock = JSON.parse(lockData);
            const lockAge = Date.now() - new Date(lock.acquiredAt).getTime();

            // If lock is older than 5 minutes, consider it stale and remove it
            if (lockAge > 5 * 60 * 1000) {
              await fs.unlink(lockPath);
              continue;
            }
          } catch {
            // Lock file is corrupted, remove it
            try {
              await fs.unlink(lockPath);
            } catch {}
            continue;
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw error;
        }
      }
    }

    throw new Error(`Failed to acquire lock for ${filePath} after ${timeout}ms`);
  }

  async releaseLock(filePath) {
    const lockPath = this.getLockPath(filePath);

    try {
      const lockData = await fs.readFile(lockPath, 'utf-8');
      const lock = JSON.parse(lockData);

      // Only release if we own the lock
      if (lock.agentId === this.agentId) {
        await fs.unlink(lockPath);
        return true;
      } else {
        console.warn(`Cannot release lock for ${filePath}: owned by ${lock.agentId}`);
        return false;
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Lock doesn't exist, that's fine
        return true;
      }
      throw error;
    }
  }

  async isLocked(filePath) {
    const lockPath = this.getLockPath(filePath);

    try {
      await fs.access(lockPath);
      return true;
    } catch {
      return false;
    }
  }

  async getLockInfo(filePath) {
    const lockPath = this.getLockPath(filePath);

    try {
      const lockData = await fs.readFile(lockPath, 'utf-8');
      return JSON.parse(lockData);
    } catch {
      return null;
    }
  }

  async withLock(filePath, callback) {
    await this.acquireLock(filePath);

    try {
      const result = await callback();
      return result;
    } finally {
      await this.releaseLock(filePath);
    }
  }
}
