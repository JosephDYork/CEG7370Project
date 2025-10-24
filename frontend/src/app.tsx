import React from 'react';
import Header from './components/header';
import Whiteboard from './components/whiteboard';
import ToolsPanel from './components/toolsPanel';
import ChatPanel from './components/chatpanel';
import Footer from './components/footer';

import './app.css';

function App() {
  return (
    <div className="App">
      <Header width='100dvw' height='4.5rem'/>
      <div style={{ display: 'flex' }}>
        <ChatPanel  width='15dvw' height='90dvh' />
        <Whiteboard width='70dvw' height='90dvh' />
        <ToolsPanel width='15dvw' height='90dvh'/>
      </div>
      <Footer width='100dvw' height='1dvh' />
    </div>
  );
}

export default App;
