# Quick Start

This guide will walk you through creating, configuring, and running your own React documentation website from scratch in 5 minutes.

## 1. Create Project

Using the official scaffold is the most efficient way. Open your terminal and run the following command:

```bash
# This will create a project named "my-awesome-docs"
npx create-react-docs-ui@latest my-awesome-docs
```

Then, navigate to the project directory and install dependencies:

```bash
cd my-awesome-docs
npm install
```

## 2. Organize Your Documentation

All documentation content is stored as Markdown files in the `public/docs/` directory.

- Open the `public/docs/en/` directory.
- You can modify the existing `index.md` and files in the `guide` directory, or create new `.md` files.

For example, let's create a new page. Create an `about` directory and an `about.md` file in `public/docs/en/` with the following content:

```markdown

# About Us

We love open source and creating!

```


## 3. Configure the Website

Now, let's display the newly created page by modifying the configuration file.

Open the core configuration file `public/config/site.en.yaml`.

### a. Modify Website Information

Update the `site` section to give your website a new title and Logo.

```yaml
site:
  title: "My Awesome Docs"
  description: "A website built with React Docs UI"
  logo: "🚀" # You can use emoji or image path
```

### b. Add to Navigation Bar

Add a link for the "About" page in the `navbar.items` array.

```yaml
navbar:
  items:
    - title: "Home"
        link: "/"
        active: true
    - title: "Docs"
        link: "/docs"
    - title: "About"  # New
        link: "/about" # New
```

### c. Add to Sidebar

To make the "About" page visible in the sidebar as well, create a new `sidebar.collections.about.sections` and add a new entry.

```yaml
sidebar:
  collections:
    about:
      sections:
        # You can create a new section for the "About" page
        - title: "About Us"
          path: "/about/about"
```

Here, the about item in the sidebar also needs to create a file `about.md` under `public/docs/en/about`

## 4. Launch the Website

Save all your changes, then run in the terminal:

```bash
npm run dev
```

Your website should now be running at `http://localhost:5173`. Visit it, and you will see the updated title, Logo, and the newly added "About" link in the navigation bar and sidebar. Congratulations, you have successfully mastered the basic workflow of React Docs UI!