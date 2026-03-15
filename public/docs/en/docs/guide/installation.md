# Installation

## Prerequisites

Before you begin, make sure your development environment meets the following requirements:

- **Node.js**: Version `>= 18.0.0`
- **Package Manager**: `npm`, `yarn`, or `pnpm`

## Recommended Method: Use the Scaffolding Tool

We strongly recommend using the official `create-react-docs-ui` scaffolding tool to create your new documentation project. This is now the only recommended installation path because it keeps configuration, runtime behavior, and project structure aligned.

1.  **Run the creation command**:
    ```bash
    npx create-react-docs-ui@latest my-docs
    ```
    This will create a new folder named `my-docs` in the current directory.

2.  **Enter the project and install dependencies**:
    ```bash
    cd my-docs
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    Your documentation website is now running at `http://localhost:5173` (or another available port).

## Why manual installation is no longer recommended

The current docs site setup relies on the scaffolded project structure and build pipeline for config loading, search index generation, code highlighting, and other runtime behavior. Manual integration is prone to missing configuration or inconsistent behavior, so the documentation no longer provides manual installation steps.
