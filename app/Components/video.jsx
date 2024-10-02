"use client";
import { useEffect, useRef, useState } from "react";
import socket from "../sockets/socket";
import styles from "../VideoCall.module.css";
const VideoCall = () => {
  const [room, setRoom] = useState("12345");
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef(new RTCPeerConnection());
  const pendingCandidates = useRef([]); // Store pending ICE candidates

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        localVideoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    };

    getUserMedia();
  }, []); // This effect runs once when the component mounts

  useEffect(() => {
    if (!localStream) return; // Ensure localStream is available

    // Initialize peer connection settings
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate, room });
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      console.log("Remote track received:", event);
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // Handle user connection
    socket.on("user-connected", (userId) => {
      console.log("User connected:", userId);

      localStream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, localStream);
      });

      peerConnectionRef.current
        .createOffer()
        .then(async (offer) => {
          await peerConnectionRef.current.setLocalDescription(offer);
          socket.emit("offer", { offer, room });
        })
        .catch((error) => {
          console.error("Error creating offer:", error);
        });
    });

    // Handle incoming offers
    socket.on("offer", async (offer) => {
      console.log("Offer received:", offer);
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      localStream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, localStream);
      });

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer", { answer, room });
    });

    // Handle incoming answers
    socket.on("answer", async (answer) => {
      console.log("Answer received:", answer);
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      addPendingCandidates(); // Add any pending candidates after setting remote description
    });

    // Handle ICE candidates
    socket.on("ice-candidate", (candidate) => {
      console.log("ICE candidate received:", candidate);
      if (peerConnectionRef.current.remoteDescription) {
        peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } else {
        console.warn(
          "Remote description is not set yet, candidate will be added later."
        );
        pendingCandidates.current.push(candidate); // Store candidate for later
      }
    });

    const addPendingCandidates = () => {
      pendingCandidates.current.forEach((candidate) => {
        peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      });
      pendingCandidates.current = []; // Clear after adding
    };

    // Cleanup function to remove event listeners
    return () => {
      socket.off("user-connected");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [localStream, room]); // Only runs when localStream or room changes

  const joinRoom = () => {
    socket.emit("join", room);
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // Optional, based on your requirement
      });

      // Replace the existing video track with the screen track
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current
        .getSenders()
        .find((s) => s.track.kind === "video");

      if (sender) {
        await sender.replaceTrack(screenTrack);
      }

      // Optionally stop the screen share after it ends
      screenTrack.onended = () => {
        const localVideoTrack = localStream.getVideoTracks()[0];
        if (sender) {
          sender.replaceTrack(localVideoTrack); // Replace back with local video track
        }
      };

      localVideoRef.current.srcObject = screenStream; // Update local video display
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.roomInput}>
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Room ID"
          className={styles.input}
        />
        <button onClick={joinRoom} className={styles.button}>
          Join Room
        </button>
        <button onClick={startScreenShare} className={styles.button}>
          Share Screen
        </button>
      </div>
      <div className={styles.videoContainer}>
        <div className={styles.localVideoWrapper}>
          <h2>Local Video</h2>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className={styles.localVideo}
          />
        </div>
        <div className={styles.remoteVideoWrapper}>
          <h2>Remote Video</h2>
          <video ref={remoteVideoRef} autoPlay className={styles.remoteVideo} />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
