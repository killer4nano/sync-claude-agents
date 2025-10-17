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
    const task = await this.stateManager.getAvailableTask();

    if (task) {
      try {
        await this.stateManager.assignTask(task.id);
        return task;
      } catch (error) {
        console.error('Error assigning task:', error.message);
        return null;
      }
    }

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
