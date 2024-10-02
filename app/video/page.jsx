"use client";
import { useEffect, useRef, useState } from "react";
import socket from "../sockets/socket";

const VideoCall = () => {
  const [room, setRoom] = useState("12345");
  const [localStream, setLocalStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef(new RTCPeerConnection());
  const pendingCandidates = useRef([]);

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
  }, []);

  useEffect(() => {
    if (!localStream) return;

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate, room });
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      const stream = event.streams[0];
      remoteVideoRef.current.srcObject = stream; // Handle regular video
    };

    const addPendingCandidates = () => {
      pendingCandidates.current.forEach((candidate) => {
        peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      });
      pendingCandidates.current = []; // Clear after adding
    };

    socket.on("user-connected", async (userId) => {
      localStream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, localStream);
      });

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit("offer", { offer, room });
      setIsCallActive(true);
    });

    socket.on("offer", async (offer) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      localStream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, localStream);
      });

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer", { answer, room });
      setIsCallActive(true);
    });

    socket.on("answer", async (answer) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      addPendingCandidates(); // Now correctly defined in scope
    });

    socket.on("ice-candidate", (candidate) => {
      if (peerConnectionRef.current.remoteDescription) {
        peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } else {
        pendingCandidates.current.push(candidate);
      }
    });

    socket.on("call-ended", () => {
      alert("The call has ended."); // Notify user
      endCall(); // Clean up call state
    });

    return () => {
      socket.off("user-connected");
      socket.off("offer");
      socket.off("answer");
      socket.off("call-ended");
      socket.off("ice-candidate");
    };
  }, [localStream, room]);

  const joinRoom = () => {
    socket.emit("join", room);
  };

  const endCall = () => {
    localStream.getTracks().forEach((track) => track.stop());
    peerConnectionRef.current.close();
    socket.emit("end-call", room);
    setIsCallActive(false);
    setLocalStream(null);
  };

  const toggleMute = () => {
    localStream.getAudioTracks()[0].enabled = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    localStream.getVideoTracks()[0].enabled = !isCameraOff;
    setIsCameraOff(!isCameraOff);
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

  const stopScreenShare = () => {
    const localVideoTrack = localStream.getVideoTracks()[0];
    const sender = peerConnectionRef.current
      .getSenders()
      .find((s) => s.track.kind === "video");

    if (sender) {
      sender.replaceTrack(localVideoTrack); // Replace back with local video track
      localVideoRef.current.srcObject = localStream; // Update local video display
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-4">Video Call</h1>

        <div className="relative w-full mb-4 bg-gray-200 rounded-lg">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className=" w-full h-[200px] object-contain rounded-lg"
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            className=" w-full h-[200px] object-contain rounded-lg"
          />
        </div>

        {!isCallActive ? (
          <div className="flex justify-center mb-4">
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Room ID"
              className="p-2 border border-gray-300 rounded"
            />
            <button
              onClick={joinRoom}
              className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Join
            </button>
          </div>
        ) : (
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <span className="font-semibold mr-2">You</span>
              <button
                onClick={toggleCamera}
                className="p-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                {isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
              </button>
              <button
                onClick={toggleMute}
                className="ml-2 p-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>
            </div>
          </div>
        )}
        <button
          onClick={startScreenShare}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Share Screen
        </button>
        <button
          onClick={stopScreenShare}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Stop Screen
        </button>
        <div className="flex justify-center space-x-4">
          <button
            onClick={endCall}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            End Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
