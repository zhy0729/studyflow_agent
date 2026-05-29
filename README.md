# StudyFlow Agent

An intelligent study planning agent prototype that helps students turn a study goal into a structured task plan. Built with plain HTML, CSS, and JavaScript for a university software agent assignment.

This prototype does not use a real external API. Instead, it uses rule-based decision-making and browser localStorage to demonstrate the core agent loop.

## Features

- **Goal-based planning** — Enter a study goal, deadline, difficulty, and daily study hours.
- **Rule-based decisions** — Priority level, task breakdown, time estimates, and recommendations are computed by clear rules (no AI API).
- **Task tracking** — Six structured tasks with checkboxes and progress percentage.
- **Persistent memory** — Plans and completion status survive page refresh via `localStorage`.
- **Reset** — Clear the current plan and start over.
- **Responsive UI** — Card-based layout that works on desktop and mobile.

## How the Agent Works

### Perception

The `StudyAgent.perceive()` method reads form input: study goal, deadline (days), difficulty (Low / Medium / High), and available hours per day. It validates and normalizes this data into a state object, including total available study time (`deadline × hours per day`).

### Decision-making

The `StudyAgent.decide()` method applies rule-based logic:

| Condition | Priority |
|-----------|----------|
| Deadline ≤ 3 days **or** difficulty is High | **High** |
| Deadline ≥ 7 days **and** difficulty is Low | **Low** |
| Otherwise | **Medium** |

Recommendations by priority:

- **High** — Start immediately; focus on core tasks first.
- **Medium** — Follow the plan steadily.
- **Low** — Start early and review gradually.

The agent also decomposes the goal into six standard tasks, each with a suggested study time based on total available hours and priority.

### Action

The `StudyAgent.act()` method shapes the decision into a plan object. The UI (`main.js`) displays the plan, renders tasks with checkboxes, updates progress, and handles reset.

### Memory

`saveMemory()`, `loadMemory()`, `updateTask()`, and `resetMemory()` use browser `localStorage` to persist:

- Study goal, deadline, difficulty, hours per day
- Generated tasks and completion status
- Plan creation time and progress

## How to Run

1. Clone or download this project folder.
2. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, or Safari).
3. No server, npm, or API keys are required.

> **Note:** Scripts load as classic JavaScript (not ES modules) so the app works when you double-click `index.html` via `file://`. No local server is required.

## Project Structure

```
studyflow_agent/
├── index.html          # Main page, form, results, explanation
├── README.md           # This file
├── docs/
│   └── demo.mp4        # 2-minute demo video
└── src/
    ├── agent.js        # StudyAgent class (perceive, decide, act, memory)
    ├── main.js         # DOM events and rendering
    └── style.css       # Layout and visual design
```

## Demo Video

[2-minute StudyFlow Agent demo](./docs/demo.mp4)

> The demo video is hosted in the repository at `docs/demo.mp4`. Due to GitHub file size limits, the video may need to be downloaded via "View raw" before playback.

## Screenshots

<!-- Add screenshots of the form, generated plan, and completed tasks -->

| Screenshot | Description |
|------------|-------------|
| *(placeholder)* | Input form with study goal fields |
| *(placeholder)* | Generated plan with priority and tasks |
| *(placeholder)* | Progress after marking tasks complete |

## Suggested Git Commit Checkpoints

Use these messages as you build the project incrementally:

1. `Initial project setup with basic HTML structure`
2. `Add perception module for user study goal input`
3. `Add decision logic for priority and task decomposition`
4. `Add action module to generate and display study plan`
5. `Add localStorage memory for saving task progress`
6. `Improve UI layout and update README instructions`
7. `Add screenshots and demo video link`

## License

Educational prototype for university coursework.
