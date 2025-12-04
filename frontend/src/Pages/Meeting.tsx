"use client";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
    navigate(`/room/${randomId}`, {
      state: { ...cardData, autoSendVideo: true },
    });
  };

  const joinMeeting = () => {
    if (roomId.trim() !== "") {
      navigate(`/room/${roomId}`, {
        state: { ...cardData, autoSendVideo: true },
      });
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
    <div className="h-full bg-black text-white w-full overflow-x-hidden flex flex-col">
      <main className="flex-1 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300 flex items-center justify-center">
        <div className="flex flex-col xl:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12 xl:gap-16 max-w-7xl w-full">
          {/* LEFT CONTENT */}
          <div className="flex flex-col space-y-4 sm:space-y-5 lg:space-y-6 w-full xl:max-w-lg text-center xl:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
              {cardData.title}
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-2 sm:gap-3 text-gray-300">
              <span className="text-sm sm:text-base lg:text-lg font-medium">
                {cardData.category}
              </span>
              {renderStars(cardData.rating)}
            </div>

            <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-md mx-auto xl:mx-0">
              Start a new meeting instantly or join an existing one using a Room
              ID.
            </p>

            {/* BUTTONS & INPUT */}
            <div className="flex flex-col lg:flex-row items-center gap-3 sm:gap-4 w-full">
              <button
                onClick={startMeeting}
                className="w-full lg:w-auto px-6 sm:px-8 lg:px-10 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-violet-900 via-violet-800 to-violet-900 hover:from-violet-800 hover:to-violet-700 rounded-xl lg:rounded-2xl font-semibold shadow-lg text-sm sm:text-base lg:text-lg transition-all duration-200"
              >
                Start Meeting
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:flex-1">
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") joinMeeting();
                   }}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl lg:rounded-2xl text-white bg-slate-900/70 border border-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-700 w-full text-sm sm:text-base"
                />

                <button
                  onClick={joinMeeting}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-green-700 via-green-600 to-green-700 hover:from-green-600 hover:to-green-500 rounded-xl lg:rounded-2xl font-semibold shadow-lg text-sm sm:text-base lg:text-lg transition-all duration-200"
                >
                  Join
                </button>
              </div>
            </div>

            {/* ROOM LINK */}
            {roomURL && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 lg:p-6 w-full bg-slate-900/60 border border-white/10 rounded-xl lg:rounded-2xl shadow-lg flex flex-col gap-3">
                <p className="text-green-400 text-sm sm:text-base lg:text-lg font-medium">
                  Share this link to invite others:
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                  <input
                    type="text"
                    value={roomURL}
                    readOnly
                    className="flex-1 px-3 sm:px-4 py-2 rounded-lg lg:rounded-xl text-white bg-gray-800 border border-gray-700 focus:outline-none w-full text-xs sm:text-sm lg:text-base"
                  />
                  <button
                    onClick={copyURL}
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg lg:rounded-xl font-semibold transition-all duration-200 w-full sm:w-auto text-xs sm:text-sm lg:text-base"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT CONTENT - VIDEO */}
          <div className="w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-[400px] 2xl:w-[500px] aspect-video rounded-xl lg:rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-lg lg:rounded-xl"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Meeting;
