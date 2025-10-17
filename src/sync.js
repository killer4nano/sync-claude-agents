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
            console.error('Merge conflict detected');
            return { success: false, error: 'conflict', message: error.message };
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

      // Push to remote
      try {
        await this.git.push();
        console.log('Pushed to remote');
        return { success: true, committed: true, message: commitMessage };
      } catch (error) {
        if (error.message.includes('no upstream')) {
          console.warn('No remote configured, skipping push');
          return { success: true, committed: true, message: commitMessage, pushed: false };
        }
        throw error;
      }
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
