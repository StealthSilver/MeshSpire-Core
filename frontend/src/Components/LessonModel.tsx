"use client";
import React, { useState, useEffect } from "react";
import computerImg from "../assets/computer.png";
import englishImg from "../assets/emglish.png";
import mathsImg from "../assets/maths.png";
import scienceImg from "../assets/science.png";
import { useAuth } from "../Context/AuthContext";

interface LessonModelProps {
  topic: string;
  subject: string;
  time: string;
  onViewDetails: () => void;
  studentName?: string;

  showActions?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  isConfirmed?: boolean;
  isProcessing?: boolean;

  isPaid?: boolean;
  date?: string;
  lessonTime?: string;
  onStartMeeting?: () => void;
  onStartChat?: () => void;
  onEditLesson?: () => void;
  onDelete?: () => void;
  hasConfirmedTutors?: boolean;
}

const subjectImages: Record<string, string> = {
  Computer: computerImg,
  ComputerScience: computerImg,
  English: englishImg,
  Mathematics: mathsImg,
  Science: scienceImg,
};

const LessonModel: React.FC<LessonModelProps> = (props) => {
  const {
    topic,
    subject,
    onViewDetails,
    studentName,
    showActions = false,
    onConfirm,
    onCancel,
    isConfirmed,
    isProcessing = false,
    isPaid = false,
    date,
    lessonTime,
    onStartMeeting,
    onStartChat,
    onEditLesson,
    onDelete,
    hasConfirmedTutors = false,
  } = props;

  const [isMeetingTimeReached, setIsMeetingTimeReached] = useState(false);
  const { role } = useAuth();
  const [isExpired, setIsExpired] = useState(false);
  // Meeting Unlock Logic
  useEffect(() => {
    if (!date || !lessonTime) return;

    const checkTime = () => {
      const [hours, minutes] = lessonTime.split(":");
      const lessonDate = new Date(date);
      lessonDate.setHours(+hours, +minutes, 0, 0);

      const now = new Date();
      const tenMinBefore = new Date(lessonDate.getTime() - 10 * 60 * 1000);
      const end = new Date(lessonDate.getTime() + 5 * 60 * 1000);
      const expiredMeetingTime = new Date(lessonDate.getTime() + 5 * 60 * 1000);
      setIsMeetingTimeReached(now >= tenMinBefore && now <= end);
      setIsExpired(now > expiredMeetingTime);
    };

    checkTime();
    const interval = setInterval(checkTime, 30000);
    return () => clearInterval(interval);
  }, [date, lessonTime]);

  const imageSrc = subjectImages[subject] || mathsImg;

  // Format date and time for display
  const formatDateTime = () => {
    if (!date || !lessonTime) return null;

    const dateObj = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const formattedDate = dateObj.toLocaleDateString("en-US", options);

    // Convert 24h time to 12h format
    const [hours, minutes] = lessonTime.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    const formattedTime = `${displayHour}:${minutes} ${ampm}`;

    return { formattedTime, formattedDate };
  };

  const dateTime = formatDateTime();

  // Helper function to capitalize first letter of each word
  const toSentenceCase = (str: string) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div
      onClick={() => {
        // Make entire card clickable only for paid lessons
        if (isPaid) {
          onViewDetails();
        }
      }}
      className={`
      flex flex-col w-[280px] sm:w-[380px] md:w-[440px] h-[240px] sm:h-[260px] md:h-[280px]
      p-4 sm:p-5 rounded-xl
      backdrop-blur-lg shadow-lg hover:shadow-xl
      transition-all duration-300 relative
      border cursor-pointer
      ${
        isExpired && isPaid
          ? "bg-red-950/40 border-red-500/60 shadow-red-500/20 ring-2 ring-red-500/20"
          : hasConfirmedTutors && !isPaid
          ? "bg-emerald-950/40 border-emerald-500/60 shadow-emerald-500/20 ring-2 ring-emerald-500/20"
          : "bg-slate-900/60 border-white/20 hover:border-emerald-500/30"
      }
      `}
    >
      {/* Top Section - Image on right, Topic and Tutor on left */}
      <div className="flex items-start justify-between gap-4 mb-3">
        {/* Left side: Topic and Tutor Name */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-white leading-tight truncate">
            {toSentenceCase(topic)}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {studentName ? (
              role === "tutor" ? (
                <>Student: {toSentenceCase(studentName)}</>
              ) : (
                <>Tutor: {toSentenceCase(studentName)}</>
              )
            ) : isConfirmed ? (
              <span className="text-emerald-300">Tutor Confirmed</span>
            ) : !isPaid ? (
              <span className="text-amber-300">Awaiting Tutor</span>
            ) : null}
          </p>
        </div>

        {/* Right side: Image with delete button */}
        <div className="relative">
          <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-xl overflow-hidden shadow-lg ring-2 ring-white/5 flex-shrink-0">
            <img
              src={imageSrc}
              alt={subject}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Delete Button - Top right of image */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-900/80 hover:bg-red-800 
                         border border-red-500/50 hover:border-red-500/70 transition-all duration-200 
                         hover:scale-110 active:scale-95 group shadow-lg z-10"
              title="Delete lesson"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-200 group-hover:text-white transition-colors"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Subject Badge below image section */}
      <div className="mb-3">
        <span
          className="inline-block text-xs font-semibold text-emerald-200 bg-emerald-500/10
                      px-3 py-1.5 rounded-full border border-emerald-500/30"
        >
          {subject}
        </span>
      </div>

      {/* Date and Time - Readable format (Time first, then date) */}
      {dateTime && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-200 mb-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-emerald-400 flex-shrink-0"
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
            <span className="font-medium">{dateTime.formattedTime}</span>
          </div>
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-emerald-400 flex-shrink-0"
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
            <span className="font-medium">{dateTime.formattedDate}</span>
          </div>
        </div>
      )}

      {/* Buttons Section - Fixed at Bottom */}
      <div className="flex gap-2 mt-auto pt-3">
        {showActions ? (
          <>
            {/* Confirm / Cancel Buttons */}
            {!isConfirmed ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm?.();
                }}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold 
                           bg-gradient-to-r from-emerald-600 to-green-600
                           hover:from-emerald-500 hover:to-green-500
                           transition-all border border-emerald-500/20
                           shadow-md hover:shadow-emerald-500/30
                           disabled:opacity-50 disabled:cursor-not-allowed
                           active:scale-95"
              >
                {isProcessing ? "Processing..." : "Confirm"}
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel?.();
                }}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold 
                           bg-gradient-to-r from-red-600 to-red-700
                           hover:from-red-500 hover:to-red-600
                           transition-all border border-red-500/20
                           shadow-md hover:shadow-red-500/30
                           disabled:opacity-50 disabled:cursor-not-allowed
                           active:scale-95"
              >
                {isProcessing ? "Processing..." : "Cancel"}
              </button>
            )}

            {/* View Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="flex-1 py-2 rounded-lg text-white text-xs sm:text-sm font-semibold
                         bg-slate-700 hover:bg-slate-600 transition-all
                         border border-slate-500/20 shadow-md
                         active:scale-95"
            >
              View
            </button>
          </>
        ) : isPaid ? (
          <>
            {/* Confirmed Classes - Start Meeting and Chat */}
            {isExpired ? (
              <button
                disabled
                className="flex-1 py-2 rounded-lg text-white text-xs sm:text-sm font-semibold transition-all shadow-md
                  bg-gradient-to-r from-red-900/40 to-red-800/40 border border-red-500/30 cursor-not-allowed opacity-60"
              >
                Meeting Expired
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("🎯 Start Meeting clicked", {
                    isMeetingTimeReached,
                    date,
                    lessonTime,
                  });
                  if (!isMeetingTimeReached) {
                    alert(
                      "Meeting will be available 10 minutes before the scheduled time."
                    );
                    return;
                  }
                  console.log("✅ Calling onStartMeeting");
                  onStartMeeting?.();
                }}
                disabled={!isMeetingTimeReached}
                className={`flex-1 py-2 rounded-lg text-white text-xs sm:text-sm font-semibold transition-all shadow-md
                  ${
                    isMeetingTimeReached
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-500/20 active:scale-95 cursor-pointer"
                      : "bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-700/20 cursor-not-allowed opacity-40"
                  }`}
              >
                Start Meeting
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartChat?.();
              }}
              className="flex-1 py-2 rounded-lg text-white text-xs sm:text-sm font-semibold 
                        bg-slate-700 hover:bg-slate-600 
                        transition-all border border-slate-500/20 
                        shadow-md active:scale-95"
            >
              Chat
            </button>
          </>
        ) : (
          <>
            {/* Unpaid Lessons - Edit, View, and Pay buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isExpired) {
                  alert("Meeting expired");
                  return;
                }
                onEditLesson?.();
              }}
              className="flex-1 py-2 rounded-lg text-white text-xs sm:text-sm font-semibold transition-all
                  bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500
                  border border-slate-500/20 shadow-md active:scale-95"
            >
              Edit
            </button>

            {/* View Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="flex-1 py-2 rounded-lg text-white text-xs sm:text-sm font-semibold
                         bg-slate-700 hover:bg-slate-600 transition-all
                         border border-slate-500/20 shadow-md active:scale-95"
            >
              View
            </button>

            {/* Pay Button - Show for unpaid with confirmed tutors */}
            {hasConfirmedTutors && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(); // Opens modal where they can pay
                }}
                className="flex-1 py-2 rounded-lg text-white text-xs sm:text-sm font-semibold 
                          bg-gradient-to-r from-emerald-600 to-green-600 
                          hover:from-emerald-500 hover:to-green-500 
                          transition-all border border-emerald-500/20 
                          shadow-md hover:shadow-emerald-500/30 active:scale-95"
              >
                Pay
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LessonModel;
