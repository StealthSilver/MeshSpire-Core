"use client";
import React, { useState, useEffect } from "react";
import calculus from "../assets/calculus.png";
import quantum from "../assets/quantum-computing.png";
import ComputerScience from "../assets/python.png";
import Probability from "../assets/probablity.png";
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
  onEditLesson?: () => void;
  onDelete?: () => void;
  hasConfirmedTutors?: boolean;
}

const subjectImages: Record<string, string> = {
  Mathematics: calculus,
  Science: quantum,
  English: Probability,
  ComputerScience: ComputerScience,
};

const LessonModel: React.FC<LessonModelProps> = (props) => {
  const {
    topic,
    subject,
    time,
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
    onEditLesson,
    onDelete,
    hasConfirmedTutors = false,
  } = props;

  const [isMeetingTimeReached, setIsMeetingTimeReached] = useState(false);
  const { role } = useAuth();

  // Meeting Unlock Logic
  useEffect(() => {
    if (!date || !lessonTime) return;

    const checkTime = () => {
      const [hours, minutes] = lessonTime.split(":");
      const lessonDate = new Date(date);
      lessonDate.setHours(+hours, +minutes, 0, 0);

      const now = new Date();
      const tenMinBefore = new Date(lessonDate.getTime() - 10 * 60 * 1000);
      const end = new Date(lessonDate.getTime() + 60 * 60 * 1000);

      setIsMeetingTimeReached(now >= tenMinBefore && now <= end);
    };

    checkTime();
    const interval = setInterval(checkTime, 30000);
    return () => clearInterval(interval);
  }, [date, lessonTime]);

  const imageSrc = subjectImages[subject] || Probability;

  return (
    <div
      className={`
      flex flex-col w-[260px] sm:w-[380px] md:w-[480px]
      p-4 sm:p-6 rounded-2xl
      backdrop-blur-lg bg-slate-900/60 shadow-lg hover:shadow-xl
      transition-all duration-300 relative
      ${
        hasConfirmedTutors && !isPaid
          ? "border-2 border-green-500/60 shadow-green-500/20"
          : "border border-white/20"
      }
      `}
    >
      {/* Delete Button - Top Left */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-3 left-3 p-2 rounded-full bg-red-900/40 hover:bg-red-800/60 
                     border border-red-500/30 transition-all duration-200 hover:scale-110 z-10"
          title="Delete lesson"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}

      {/* Top Section */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-28 sm:w-32 md:w-40 rounded-xl overflow-hidden shadow-md">
          <img
            src={imageSrc}
            alt={subject}
            className="w-full h-full object-cover"
          />
        </div>
        <p
          className="text-right text-sm font-semibold text-violet-300 bg-violet-900/30
                      px-3 py-1 rounded-full border border-violet-400/20"
        >
          {subject}
        </p>
      </div>

      {/* Topic */}
      <h2 className="mt-3 text-xl font-semibold text-white">{topic}</h2>

      {/* Student / Instructor */}
      <p className="text-sm text-gray-300 mt-1">
        {studentName ? (
          role === "tutor" ? (
            <>
              👤 Student: <span className="text-white">{studentName}</span>
            </>
          ) : (
            <>
              👤 Instructor: <span className="text-white">{studentName}</span>
            </>
          )
        ) : isConfirmed ? (
          <span className="text-green-300">Tutor Confirmed ✅</span>
        ) : (
          <span className="text-red-300"></span>
        )}
      </p>

      {/* Time */}
      <div
        className="mt-3 flex items-center gap-2 text-sm text-gray-300 
                      bg-slate-800/40 px-3 py-2 rounded-lg border border-white/10"
      >
        🕒 {time}
      </div>

      {/* Payment */}
      {isPaid && (
        <div
          className="mt-2 text-sm text-green-300 bg-green-900/30 px-3 py-2 rounded-lg
                        border border-green-500/20"
        >
          ✓ Payment Confirmed
        </div>
      )}

      {/* Tutor Confirmed Badge */}
      {hasConfirmedTutors && !isPaid && (
        <div
          className="mt-2 text-sm text-green-300 bg-green-900/30 px-3 py-2 rounded-lg
                        border border-green-500/20 flex items-center gap-2"
        >
          <span className="text-green-400 text-lg">✓</span>
          <span>Tutor Confirmed - Awaiting Payment</span>
        </div>
      )}

      {/* Buttons Section */}
      <div className="mt-5 flex gap-3 relative">
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
                className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold 
                           bg-green-700 hover:bg-green-600 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold 
                           bg-red-700 hover:bg-red-600 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="flex-1 py-2 rounded-xl text-white font-medium
                         bg-gray-800 hover:bg-gray-900 transition-all"
            >
              View
            </button>
          </>
        ) : (
          <>
            {isPaid && isMeetingTimeReached ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartMeeting?.();
                }}
                disabled={!isPaid || !isMeetingTimeReached}
                className={`flex-1 py-2 rounded-xl text-white font-medium transition-all
                ${
                  isPaid && isMeetingTimeReached
                    ? "bg-gradient-to-r from-violet-900 via-violet-800 to-violet-900 hover:opacity-90"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
                }`}
              >
                Start
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditLesson?.();
                }}
                className={`flex-1 py-2 rounded-xl text-white font-medium transition-all
                    bg-gradient-to-r from-violet-900 via-violet-800 to-violet-900 hover:opacity-90
                  `}
              >
                Edit
              </button>
            )}

            {/* Gray View */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="flex-1 py-2 rounded-xl text-white font-medium
                         bg-gray-800 hover:bg-gray-900 transition-all"
            >
              View
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonModel;
