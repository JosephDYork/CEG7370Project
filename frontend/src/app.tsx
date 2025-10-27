import Header from './components/header/header';
import Whiteboard from './components/whiteboard/whiteboard';
import ToolsPanel from './components/toolspanel/toolspanel';
import ChatPanel from './components/chatpanel/chatpanel';
import Footer from './components/footer/footer';

import './app.css';

function App() {
  return (
    <div className="App">
      <Header height='4.5rem'/>
      <div className="main-content">
        <ToolsPanel width='15%' />
        <Whiteboard />
        <ChatPanel  width='20%' />
      </div>
      <Footer height='2rem' />
    </div>
  );
}

export default App;
