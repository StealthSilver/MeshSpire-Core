"use client";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Meeting: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as any;

  // Pre-fill room ID if coming from a scheduled lesson
  const [roomId, setRoomId] = useState<string>(locationState?.roomId || "");
  const [roomURL, setRoomURL] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [, setIsCameraOn] = useState(false);

  const cardData = location.state || {
    title: "Untitled Meeting",
    category: "General",
    rating: 4.5,
  };

  // Check if this is a scheduled lesson meeting
  const isScheduledLesson = locationState?.lessonId && locationState?.autoJoin;

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
    // Use existing roomId if available (scheduled lesson), otherwise generate random
    const meetingRoomId = roomId || Math.random().toString(36).substring(2, 10);
    const url = `${window.location.origin}/room/${meetingRoomId}`;

    if (!roomId) {
      setRoomId(meetingRoomId);
    }
    setRoomURL(url);

    navigate(`/room/${meetingRoomId}`, {
      state: { ...cardData, autoSendVideo: true },
    });
  };

  const joinMeeting = () => {
    const meetingRoomId = roomId.trim();
    if (meetingRoomId !== "") {
      navigate(`/room/${meetingRoomId}`, {
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
    <div className="bg-black text-white w-full overflow-x-hidden flex flex-col h-screen">
      <main className="flex-1 py-4 px-4 sm:py-8 sm:px-8 transition-all duration-300 flex items-center justify-center overflow-y-auto">
        <div className="flex flex-col xl:flex-row items-center justify-center gap-8 lg:gap-12 max-w-7xl w-full">
          {/* LEFT CONTENT */}
          <div className="flex flex-col space-y-6 w-full xl:max-w-lg text-center xl:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
              {cardData.title}
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-2 sm:gap-3 text-gray-300">
              <span className="text-sm sm:text-base lg:text-lg font-medium">
                {cardData.category}
              </span>
              {renderStars(cardData.rating)}
            </div>

            {/* Show lesson details if it's a scheduled lesson */}
            {isScheduledLesson &&
              locationState?.date &&
              locationState?.time && (
                <div className="bg-gradient-to-b from-emerald-900/30 to-slate-900/30 backdrop-blur-xl border border-emerald-500/30 rounded-xl p-4 space-y-2">
                  <p className="text-emerald-300 text-sm font-semibold">
                    Scheduled Lesson
                  </p>
                  <div className="flex flex-col gap-1 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {new Date(locationState.date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{locationState.time}</span>
                    </div>
                    {locationState.studentName && (
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-emerald-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>Student: {locationState.studentName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-md mx-auto xl:mx-0">
              {isScheduledLesson
                ? "Click 'Start Class' below to begin your scheduled lesson."
                : "Start a new meeting instantly or join an existing one using a Room ID."}
            </p>

            {/* BUTTONS & INPUT */}
            <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
              {isScheduledLesson ? (
                /* For scheduled lessons, show single Start Class button */
                <button
                  onClick={startMeeting}
                  className="w-full px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl font-semibold shadow-lg transition-all duration-300 border border-emerald-500/20"
                >
                  Start Class
                </button>
              ) : (
                /* For regular meetings, show original interface */
                <>
                  <button
                    onClick={startMeeting}
                    className="w-full lg:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl font-semibold shadow-lg transition-all duration-300 border border-emerald-500/20"
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
                        if (e.key === "Enter") {
                          joinMeeting();
                        }
                      }}
                      className="flex-1 px-4 py-3 rounded-xl text-white bg-slate-900/70 border border-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                    />

                    <button
                      onClick={joinMeeting}
                      className="w-full sm:w-auto px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold shadow-lg transition-all duration-300 border border-slate-600/20"
                    >
                      Join
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* ROOM LINK - Hide for scheduled lessons */}
            {roomURL && !isScheduledLesson && (
              <div className="mt-6 p-6 w-full bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl flex flex-col gap-3">
                <p className="text-emerald-400 text-base lg:text-lg font-medium">
                  Share this link to invite others:
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                  <input
                    type="text"
                    value={roomURL}
                    readOnly
                    className="flex-1 px-4 py-2 rounded-xl text-white bg-slate-800 border border-slate-700 focus:outline-none w-full"
                  />
                  <button
                    onClick={copyURL}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl font-semibold transition-all duration-300 w-full sm:w-auto border border-emerald-500/20"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT CONTENT - VIDEO */}
          <div className="w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-[500px] aspect-video rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Meeting;
