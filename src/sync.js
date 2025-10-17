import simpleGit from 'simple-git';
import path from 'path';

export class SyncEngine {
  constructor(projectRoot, agentId) {
    this.projectRoot = projectRoot;
    this.agentId = agentId;
    this.git = simpleGit(projectRoot);
  }

  async initialize() {
    try {
      // Check if git repo exists
      const isRepo = await this.git.checkIsRepo();

      if (!isRepo) {
        console.log('Initializing git repository...');
        await this.git.init();
        await this.git.add('.');
        await this.git.commit('Initial commit by ' + this.agentId);
      }
    } catch (error) {
      console.error('Error initializing git:', error.message);
    }
  }

  async pull() {
    try {
      console.log('Pulling latest changes...');
      await this.git.fetch();

      const status = await this.git.status();

      if (status.behind > 0) {
        try {
          await this.git.pull();
          console.log(`Pulled ${status.behind} commits`);
          return { success: true, commits: status.behind };
        } catch (error) {
          if (error.message.includes('CONFLICT')) {
            console.log('Merge conflict detected, attempting auto-resolution...');

            // Auto-resolve conflicts in .sync-state.json by using remote version
            try {
              await this.git.checkout(['--theirs', '.sync-state.json']);
              await this.git.add('.sync-state.json');
              await this.git.commit('Resolved state file conflict (using remote)');
              console.log('Auto-resolved state file conflict');
              return { success: true, commits: status.behind, conflictResolved: true };
            } catch (resolveError) {
              console.error('Failed to auto-resolve conflict:', resolveError.message);
              return { success: false, error: 'conflict', message: error.message };
            }
          }
          throw error;
        }
      } else {
        console.log('Already up to date');
        return { success: true, commits: 0 };
      }
    } catch (error) {
      console.error('Error pulling changes:', error.message);
      return { success: false, error: error.message };
    }
  }

  async push(message) {
    try {
      // Pull first to avoid conflicts
      const pullResult = await this.pull();
      if (!pullResult.success && pullResult.error === 'conflict') {
        console.error('Cannot push: unresolved conflicts');
        return { success: false, error: 'conflict' };
      }

      // Stage all changes
      await this.git.add('.');

      // Check if there are changes to commit
      const status = await this.git.status();

      if (status.files.length === 0) {
        console.log('No changes to commit');
        return { success: true, committed: false };
      }

      // Commit changes
      const commitMessage = `[${this.agentId}] ${message}`;
      await this.git.commit(commitMessage);

      console.log(`Committed: ${commitMessage}`);

      // Push to remote with retry
      let retries = 3;
      while (retries > 0) {
        try {
          await this.git.push();
          console.log('Pushed to remote');
          return { success: true, committed: true, message: commitMessage };
        } catch (error) {
          if (error.message.includes('no upstream')) {
            console.warn('No remote configured, skipping push');
            return { success: true, committed: true, message: commitMessage, pushed: false };
          }

          if (error.message.includes('rejected') && retries > 1) {
            // Remote has new commits, pull and retry
            console.log('Push rejected, pulling and retrying...');
            await this.pull();
            retries--;
            continue;
          }

          throw error;
        }
      }

      return { success: false, error: 'Failed to push after retries' };
    } catch (error) {
      console.error('Error pushing changes:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sync(commitMessage = 'Auto-sync') {
    // Pull first
    const pullResult = await this.pull();

    if (!pullResult.success) {
      return pullResult;
    }

    // Then push
    const pushResult = await this.push(commitMessage);

    return {
      success: pullResult.success && pushResult.success,
      pulled: pullResult.commits,
      pushed: pushResult.committed
    };
  }

  async getStatus() {
    try {
      const status = await this.git.status();
      return {
        current: status.current,
        tracking: status.tracking,
        ahead: status.ahead,
        behind: status.behind,
        modified: status.modified.length,
        created: status.created.length,
        deleted: status.deleted.length,
        conflicted: status.conflicted.length
      };
    } catch (error) {
      console.error('Error getting status:', error.message);
      return null;
    }
  }

  async getRecentCommits(count = 10) {
    try {
      const log = await this.git.log({ maxCount: count });
      return log.all.map(commit => ({
        hash: commit.hash.substring(0, 7),
        message: commit.message,
        author: commit.author_name,
        date: commit.date
      }));
    } catch (error) {
      console.error('Error getting commits:', error.message);
      return [];
    }
  }
}
