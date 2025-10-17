export class TaskQueue {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }

  async addTask(description, metadata = {}) {
    return await this.stateManager.addTask({
      description,
      ...metadata
    });
  }

  async getNextTask() {
    // Try up to 3 times to get a task (in case of race conditions)
    for (let attempt = 0; attempt < 3; attempt++) {
      const task = await this.stateManager.getAvailableTask();

      if (!task) {
        return null; // No tasks available
      }

      try {
        await this.stateManager.assignTask(task.id);
        return task;
      } catch (error) {
        if (error.message.includes('already assigned')) {
          console.log(`Task ${task.id} was taken by another agent, trying next task...`);
          // Try to get another task
          continue;
        } else {
          console.error('Error assigning task:', error.message);
          return null;
        }
      }
    }

    console.log('No available tasks after 3 attempts');
    return null;
  }

  async completeCurrentTask(result = {}) {
    const state = await this.stateManager.getState();
    const myStatus = state.agents[this.stateManager.agentId];

    if (!myStatus || !myStatus.currentTask) {
      console.log('No current task to complete');
      return null;
    }

    return await this.stateManager.completeTask(myStatus.currentTask, result);
  }

  async listTasks(filter = {}) {
    return await this.stateManager.getTasks(filter);
  }

  async getMyTasks() {
    return await this.stateManager.getTasks({
      assignedTo: this.stateManager.agentId
    });
  }

  async getPendingTasks() {
    return await this.stateManager.getTasks({
      status: 'pending'
    });
  }

  async getCompletedTasks() {
    return await this.stateManager.getTasks({
      status: 'completed'
    });
  }

  async getCurrentTask() {
    const state = await this.stateManager.getState();
    const myStatus = state.agents[this.stateManager.agentId];

    if (!myStatus || !myStatus.currentTask) {
      return null;
    }

    return state.tasks.find(t => t.id === myStatus.currentTask);
  }
}
