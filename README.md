# Unit Converter PWA

A modern, feature-rich unit conversion Progressive Web App (PWA) built with React, Tailwind CSS v4, and shadcn/ui. This application allows users to convert between 4,500+ units across 33 categories with a beautiful, responsive UI that works online and offline.

## Features

- **Comprehensive Unit Library**: Convert between thousands of units across multiple categories
- **Persistent History**: Automatically saves your conversion history for quick reference
- **Favorites System**: Save your most-used conversions for quick access
- **Custom Presets**: Create and manage custom conversion presets
- **CSV Export**: Export your conversion history in CSV format for use in spreadsheets
- **Offline Support**: Full functionality even without an internet connection
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **Dark/Light Mode**: Adaptive themes that respect system preferences
- **Accessibility**: Built with a11y in mind, including proper semantic HTML and ARIA attributes

## Tech Stack

- React with TypeScript
- Tailwind CSS v4 for styling
- shadcn/ui component library
- React Router for navigation
- Progressive Web App (PWA) capabilities
- Local Storage for data persistence
- Context API for state management

## Getting Started

### Prerequisites

- Node.js v22+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/unit-converter.git
cd unit-converter
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
unit-converter/
├── public/                # Static assets and PWA manifest
├── src/
│   ├── assets/            # Images and static resources
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and constants
│   ├── pages/             # Page components
│   ├── styles/            # Global styles and Tailwind config
│   ├── App.tsx            # Main App component with routing
│   ├── main.tsx           # Application entry point
│   └── registerSW.ts      # Service Worker registration
├── index.html             # HTML entry point
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # Project documentation
```

## Theming

The application uses CSS variables for theming, with support for light, dark, and system preference modes. You can customize the theme by modifying the CSS variables in `src/styles/index.css`.

### Theme Variables

```css
:root {
  --background: 0 0% 100%;
  --foreground: 224 71.4% 4.1%;
  --primary: 262.1 83.3% 57.8%;
  --primary-foreground: 210 20% 98%;
  /* ... more variables ... */
}

[data-theme="dark"] {
  --background: 224 71.4% 4.1%;
  --foreground: 210 20% 98%;
  /* ... more variables ... */
}
```

## Accessibility

The application is built with accessibility in mind:

- Semantic HTML structure
- Proper ARIA roles and attributes
- Keyboard navigation support
- Color contrast that meets WCAG guidelines
- Screen reader friendly components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
