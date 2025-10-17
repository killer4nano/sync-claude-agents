# Claude Code Integration Examples

This document shows how to integrate sync-work-claude into your Claude Code sessions.

## Example 1: Basic Integration

### Computer 1 (Agent 1)

Ask Claude:

```
I want you to work on a project with another Claude agent on a different computer.

Setup:
- Use sync-work-claude from F:\CodeProjects\sync-work-claude
- Your agent ID is: agent-1
- Project root: F:\CodeProjects\my-app

Task: Implement the user authentication system

Instructions:
1. Initialize the sync system
2. Check for any tasks assigned to you
3. If no tasks, create a task for "Implement login form"
4. Work on the task
5. When done, mark it complete and sync
6. Check if agent-2 has completed any tasks
```

### Computer 2 (Agent 2)

Ask Claude:

```
I want you to work on a project with another Claude agent on a different computer.

Setup:
- Use sync-work-claude from /path/to/sync-work-claude
- Your agent ID is: agent-2
- Project root: /path/to/my-app

Task: Implement the user profile system

Instructions:
1. Initialize the sync system
2. Pull latest changes from agent-1
3. Check for any tasks assigned to you
4. If no tasks, create a task for "Implement profile page"
5. Work on the task
6. When done, mark it complete and sync
```

## Example 2: Task-Based Collaboration

### Initial Setup (Either Computer)

```javascript
import SyncWorkClaude from './sync-work-claude/src/index.js';

const sync = new SyncWorkClaude();
await sync.initialize();

// Define all tasks upfront
const tasks = [
  'Create database schema',
  'Implement API endpoints',
  'Add authentication middleware',
  'Write integration tests',
  'Update API documentation',
  'Add error handling',
  'Implement rate limiting',
  'Add logging'
];

for (const task of tasks) {
  await sync.addTask(task);
}

console.log('All tasks added. Both agents can now start working.');
```

### Agent Prompt (Both Computers)

```
You are working collaboratively with another Claude agent using sync-work-claude.

Instructions:
1. Pull latest changes
2. Get the next available task from the queue
3. Complete the task
4. Mark it as complete
5. Sync your changes
6. Repeat until all tasks are done

Project: F:\CodeProjects\my-app
Sync System: F:\CodeProjects\sync-work-claude
Agent ID: [agent-1 or agent-2]
```

## Example 3: Feature Branch Collaboration

### Agent 1: Frontend

```
Project: E-commerce website
Your role: Frontend development
Agent ID: agent-1

Tasks:
- Product listing page UI
- Shopping cart UI
- Checkout form UI

Use sync-work-claude to coordinate with agent-2 (backend developer).
Pull their API changes and integrate with your frontend.
```

### Agent 2: Backend

```
Project: E-commerce website
Your role: Backend development
Agent ID: agent-2

Tasks:
- Product API endpoints
- Shopping cart API
- Payment processing API

Use sync-work-claude to coordinate with agent-1 (frontend developer).
Push your API changes so they can integrate with the frontend.
```

## Example 4: Code Review Collaboration

### Agent 1: Implementation

```
Agent ID: agent-1
Role: Implementation

1. Pick a task from the queue
2. Implement the feature
3. Add a task for agent-2: "Review [feature name] implementation"
4. Mark your task as complete
5. Sync changes
```

### Agent 2: Review

```
Agent ID: agent-2
Role: Code Review

1. Wait for tasks from agent-1
2. Pull their changes
3. Review the code
4. If issues found:
   - Add tasks describing issues
   - Leave comments in code
5. If approved:
   - Mark review task as complete
   - Optionally merge to main branch
6. Sync changes
```

## Example 5: Test-Driven Development

### Agent 1: Tests

```
Agent ID: agent-1
Role: Test Writer

For each feature:
1. Write comprehensive tests
2. Add task: "Implement [feature] to pass tests"
3. Commit and sync tests
4. Wait for agent-2 to implement
5. Verify tests pass
```

### Agent 2: Implementation

```
Agent ID: agent-2
Role: Feature Implementation

For each feature:
1. Pull latest tests from agent-1
2. Implement the feature to pass tests
3. Run tests to verify
4. Add task: "Verify [feature] implementation"
5. Commit and sync
```

## Example 6: Documentation and Code

### Agent 1: Code

```
Agent ID: agent-1

1. Implement features
2. Add JSDoc comments
3. Create task: "Document [feature] in README"
4. Sync changes
```

### Agent 2: Documentation

```
Agent ID: agent-2

1. Pull code from agent-1
2. Read JSDoc comments and code
3. Write comprehensive documentation
4. Update README
5. Create examples
6. Sync changes
```

## Best Practices for Claude Integration

### 1. Clear Role Definition

Always tell each Claude agent:
- Their agent ID
- Their role/responsibility
- The project structure
- What to coordinate with the other agent

### 2. Use Descriptive Tasks

Bad: "Fix stuff"
Good: "Fix authentication bug in login.js line 42 - null pointer exception"

### 3. Regular Syncing

Tell Claude to:
- Pull before starting work
- Push after completing tasks
- Check status regularly

### 4. Conflict Prevention

- Assign different files to different agents when possible
- Use file locks for shared files
- Keep tasks atomic and independent

### 5. Communication via Tasks

Since agents can't directly message each other:
- Use task descriptions to communicate
- Add context in task metadata
- Reference specific files and line numbers

## Troubleshooting

### Agent Lost Track of State

```
Please:
1. Check the current status: node src/index.js status
2. List all tasks: node src/index.js list-tasks
3. Review recent commits: git log --oneline -10
4. Continue from where we left off
```

### Merge Conflict

```
There's a merge conflict. Please:
1. Review the conflicted files
2. Resolve conflicts manually
3. Commit the resolution
4. Continue with the next task
```

### Agent Idle

```
The other agent appears idle. Please:
1. Check their last seen time
2. If stale (>5 minutes), assume they're offline
3. You can take over their pending tasks if needed
4. Add a note in the task about the takeover
```
