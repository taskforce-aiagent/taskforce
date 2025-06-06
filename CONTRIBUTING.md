# Contributing to TaskForce

Welcome! This guide is intended to help you get started contributing to **TaskForce**, our open-source multi-agent AI framework.

As a project evolving at the intersection of AI and automation, **we highly value community contributions** — whether it's building new features, improving infrastructure, or enhancing documentation.

To contribute, please use the standard [fork and pull request](https://docs.github.com/en/get-started/quickstart/contributing-to-projects) workflow.

---

## Reporting Bugs or Suggesting Improvements

Our [GitHub Issues](https://github.com/taskforce-aiagent/taskforce-aiagent/issues) page is the central place for bug reports, feature requests, and improvement suggestions.

We use a clear labeling system to help triage and organize issues. You can explore the full set of labels [here](https://github.com/taskforce-aiagent/taskforce-aiagent/labels).

For general questions or architectural discussions, please use the [GitHub Discussions board](https://github.com/taskforce-aiagent/taskforce-aiagent/discussions).
We do not provide individual support via email — **public discussion benefits everyone**.

### When Reporting an Issue

* **Describe the issue clearly:** What exactly is going wrong? Are you seeing an error? Is a feature misbehaving? “X doesn’t work” is not enough — please include steps to reproduce.
* **Include relevant code:** If applicable, share only the relevant parts. Avoid pasting full scripts unless necessary.
* **Use collapsible blocks for long code/logs:** Wrap long logs or tracebacks in `<details>` tags to keep issues readable.
  Example:

  ````markdown
  <details>
  <summary>Click to expand</summary>

  ```log
  Error: Agent not found
  at SmartManagerAgent.run(...)
  ````

  </details>
  ```

---

## Contributing Code or Documentation

You can run TaskForce locally and contribute directly to the project.

Please refer to [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup and development instructions.

---

## Opening a Pull Request

Once you’ve written and manually tested your changes:

* Open a new pull request targeting the `main` branch.
* Use [semantic commit](https://www.conventionalcommits.org/en/v1.0.0/) style for your PR title.
  Examples:

  * `feat: add LangChain retriever support`
  * `fix: prevent tool cycle in delegation`
* Clearly describe the problem, the solution, and reference any related issue numbers.

---

Thank you for helping make **TaskForce** better! 🚀
Let’s build the future of multi-agent automation together.

