# Claude Code (Claude models) vs GitHub Copilot (GPT models)

A practical comparison of the two agent systems, focused on how they handle
configuration, custom behavior, agent spawning, memory, and tooling —
using IntakeTracker as the reference project.

---

## 1. Configuration files

| Concept | Claude Code | GitHub Copilot |
|---------|-------------|----------------|
| Main config | `CLAUDE.md` (project root) | `.github/copilot-instructions.md` |
| Universal agent rules | `AGENTS.md` (project root) | No direct equivalent |
| Directory-level context | Subdirectory `CLAUDE.md` files | No direct equivalent |
| User preferences | `~/.claude/memory/` (auto-memory) | Copilot settings in VS Code / GitHub profile |
| Composable capabilities | `SKILLS.md` (convention) | No direct equivalent |

**Claude Code:** `CLAUDE.md` is loaded automatically at session start. You write project context, rules, and constraints in natural language and the model follows them as part of every response.

**Copilot:** `.github/copilot-instructions.md` is the equivalent — it provides custom instructions that Copilot Chat includes in every request. Shorter and less expressive than `CLAUDE.md` in practice; primarily used for style rules and framework preferences.

**Key difference:** Claude Code reads a richer, longer document and is expected to follow complex multi-rule instructions. Copilot instructions tend to work best as short bullet lists.

---

## 2. Custom slash commands

| | Claude Code | GitHub Copilot |
|--|-------------|----------------|
| Location | `.claude/commands/*.md` | Built-in only (e.g. `/fix`, `/explain`, `/tests`) |
| User-defined commands | Yes — write a `.md` file, invoke with `/name` | Not supported for arbitrary custom commands |
| Invoked by | You type `/name` in the prompt | You type `/name` in Copilot Chat |
| Logic | Markdown prompt template Claude follows | Hardcoded Copilot behaviors |

**Claude Code:** `/ship`, `/deslop`, `/lint-check` — you define these as markdown files, Claude follows them as instructions.

**Copilot:** Commands like `/fix`, `/explain`, `/tests`, `/doc` are built-in. You cannot define your own `/mycommand`. The closest equivalent is writing a prompt in Copilot Chat and saving it as a VS Code snippet.

---

## 3. Hooks (automated behavior on events)

| | Claude Code | GitHub Copilot |
|--|-------------|----------------|
| Hook system | Yes — `.claude/settings.json` | No |
| Trigger on file edit | `PostToolUse` hook → runs shell command | Not available |
| Pre/post tool execution | Yes | Not available |
| Example | Auto-run `node --check` after every JS edit | N/A |

**Claude Code:** Hooks are shell commands that fire on events like `PostToolUse`, `PreToolUse`, `Stop`. This project uses a hook that runs `node --check` automatically after every Edit or Write tool call.

**Copilot:** No hook system. You cannot automate shell commands based on Copilot's actions.

---

## 4. MCP servers (external tool integrations)

| | Claude Code | GitHub Copilot |
|--|-------------|----------------|
| Protocol | MCP (Model Context Protocol) — open standard by Anthropic | Copilot Extensions (GitHub Marketplace) |
| Config location | `.claude/settings.json` → `mcpServers` | VS Code settings / GitHub App installation |
| Example: docs lookup | context7 MCP (`@upstash/context7-mcp`) | No direct equivalent |
| Custom tools | Any MCP-compatible server | Must be a published Copilot Extension |
| Self-hosted | Yes | Requires GitHub App setup |

**Claude Code:** `context7` MCP is configured in this project — Claude can call it mid-session to fetch current Expo/RN API docs. Any MCP server (local or remote) can be added.

**Copilot:** Extensions like `@github`, `@terminal`, `@vscode` are built-in. Third-party extensions exist on the marketplace but require installation as a GitHub App and are less customizable.

---

## 5. Agent spawning and multi-agent workflows

| | Claude Code | GitHub Copilot |
|--|-------------|----------------|
| Spawn parallel agents | Yes — Agent tool, or `launch_agents.py` via iTerm2 | No parallel agent support |
| Background async agents | Yes — `claude --background` or `code.claude.com` | Copilot Coding Agent (GitHub Issues → auto PR) |
| Named agents | Yes — named in prompt or description | Copilot Coding Agent is a single unnamed agent |
| Agent orchestration | Yes — one agent can spawn and direct sub-agents | No |
| File scope isolation | Yes — each agent given strict file boundaries | N/A |

**Claude Code:** This project uses `launch_agents.py` to spawn two named agents (BuildBot / FeatureBot) in iTerm2 split panes with strict file scope. Agents can also be spawned programmatically.

