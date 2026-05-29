/**
 * StudyAgent — rule-based study planning agent.
 * Separates perception, decision-making, action, and memory.
 */

const STORAGE_KEY = 'studyflow_agent_plan';

const TASK_TEMPLATES = [
  { id: 1, title: 'Understand the assignment requirements' },
  { id: 2, title: 'Break down the main goal' },
  { id: 3, title: 'Study or collect necessary materials' },
  { id: 4, title: 'Implement or complete the main work' },
  { id: 5, title: 'Test and review the result' },
  { id: 6, title: 'Prepare final submission or presentation' },
];

// Suggested hours per task by plan priority (total split across 6 tasks)
const TIME_WEIGHTS = {
  High: [0.12, 0.1, 0.15, 0.35, 0.18, 0.1],
  Medium: [0.15, 0.12, 0.18, 0.3, 0.15, 0.1],
  Low: [0.18, 0.15, 0.2, 0.25, 0.12, 0.1],
};

class StudyAgent {
  constructor() {
    this.currentPlan = null;
  }

  /**
   * Perception: normalize and validate user input.
   */
  perceive(input) {
    const goal = (input.goal || '').trim();
    const deadline = Math.max(1, Math.floor(Number(input.deadline) || 1));
    const difficulty = ['Low', 'Medium', 'High'].includes(input.difficulty)
      ? input.difficulty
      : 'Medium';
    const hoursPerDay = Math.max(0.5, Math.min(24, Number(input.hoursPerDay) || 2));

    if (!goal) {
      return { valid: false, error: 'Please enter a study goal.' };
    }

    return {
      valid: true,
      goal,
      deadline,
      difficulty,
      hoursPerDay,
      totalAvailableHours: deadline * hoursPerDay,
    };
  }

  /**
   * Decision-making: priority, tasks, recommendation from perceived state.
   */
  decide(state) {
    const priority = this._determinePriority(state.deadline, state.difficulty);
    const recommendation = this._getRecommendation(priority);
    const tasks = this._buildTasks(priority, state.totalAvailableHours);

    return {
      goal: state.goal,
      deadline: state.deadline,
      difficulty: state.difficulty,
      hoursPerDay: state.hoursPerDay,
      totalAvailableHours: state.totalAvailableHours,
      priority,
      recommendation,
      tasks,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Action: shape decision into a plan object for display and storage.
   */
  act(decision) {
    return {
      goal: decision.goal,
      deadline: decision.deadline,
      difficulty: decision.difficulty,
      hoursPerDay: decision.hoursPerDay,
      totalAvailableHours: decision.totalAvailableHours,
      priority: decision.priority,
      recommendation: decision.recommendation,
      tasks: decision.tasks.map((t) => ({ ...t })),
      createdAt: decision.createdAt,
      progress: this.calculateProgress(decision.tasks),
    };
  }

  /** Save full plan to localStorage. */
  saveMemory(plan) {
    this.currentPlan = plan;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
      return true;
    } catch {
      return false;
    }
  }

  /** Load plan from localStorage. */
  loadMemory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const plan = JSON.parse(raw);
      if (!plan || !Array.isArray(plan.tasks)) return null;
      plan.progress = this.calculateProgress(plan.tasks);
      this.currentPlan = plan;
      return plan;
    } catch {
      return null;
    }
  }

  /** Update a single task's completion status and persist. */
  updateTask(taskId, completed) {
    if (!this.currentPlan) return null;

    const task = this.currentPlan.tasks.find((t) => t.id === taskId);
    if (!task) return this.currentPlan;

    task.completed = completed;
    this.currentPlan.progress = this.calculateProgress(this.currentPlan.tasks);
    this.saveMemory(this.currentPlan);
    return this.currentPlan;
  }

  /** Clear stored plan. */
  resetMemory() {
    this.currentPlan = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  /** Progress as percentage of completed tasks. */
  calculateProgress(tasks) {
    if (!tasks || tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.completed).length;
    return Math.round((done / tasks.length) * 100);
  }

  // --- Private decision helpers ---

  _determinePriority(deadline, difficulty) {
    if (deadline <= 3 || difficulty === 'High') return 'High';
    if (deadline >= 7 && difficulty === 'Low') return 'Low';
    return 'Medium';
  }

  _getRecommendation(priority) {
    const messages = {
      High:
        'Start immediately and focus on core tasks first. Prioritize understanding requirements and completing the main work.',
      Medium:
        'Follow the plan steadily. Balance each phase and keep a consistent daily rhythm until the deadline.',
      Low:
        'Start early and review gradually. Use your extra time for thorough research and multiple review passes.',
    };
    return messages[priority];
  }

  _buildTasks(priority, totalHours) {
    const weights = TIME_WEIGHTS[priority];

    return TASK_TEMPLATES.map((template, index) => {
      const suggestedHours = Math.max(
        0.5,
        Math.round(totalHours * weights[index] * 10) / 10
      );

      return {
        id: template.id,
        title: template.title,
        completed: false,
        priority,
        suggestedStudyTime: suggestedHours,
      };
    });
  }
}

// Expose globally so scripts work when opening index.html via file://
window.StudyAgent = StudyAgent;
