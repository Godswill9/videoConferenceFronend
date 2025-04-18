// src/components/Room.jsx
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { io } from "socket.io-client";
import socket from "../socket"; // 👈 import singleton


const Room = () => {
  const { roomId } = useParams();
  const [stream, setStream] = useState(null);
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }

      socket.emit("join-room", roomId);

      socket.on("user-joined", (userId) => {
        console.log("User joined:", userId);
        const peer = createPeer(userId, socket.id, currentStream);
        peerRef.current = peer;
      });

      socket.on("signal", ({ from, data }) => {
        if (!peerRef.current) {
          const peer = addPeer(data, from, currentStream);
          peerRef.current = peer;
        } else {
          peerRef.current.signal(data);
        }
      });

      socket.on("user-left", () => {
        console.log("Peer disconnected");
        if (userVideo.current) {
          userVideo.current.srcObject = null;
        }
        if (peerRef.current) {
          peerRef.current.destroy();
          peerRef.current = null;
        }
      });
    });

    return () => {
      // Cleanup on unmount
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      socket.off("user-joined");
      socket.off("signal");
      socket.off("user-left");
    };
  }, [roomId]);

  const createPeer = (userToSignal, callerId, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("signal", {
        to: userToSignal,
        from: callerId,
        data: signal,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    return peer;
  };

  const addPeer = (incomingSignal, from, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("signal", {
        to: from,
        from: socket.id,
        data: signal,
      });
    });

    peer.signal(incomingSignal);

    peer.on("stream", (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    return peer;
  };

  return (
    <div style={styles.roomContainer}>
      <div style={styles.videoSection}>
        <div>
          <h3>You</h3>
          <video ref={myVideo} autoPlay muted playsInline style={styles.videoBox} />
        </div>
        <div>
          <h3>Peer</h3>
          <video ref={userVideo} autoPlay playsInline style={styles.videoBox} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  roomContainer: {
    display: "flex",
    height: "100vh",
    background: "#f0f0f0",
  },
  videoSection: {
    flex: 1,
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    background: "#333",
  },
  videoBox: {
    width: "500px",
    height: "375px",
    background: "#000",
    borderRadius: "10px",
  },
};

export default Room;