**Copilot Coding Agent:** You assign a GitHub Issue to Copilot → it creates a branch, writes code, opens a PR, and responds to review comments. Async, but single-threaded and GitHub-issue-scoped. Less control over scope and behavior.

---

## 6. Memory and persistence across sessions

| | Claude Code | GitHub Copilot |
|--|-------------|----------------|
| Cross-session memory | Yes — `~/.claude/projects/.../memory/*.md` | No |
| Remembers user preferences | Yes — auto-saved to memory files | No — starts fresh each session |
| Remembers project decisions | Yes — saved to memory on request | No |
| Equivalent | Built-in memory system | You must re-paste context every session |

**Claude Code:** Remembers that you're building a personal iOS app with no backend, that the storage key format is `intake_log_YYYY-MM-DD`, etc. — across sessions without re-explaining.

**Copilot:** No persistent memory. Every Copilot Chat session starts with zero context unless you paste it in or it reads open files.

---

## 7. Codebase awareness

| | Claude Code | GitHub Copilot |
|--|-------------|----------------|
| Reads full codebase | Yes — on request or automatically | `@workspace` brings in indexed codebase |
| File access | Direct read/write via tools | Read via @workspace context; edits inline |
| Search | `grep`, `find` via Bash tool | `@workspace` semantic search |
| Understands project structure | From CLAUDE.md + exploration | From `@workspace` indexing |

**Claude Code:** Explicitly reads files, runs searches, follows file paths. Can read and write any file in the repo.

**Copilot:** `@workspace` semantically indexes the repo and surfaces relevant files. More passive — it decides what to include rather than you directing it to specific files.

---

## 8. PR and GitHub integration

| | Claude Code | GitHub Copilot |
|--|-------------|----------------|
| Create PRs | Via `gh` CLI in Bash tool | Copilot Coding Agent creates PRs natively |
| Review PRs | `/code-review` command (custom) | Built-in `/review` in Copilot Chat |
| Create issues | Via `gh issue create` in Bash | Via GitHub UI or Copilot Coding Agent |
| Manage project boards | Via `gh project` CLI | Not directly |
| GitHub-native | No — uses `gh` CLI as a bridge | Yes — deeply integrated |

---

## 9. Model differences (Claude vs GPT)

| | Claude Code (Claude Sonnet/Opus) | GitHub Copilot (GPT-4.5 / Codex) |
|--|----------------------------------|-----------------------------------|
| Provider | Anthropic | OpenAI |
| Long context window | 200K tokens (Sonnet/Opus) | 128K tokens (GPT-4.5) |
| Follows complex instructions | Strong — CLAUDE.md rules are reliably followed | Moderate — shorter instructions work better |
| Code completion (inline) | Not inline — terminal only | Excellent — core Copilot feature |
| Reasoning | Extended thinking available (Opus) | o1/o3 reasoning models available |
| Tool use / function calling | Yes | Yes |

**Copilot's advantage:** Inline code completion as you type is Copilot's core strength — it is deeply integrated into the editor experience. Claude Code has no inline completion.

**Claude Code's advantage:** Follows long, complex `CLAUDE.md` instructions reliably, supports hooks/MCP/memory, and can orchestrate multi-agent workflows with strict scope control.

---

## 10. Summary: when to use which

| Use case | Reach for |
|----------|-----------|
| Inline autocomplete while typing | GitHub Copilot |
| PR review in GitHub UI | GitHub Copilot |
| Assign an issue to an agent, get a PR back | Copilot Coding Agent |
| Multi-file refactor with strict rules | Claude Code |
| Multi-agent parallel work | Claude Code |
| Custom automation (hooks, MCP, commands) | Claude Code |
| Persistent project memory across sessions | Claude Code |
| Quick one-off question about open file | Either |
| Long session with complex codebase context | Claude Code |

---

## In this project (IntakeTracker)

Claude Code is the primary agent system because:

- `CLAUDE.md` encodes the 23-point rule, storage key contract, and file boundaries — reliably followed
- `launch_agents.py` ran two scoped agents in parallel (BuildBot + FeatureBot) with no file conflicts
- PostToolUse hook auto-runs `node --check` — not possible in Copilot
- context7 MCP fetches live Expo docs — not available in Copilot
- `/issuemanager`, `/ship`, `/deslop` are custom commands with project-specific logic

GitHub Copilot would be additive here for **inline completion while writing new components** — the two tools are complementary rather than mutually exclusive. Copilot writes the boilerplate as you type; Claude Code handles the multi-step, multi-file, rule-governed work.
