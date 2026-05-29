/**
 * StudyFlow Agent — UI layer: DOM events, rendering, and agent orchestration.
 */

const agent = new StudyAgent();
const form = document.getElementById('study-form');
const resultSection = document.getElementById('result-section');
const taskListEl = document.getElementById('task-list');
const resetBtn = document.getElementById('reset-btn');

const displayGoal = document.getElementById('display-goal');
const displayPriority = document.getElementById('display-priority');
const displayDeadline = document.getElementById('display-deadline');
const displayTime = document.getElementById('display-time');
const displayRecommendation = document.getElementById('display-recommendation');
const displayProgress = document.getElementById('display-progress');
const progressFill = document.getElementById('progress-fill');

let currentPlan = null;

// --- Event handlers ---

form.addEventListener('submit', (e) => {
  e.preventDefault();
  generatePlan();
});

resetBtn.addEventListener('click', () => {
  if (!confirm('Reset your study plan? This will clear saved progress.')) return;
  agent.resetMemory();
  currentPlan = null;
  resultSection.classList.add('hidden');
  form.reset();
  document.getElementById('difficulty').value = 'Medium';
  document.getElementById('deadline').value = '7';
  document.getElementById('hours').value = '2';
});

// --- Agent pipeline ---

function generatePlan() {
  const input = {
    goal: document.getElementById('goal').value,
    deadline: document.getElementById('deadline').value,
    difficulty: document.getElementById('difficulty').value,
    hoursPerDay: document.getElementById('hours').value,
  };

  const perceived = agent.perceive(input);
  if (!perceived.valid) {
    alert(perceived.error);
    return;
  }

  const decision = agent.decide(perceived);
  currentPlan = agent.act(decision);
  agent.saveMemory(currentPlan);
  renderPlan(currentPlan);
}

function renderPlan(plan) {
  if (!plan) return;

  displayGoal.textContent = plan.goal;
  displayPriority.textContent = plan.priority;
  displayPriority.className = `priority-badge priority-${plan.priority.toLowerCase()}`;
  displayDeadline.textContent = `${plan.deadline} day${plan.deadline !== 1 ? 's' : ''}`;
  displayTime.textContent = `${plan.totalAvailableHours} hours (${plan.hoursPerDay} h/day)`;
  displayRecommendation.textContent = plan.recommendation;

  updateProgressUI(plan.progress);
  renderTasks(plan.tasks);
  syncFormFromPlan(plan);

  resultSection.classList.remove('hidden');
}

function updateProgressUI(percent) {
  displayProgress.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
}

function renderTasks(tasks) {
  taskListEl.innerHTML = '';

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task-item${task.completed ? ' completed' : ''}`;
    li.dataset.taskId = task.id;

    const label = document.createElement('label');
    label.className = 'task-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => {
      currentPlan = agent.updateTask(task.id, checkbox.checked);
      li.classList.toggle('completed', checkbox.checked);
      updateProgressUI(currentPlan.progress);
    });

    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';
    titleSpan.textContent = task.title;

    const metaSpan = document.createElement('span');
    metaSpan.className = 'task-meta';
    metaSpan.textContent = `~${task.suggestedStudyTime}h · ${task.priority} priority`;

    label.append(checkbox, titleSpan);
    li.append(label, metaSpan);
    taskListEl.append(li);
  });
}

function syncFormFromPlan(plan) {
  document.getElementById('goal').value = plan.goal;
  document.getElementById('deadline').value = plan.deadline;
  document.getElementById('difficulty').value = plan.difficulty;
  document.getElementById('hours').value = plan.hoursPerDay;
}

// --- Init: restore saved plan on load ---

function init() {
  const saved = agent.loadMemory();
  if (saved) {
    currentPlan = saved;
    renderPlan(currentPlan);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
