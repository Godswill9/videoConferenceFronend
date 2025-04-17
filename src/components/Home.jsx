// src/components/Home.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const handleJoin = () => {
    if (roomId.trim()) navigate(`/room/${roomId}`);
  };

  const handleCreate = () => {
    const id = uuidv4();
    navigate(`/room/${id}`);
  };

  return (
    <div className="home-container">
      <h1>Welcome to Zoom Lite</h1>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={handleJoin}>Join Room</button>
      <button onClick={handleCreate}>Create New Room</button>
    </div>
  );
};

export default Home;
