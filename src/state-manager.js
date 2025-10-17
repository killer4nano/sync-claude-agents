import fs from 'fs/promises';
import path from 'path';

const STATE_FILE = '.sync-state.json';

export class StateManager {
  constructor(projectRoot, agentId) {
    this.projectRoot = projectRoot;
    this.agentId = agentId;
    this.statePath = path.join(projectRoot, STATE_FILE);
  }

  async initialize() {
    try {
      await fs.access(this.statePath);
    } catch {
      // Create initial state if it doesn't exist
      const initialState = {
        agents: {
          'agent-1': {
            status: 'idle',
            currentTask: null,
            lastSeen: new Date().toISOString()
          },
          'agent-2': {
            status: 'idle',
            currentTask: null,
            lastSeen: new Date().toISOString()
          }
        },
        tasks: [],
        locks: [],
        version: 0
      };
      await this.saveState(initialState);
    }
  }

  async getState() {
    try {
      const data = await fs.readFile(this.statePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading state:', error);
      throw error;
    }
  }

  async saveState(state) {
    try {
      state.version = (state.version || 0) + 1;
      await fs.writeFile(this.statePath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Error saving state:', error);
      throw error;
    }
  }

  async updateAgentStatus(status, currentTask = null) {
    const state = await this.getState();

    if (!state.agents[this.agentId]) {
      state.agents[this.agentId] = {};
    }

    state.agents[this.agentId] = {
      status,
      currentTask,
      lastSeen: new Date().toISOString()
    };

    await this.saveState(state);
    return state;
  }

  async heartbeat() {
    const state = await this.getState();

    if (!state.agents[this.agentId]) {
      state.agents[this.agentId] = {
        status: 'idle',
        currentTask: null,
        lastSeen: new Date().toISOString()
      };
    } else {
      state.agents[this.agentId].lastSeen = new Date().toISOString();
    }

    await this.saveState(state);
  }

  async getOtherAgent() {
    const state = await this.getState();
    const otherAgentId = this.agentId === 'agent-1' ? 'agent-2' : 'agent-1';
    return {
      id: otherAgentId,
      ...state.agents[otherAgentId]
    };
  }

  async isOtherAgentActive() {
    const otherAgent = await this.getOtherAgent();
    if (!otherAgent.lastSeen) return false;

    const lastSeen = new Date(otherAgent.lastSeen);
    const now = new Date();
    const diffMinutes = (now - lastSeen) / 1000 / 60;

    // Consider agent active if seen within last 5 minutes
    return diffMinutes < 5;
  }

  async addTask(task) {
    const state = await this.getState();

    const newTask = {
      id: `task-${Date.now()}`,
      description: task.description,
      status: 'pending',
      assignedTo: null,
      createdAt: new Date().toISOString(),
      ...task
    };

    state.tasks.push(newTask);
    await this.saveState(state);

    return newTask;
  }

  async getAvailableTask() {
    const state = await this.getState();
    return state.tasks.find(task => task.status === 'pending' && !task.assignedTo);
  }

  async assignTask(taskId) {
    const state = await this.getState();
    const task = state.tasks.find(t => t.id === taskId);

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (task.assignedTo && task.assignedTo !== this.agentId) {
      throw new Error(`Task ${taskId} already assigned to ${task.assignedTo}`);
    }

    task.assignedTo = this.agentId;
    task.status = 'in-progress';
    task.startedAt = new Date().toISOString();

    await this.saveState(state);
    await this.updateAgentStatus('working', taskId);

    return task;
  }

  async completeTask(taskId, result = {}) {
    const state = await this.getState();
    const task = state.tasks.find(t => t.id === taskId);

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.result = result;

    await this.saveState(state);
    await this.updateAgentStatus('idle', null);

    return task;
  }

  async getTasks(filter = {}) {
    const state = await this.getState();
    let tasks = state.tasks;

    if (filter.status) {
      tasks = tasks.filter(t => t.status === filter.status);
    }

    if (filter.assignedTo) {
      tasks = tasks.filter(t => t.assignedTo === filter.assignedTo);
    }

    return tasks;
  }
}
