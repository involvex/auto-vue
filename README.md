# @involvex/autovue

## Description

`create-autovue` is a command-line interface (CLI) tool designed to streamline the setup of new Vue.js projects. It automates the entire scaffolding process, including the creation of a standardized three-branch Git repository structure (`main`, `dev`, `gh-pages`) to get you started with development faster.

This project is based on the official `create-vue` tool, but is customized to enforce project conventions and automate repository initialization.

## Installation

To use `create-autovue`, install it globally via npm:

```bash
npm install -g @involvex/auto-vue
```

## Usage

Once installed, you can create a new Vue project by running the following command in your terminal:

```bash
create-autovue my-vue-app
```

This will launch an interactive setup guide where you can select features for your new project (e.g., TypeScript, Pinia, Router, etc.). After you've made your selections, the tool will:

1.  Create a new directory named `my-vue-app`.
2.  Scaffold a complete Vue.js project inside it.
3.  Initialize a Git repository.
4.  Create `main`, `dev`, and `gh-pages` branches.
5.  Make an initial commit with the scaffolded files.
6.  Check out the `dev` branch so you can start coding immediately.

## Contributing

Contributions are welcome! If you have ideas for improvements or find a bug, please follow these steps:

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes and commit them (`git commit -m 'feat: Add some feature'`).
4.  Push to the branch (`git push origin feature/your-feature-name`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Supporting the project

[@involvex](https://github.com/sponsors/involvex)
[buymeacoffee.com/involvex](https://buymeacoffee.com/involvex)