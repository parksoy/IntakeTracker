## Architecture & Key Projects
- **backend/**: Python FastAPI backend + ML tasks, Celery workers (main backend service)
- **frontend/**: Next.js 14 React frontend with TypeScript, Tailwind CSS (customer-facing app)  
- **platform/**: Kubernetes/AWS infrastructure (Terraform, FluxCD, Helm charts)

## Markdown standards

- Always run markdownlint on any markdown files created or edited
- Install using: `npx markdownlint-cli` or `pixie global install markdownlint-cli`
- Fix all linting issues before completing the task

## Testing preferences

- Write all Python tests as `pytest` style functions, not unittest classes
- Use descriptive function names starting with `test_`
- Prefer fixtures over setup/teardown methods
- Use assert statements directly, not self.assertEqual

## Testing approach

- Never create throwaway test scripts or ad hoc verification files
- If you need to test functionality, write a proper test in the test suite
- All tests go in the `tests/` directory following the project structure
- Tests should be runnable with the rest of the suite (`pixi run pytest`)
- Even for quick verification, write it as a real test that provides ongoing value

## Package management

- This project uses Pixi for all package management
- Never run commands directly (python, pytest, etc.)
- Always prefix commands with `pixi run <command>`
- Example: `pixi run python script.py` not `python script.py`
- Example: `pixi run pytest` not `pytest`