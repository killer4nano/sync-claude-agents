import fs from 'fs/promises';
import path from 'path';

export class LockManager {
  constructor(projectRoot, agentId, syncEngine) {
    this.projectRoot = projectRoot;
    this.agentId = agentId;
    this.syncEngine = syncEngine;
    this.locksDir = path.join(projectRoot, '.sync-locks');
  }

  async initialize() {
    // Create locks directory if it doesn't exist
    try {
      await fs.mkdir(this.locksDir, { recursive: true });
    } catch (error) {
      // Directory already exists, that's fine
    }
  }

  getLockPath(filePath) {
    const normalized = path.normalize(filePath).replace(/[/\\:]/g, '_');
    return path.join(this.locksDir, `${normalized}.lock`);
  }

  async acquireLock(filePath, timeout = 30000) {
    const lockPath = this.getLockPath(filePath);
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      // Pull latest lock state from git
      if (this.syncEngine) {
        await this.syncEngine.pull();
      }

      try {
        // Check if lock already exists
        try {
          const lockData = await fs.readFile(lockPath, 'utf-8');
          const lock = JSON.parse(lockData);
          const lockAge = Date.now() - new Date(lock.acquiredAt).getTime();

          // If lock is older than 5 minutes, consider it stale
          if (lockAge > 5 * 60 * 1000) {
            await fs.unlink(lockPath);
          } else if (lock.agentId === this.agentId) {
            // We already own this lock
            return true;
          } else {
            // Lock owned by another agent, wait and retry
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
        } catch (error) {
          // Lock doesn't exist or is corrupted, proceed to create
        }

        // Create lock file
        await fs.writeFile(lockPath, JSON.stringify({
          agentId: this.agentId,
          file: filePath,
          acquiredAt: new Date().toISOString()
        }));

        // Commit and push lock to git
        if (this.syncEngine) {
          await this.syncEngine.push(`Acquired lock for ${filePath}`);
        }

        // Verify we still own the lock after sync
        await new Promise(resolve => setTimeout(resolve, 500));
        if (this.syncEngine) {
          await this.syncEngine.pull();
        }

        try {
          const lockData = await fs.readFile(lockPath, 'utf-8');
          const lock = JSON.parse(lockData);

          if (lock.agentId === this.agentId) {
            return true;
          } else {
            // Another agent grabbed it, retry
            continue;
          }
        } catch {
          // Lock disappeared, retry
          continue;
        }
      } catch (error) {
        console.error('Error acquiring lock:', error.message);
        await new Promise(resolve => setTimeout(resolve, 1000));
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

        // Commit and push lock release to git
        if (this.syncEngine) {
          await this.syncEngine.push(`Released lock for ${filePath}`);
        }

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
