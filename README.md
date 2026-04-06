# Resume Craft

A React-based resume builder application that allows users to create their resumes by entering personal details, work experience, skills, education, projects, and achievements.

## Features

- Create a professional resume by filling in text fields for different sections.
- Drag and drop functionality to rearrange sections within the resume.
- Save and download the generated resume in various formats.
- Responsive design for a seamless experience on different devices.

## Technologies Used

- **React 19**: Modern JavaScript library for building user interfaces.
- **TypeScript**: Strongly-typed superset of JavaScript for robust code.
- **Vite**: Fast build tool and development server for optimized bundling.
- **Zustand**: Lightweight state management library for managing global resume data.
- **CSS Modules**: Scoped styling to prevent CSS conflicts and improve maintainability.
- **react-to-print**: Library for printing/exporting the resume as PDF.
- **react-feather**: Icon library for UI elements.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/snehil21/ResumeCraft.git
   cd ResumeCraft
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

4. Build for production:

   ```bash
   npm run build
   ```

## Deployed Link

https://resumecraft.netlify.app/

## Local Setup Guide

### Prerequisites

- Node.js version 24 (see `.nvmrc` for the exact version)
  - You can use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions: `nvm use`
- npm or yarn package manager
- Git

### Steps

1. **Fork and Clone the Repository**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/ResumeCraft.git
   cd ResumeCraft
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create a New Branch for Your Feature**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

   Open your browser and navigate to `http://localhost:3000`.

5. **Make Your Changes**

   Edit the relevant files in the `src/` directory. The development server supports hot module replacement, so your changes will be reflected automatically.

6. **Build and Test**
   ```bash
   npm run build
   npm run preview
   ```

## Contributing

We welcome contributions! Here's how you can help:

### Guidelines

1. **Fork the Repository**
   - Click the "Fork" button on the GitHub repository page.

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Keep changes focused and meaningful
   - Write clear, readable code
   - Follow the existing code style and conventions

4. **Test Your Changes**
   - Run the application locally to ensure everything works
   - Test across different screen sizes if UI changes are made

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Brief description of your changes"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your feature branch and provide a clear description of your changes
   - Submit the pull request for review

### Types of Contributions

We appreciate contributions in the following areas:

- **Bug Fixes**: Fix any bugs or issues you find
- **Features**: Add new features or improve existing ones
- **Documentation**: Improve README, add comments, or create guides
- **UI/UX Improvements**: Enhance the user interface or user experience
- **Performance**: Optimize code and improve performance

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions (camelCase for variables/functions, PascalCase for components)
- Use meaningful variable and function names
- Add comments for complex logic

### Before Submitting

- Ensure your code builds without errors: `npm run build`
- Test your changes thoroughly
- Check that the development server runs without issues: `npm run dev`
- Make sure your commit messages are clear and descriptive

## Support

If you have any questions or need help, feel free to:
- Open an issue on GitHub
- Check existing issues for similar problems
- Contact the maintainers
