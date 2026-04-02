import React from "react";
import MacWindow from "./MacWindow";
import Terminal from "react-console-emulator";

const Cli = () => {
  const commands = {
    about: {
      description: "About me",
      fn: () => `
Hi, I'm Shrey 👋
Frontend Developer focused on building interactive and modern UI.
I enjoy working with React, animations, and clean design systems.
      `,
    },

    skills: {
      description: "My tech stack",
      fn: () => `
Frontend:
- React
- JavaScript (ES6+)
- HTML, CSS, SCSS
- GSAP / Animations

Tools:
- Git & GitHub
- Vite
- Figma

Currently learning:
- Advanced UI/UX patterns
      `,
    },

    projects: {
      description: "List of projects",
      fn: () => `
Projects:

1. MacOS Portfolio UI
2. Custom Cursor with GSAP
3. React Terminal Portfolio

More on GitHub → github.com/bytesizedshrey
      `,
    },

    contact: {
      description: "Contact info",
      fn: () => `
Email: shrey@example.com
Location: India
      `,
    },

    social: {
      description: "Social links",
      fn: () => `
GitHub: github.com/bytesizedshrey
LinkedIn: linkedin.com/in/yourprofile
      `,
    },

    echo: {
      description: "Echo a passed string",
      usage: "echo <string>",
      fn: (...args) => args.join(" "),
    },
  };

  return (
    <MacWindow>
      <div className="cli-window">
        <Terminal
          commands={commands}
          welcomeMessage={`
Welcome to Shrey's Terminal Portfolio 💻

Type 'help' to see all available commands.
          `}
          promptLabel={"bytesizedshrey:~$"}
          promptLabelStyle={{ color: "green" }}
        />
      </div>
    </MacWindow>
  );
};

export default Cli;
