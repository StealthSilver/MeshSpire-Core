import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import { PeerProvider } from "./contexts/PeerContext";
import { Home } from "./pages/Home";
import { Room } from "./pages/Room";

function App() {
  return (
    <Router>
      <SocketProvider>
        <PeerProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </Router>
  );
}

export default App;
