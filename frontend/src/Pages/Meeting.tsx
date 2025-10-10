"use client";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";

const Meeting: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [roomId, setRoomId] = useState<string>("");
  const [roomURL, setRoomURL] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [, setIsCameraOn] = useState(false);

  const cardData = location.state || {
    title: "Untitled Meeting",
    category: "General",
    rating: 4.5,
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startVideo = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraOn(true);
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setIsCameraOn(false);
      }
    };

    startVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
        setIsCameraOn(false);
      }
    };
  }, [location.pathname]);

  const startMeeting = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    const url = `${window.location.origin}/room/${randomId}`;
    setRoomId(randomId);
    setRoomURL(url);
    navigate(`/room/${randomId}`, { state: cardData });
  };

  const joinMeeting = () => {
    if (roomId.trim() !== "") {
      navigate(`/room/${roomId}`, { state: cardData });
    } else {
      alert("Please enter a Room ID");
    }
  };

  const copyURL = () => {
    if (roomURL) navigator.clipboard.writeText(roomURL);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <div className="flex items-center space-x-1">
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <span key={`full-${i}`} className="text-yellow-400 text-lg">
              ★
            </span>
          ))}
        {halfStar && <span className="text-yellow-400 text-lg">☆</span>}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <span key={`empty-${i}`} className="text-gray-500 text-lg">
              ★
            </span>
          ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar />
      <div className="ml-20">
        <Navbar isSidebarExpanded={true} />
      </div>

      <div className="flex flex-1">
        <main className="flex-1 flex items-center justify-center bg-gray-950 px-6 py-10">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-16 w-full max-w-6xl">
            <div className="flex flex-col items-start text-left space-y-6">
              <h1 className="text-5xl font-bold text-white">
                {cardData.title}
              </h1>

              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-lg font-medium">{cardData.category}</span>
                {renderStars(cardData.rating)}
              </div>

              <p className="text-gray-400 text-lg max-w-md">
                Start a new meeting instantly or join an existing one using a
                Room ID.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={startMeeting}
                  className="px-8 py-4 bg-gradient-to-r from-violet-900 via-violet-800 to-violet-900 
          hover:from-violet-800 hover:to-violet-700 transition-all duration-300 
          rounded-2xl font-semibold shadow-lg text-lg"
                >
                  Start Meeting
                </button>
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="px-4 py-3 rounded-2xl text-white bg-slate-900/70 border border-white/10 
          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-700 w-full sm:w-64"
                />
                <button
                  onClick={joinMeeting}
                  className="px-8 py-3 bg-gradient-to-r from-green-700 via-green-600 to-green-700 
          hover:from-green-600 hover:to-green-500 transition-all duration-300 
          rounded-2xl font-semibold shadow-lg w-full sm:w-auto"
                >
                  Join
                </button>
              </div>

              {roomURL && (
                <div className="mt-6 flex flex-col items-start gap-3 bg-slate-900/60 border border-white/10 rounded-2xl p-6 shadow-lg">
                  <p className="text-green-400 text-lg font-medium">
                    Share this link to invite others:
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={roomURL}
                      readOnly
                      className="px-4 py-2 rounded-xl text-white bg-gray-800 border border-gray-700 w-80 focus:outline-none"
                    />
                    <button
                      onClick={copyURL}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 
              hover:from-green-500 hover:to-green-400 transition-all duration-300 rounded-xl font-semibold"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full max-w-md aspect-video rounded-2xl overflow-hidden border border-white/10 bg-slate-900/80 shadow-xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Meeting;
