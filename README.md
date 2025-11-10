<p align="center"> 
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="frontend/public/polyboardLight.svg">
      <source media="(prefers-color-scheme: light)" srcset="frontend/public/polyboard.svg">
      <img src="frontend/public/polyboard.svg" alt="Polyboard Logo" height="120px">
    </picture>
</p>

<h1 align="center"> 
  The Interactive Multilingual Whiteboard
</h1>

<p align="center">
  <a href="https://reactjs.org/">
    <img src="https://img.shields.io/badge/React-19.1.1-blue.svg" alt="React">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.9.3-blue.svg" alt="TypeScript">
  </a>
  <a href="https://fastapi.tiangolo.com/">
    <img src="https://img.shields.io/badge/FastAPI-0.119.0-green.svg" alt="FastAPI">
  </a>
  <a href="https://www.python.org/">
    <img src="https://img.shields.io/badge/Python-3.13-blue.svg" alt="Python">
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API">
    <img src="https://img.shields.io/badge/WebSocket-Real--time-orange.svg" alt="WebSocket">
  </a>
</p>

<div align="center">

  [__Summary__](#summary) •
  [__Features__](#features) •
  [__Installation__](#installation) •
  [__Development Workflow__](#️development-workflow) •
  [__Architecture__](#️architecture) •
  [__Project Structure__](#project-file-structure)

</div>

## Summary
**Polyboard** is a real-time collaborative whiteboard application that combines interactive drawing capabilities with multilingual communication features. Built with a React TypeScript frontend and FastAPI Python backend, it enables teams to collaborate seamlessly across language barriers by providing **comprehensive drawing tools**, **live synchronization**, and a **chat system** with real-time translation. It's an ideal solution for **international teams**, **educational environments**, and **remote collaboration scenarios** where visual communication and language diversity intersect. It currently features the following:
- A variety of Brushes and Tools
- Complete Undo/Redo Functionality
- Brush Stroke Selection/Manipulation
- Real Time Text OCR and Multilingual Translation

## Features
### Drawing Tools
- **Pen Tool**: Freehand drawing with customizable colors and brush sizes.
- **Text Tool**: Add typed text to your whiteboard.
- **Shape Tools**: Draw lines, rectangles, and ellipses.
- **Selection Tool**: Select and focus on specific strokes.
- **Mathematical Symbols**: Quick access to common mathematical notation.
### Real-time Collaboration
- **Live Synchronization**: Changes appear instantly for all connected users.
- **WebSocket Communication**: Efficient real-time data transfer.
- **Conflict Resolution**: Smart merging of simultaneous edits.
- **Connection Status**: Visual indicators for connection health.
### Multilingual Chat
- **Live Translation**: Real-time message translation between languages
- **Language Detection**: Automatic detection of input language
- **Original Message Preservation**: View both original and translated text
- **User Identification**: Clear attribution of messages with language badges
### User Experience
- **Undo/Redo**: Full history management with visual feedback
- **Grid System**: Precise alignment with customizable grid overlay
- **Responsive Design**: Optimized for various screen sizes
- **Keyboard Shortcuts**: Efficient workflow with hotkey support

## Installation
### Prerequisites
- **Python 3.13+**
- **[NPM (Docs here)](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)** - Node.js package manager
- **[UV (Docs here)](https://docs.astral.sh/uv/)** - Python package installer and resolver
- [Clone the Github Repository](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) using SSH
### Frontend Setup
*Requires [NPM to be properly installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).*
1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```
2. **Install Node.js dependencies**
   ```bash
   npm install
   ```
3. **Start the development server**
   ```bash
   npm run dev
   ```
*The frontend will be available at `http://localhost:5173`*

### Backend Setup
*Requires [Python UV to be properly installed](https://docs.astral.sh/uv/getting-started/installation/).*

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```
2. **Install Python dependencies**
   ```bash
   uv sync
   ```
3. **Start the FastAPI server**
   ```bash
   uv run main.py
   ```
*The backend will be available at `http://localhost:8000`*

## Development Workflow
1. **Follow the installation guide** above for the *React Client* and the *FastAPI Server*.
2. **Create and checkout a feature branch**:
   ```bash
   git branch [your_name]/your-feature-branch-name
   git switch [your_name]/your-feature-branch-name
   ```
2. **Make your changes** with good code style, linting with *Black* and *Prettier*.
3. **Test thoroughly**  checking manually to ensure proper stroke rendering and saving.
4. **Commit with clear messages**:
   ```bash
   git stage .
   git commit -m "feat: Added circle drawing tool"
   ```
5. **Push and create a Pull Request**, Main is protected and requires PRs for modification.

## Architecture
### Frontend Stack
- **React 19** with TypeScript for component architecture.
- **Zustand** for state management (board, editor, chat, cursor stores).
- **WebSockets** for real-time communication.
### Backend Stack
- **FastAPI** with Python 3.13 for high-performance API.
- **Pydantic** for data validation and serialization.
- **WebSocket** for real-time bidirectional communication.

## Project File Structure
```
polyboard/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   │   ├── whiteboard/  # Main drawing canvas
│   │   │   ├── toolspanel/  # Drawing tools sidebar
│   │   │   ├── chatpanel/   # Live chat interface
│   │   │   └── ...
│   │   ├── stores/          # Zustand state stores
│   │   ├── hooks/           # Custom React hooks
│   │   ├── strokes.ts       # Drawing stroke definitions
│   │   ├── rendering.ts     # Canvas rendering functions
│   │   └── geometry.ts      # Geometric calculations
│   └── package.json
├── backend/                 # FastAPI Python backend
│   ├── main.py              # FastAPI application entry
│   ├── board_store.py       # Board state models
│   ├── chat_store.py        # Chat state models
│   └── pyproject.toml       # Backend Project Configs
└── README.md
```

<br>

*Made with ❤️ by the Polyboard team*
