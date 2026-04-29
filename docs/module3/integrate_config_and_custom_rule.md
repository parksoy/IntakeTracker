## Exercise 1: Integrate an agent configuration file, MCP server, and add/or a custom rule, command, hook, skill

### Overview

In this exercise, you will introduce a configuration file (CLAUDE.md, AGENTS.md) for your coding agent, custom MCP servers, and/or add at least one custom rule, command, skill, or hook that shapes how the agent participates in a specific part of your development process.

### Goals

- **Define** a configuration file that your agent can read and use consistently.
- **Add** a concrete rule that changes the agent’s behavior for a particular workflow (e.g., code review, design docs, testing, linting).
- **Verify** that the new configuration and rule are actually being applied in real interactions.

### Materials

- This repository or another codebase where you are comfortable adding configuration.
- The readings from this module’s README for examples of good context, rules, and agent behaviors.

### Suggested Workflow

- Choose a narrow scenario to target (for example, “pull request reviews” or “writing design docs”).
- Create or update an agent configuration file in your repo that encodes:
  - The scenario and its constraints.
  - At least one explicit rule the agent should follow.
- Run a small interaction that exercises the scenario and confirm, via the agent’s behavior, that the rule is being enforced.

### Ideas

- Customize your AGENTS.md to describe your codebase/project structure
- Add a rule in your AGENTS.md describing how to run tests after each diff or to lint/format the code as per repository style guidelines
- Define a linting hook
- MCP
  - Integrate `context7`, `Confluence`, `Redshift`


