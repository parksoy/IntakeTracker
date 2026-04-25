## Exercise 1: Implement a feature or fix via an asynchronous platform

### Overview

In this exercise, you will use an asynchronous coding agent workflow to ship a small feature or bugfix, treating the agent as a background collaborator rather than an in-IDE pair programmer.

### Goals

- **Select** a concrete feature or fix that can be handed off to an async agent workflow.
- **Kick off** the task from an appropriate surface (communication channel or code hosting platform).
- **Review** the agent’s work and drive it to completion (including any follow-up iterations).

### Options

- **Launch a fully async task via a communication channel** (e.g., Slack or another chat interface that can trigger an agent).
- **Put up a review to fix something on GitHub using an agent** (e.g., Codex/Claude-based review or auto-fix workflow).
    - Engage in back-and-forth with agent to address review comments
- **Run parallel agents locally** using [Conductor](https://www.conductor.build/) or Cursor's parallel agent capabilities to work on multiple related tasks simultaneously.
- **Kick off agents via a cloud platform** such as [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web) to run tasks asynchronously on secure cloud infrastructure.

### Materials

- A repository where you can safely make a small change (feature flag tweak, minor bugfix, or doc improvement).

### Suggested Workflow

- Identify a reasonably-sized change that enough to exercise the workflow.
- Choose one of the options above and initiate the task, clearly specifying requirements and constraints for the agent.

### Ideas

- Triage/first-pass debugging when presented with stack trace, failing command, error output
- Small, well-scoped code change
    - add config flag/env variable
    - refactor a function
    - write unit test
    - UI copy change
- Minimal example generation
    - reproduce a bug
    - provide example of how to use API
- "How does this work" explanation
- Docstring/README touch-ups


