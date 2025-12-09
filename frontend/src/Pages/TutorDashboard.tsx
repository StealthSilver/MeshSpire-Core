import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LessonModel from "../Components/LessonModel";
import LessonCarousel from "../Components/LessonCarousel";
import { getRelevantLessons, confirmLesson, cancelLesson } from "../api";
import { useAuth } from "../Context/AuthContext";

const TutorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [relevantLessons, setRelevantLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDetails, setOpenDetails] = useState<any>(null);
  const [processingLessonId, setProcessingLessonId] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchRelevantLessons();
  }, []);

  const fetchRelevantLessons = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching relevant lessons...");
      const data = await getRelevantLessons();
      console.log("✅ Relevant lessons received:", data);
      console.log("   Lessons count:", data.length);
      if (data.length > 0) {
        console.log("   First lesson:", data[0]);
      }
      setRelevantLessons(data);
    } catch (error: any) {
      console.error("❌ Error fetching relevant lessons:", error);
      if (error.response) {
        console.error("   Response status:", error.response.status);
        console.error("   Response data:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLesson = async (lessonId: string) => {
    try {
      setProcessingLessonId(lessonId);
      const response = await confirmLesson(lessonId);
      console.log("✅ Lesson confirmed, full response:", response);
      console.log("✅ Confirmed tutors:", response.lesson?.confirmedTutors);

      // Update the local state immediately with the confirmed lesson
      setRelevantLessons((prev) =>
        prev.map((lesson) =>
          lesson._id === lessonId
            ? { ...lesson, confirmedTutors: response.lesson.confirmedTutors }
            : lesson
        )
      );

      console.log("✅ Local state updated for lesson:", lessonId);
    } catch (error: any) {
      console.error("❌ Error confirming lesson:", error);
      alert(
        error.response?.data?.message ||
          "Failed to confirm lesson. Please try again."
      );
    } finally {
      setProcessingLessonId(null);
    }
  };
  const handleCancelLesson = async (lessonId: string) => {
    try {
      setProcessingLessonId(lessonId);
      const response = await cancelLesson(lessonId);
      console.log("✅ Lesson cancelled, response:", response);

      // Update the local state to remove the tutor from confirmedTutors
      setRelevantLessons((prev) =>
        prev.map((lesson) =>
          lesson._id === lessonId
            ? {
                ...lesson,
                confirmedTutors: response.lesson.confirmedTutors || [],
              }
            : lesson
        )
      );
    } catch (error: any) {
      console.error("❌ Error cancelling lesson:", error);
      alert(
        error.response?.data?.message ||
          "Failed to cancel lesson. Please try again."
      );
    } finally {
      setProcessingLessonId(null);
    }
  };

  const isLessonConfirmedByCurrentUser = (lesson: any): boolean => {
    if (!userId) return false;
    return lesson.confirmedTutors?.some(
      (ct: any) => ct.tutorId?._id === userId || ct.tutorId === userId
    );
  };

  const handleStartMeeting = (lesson: any) => {
    const randomId = Math.random().toString(36).substring(2, 10);
    navigate(`/room/${randomId}`, {
      state: {
        title: lesson.topic,
        category: lesson.subject,
        rating: 5,
        autoSendVideo: true,
      },
    });
  };

  // Separate paid and unpaid lessons
  const unpaidLessons = relevantLessons.filter((lesson) => !lesson.isPaid);
  const paidLessons = relevantLessons.filter((lesson) => lesson.isPaid);

  return (
    <div className="bg-black text-white flex flex-col w-full overflow-x-hidden min-h-screen">
      <main className="px-4 sm:px-6 py-6 sm:py-8">
        {/* Relevant Classes Section */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center sm:text-left">
            Relevant Classes
          </h1>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : unpaidLessons.length > 0 ? (
            <LessonCarousel>
              {unpaidLessons.map((lesson, index) => (
                <LessonModel
                  key={lesson._id || index}
                  topic={lesson.topic}
                  subject={lesson.subject}
                  time={`${lesson.date} • ${lesson.time}`}
                  studentName={lesson.studentId?.name || "Unknown Student"}
                  onViewDetails={() => {
                    console.log(
                      "Tutor view details clicked for lesson:",
                      lesson
                    );
                    setOpenDetails(lesson);
                  }}
                  showActions={true}
                  onConfirm={() => handleConfirmLesson(lesson._id)}
                  onCancel={() => handleCancelLesson(lesson._id)}
                  isConfirmed={isLessonConfirmedByCurrentUser(lesson)}
                  isProcessing={processingLessonId === lesson._id}
                  isPaid={false}
                  date={lesson.date}
                  lessonTime={lesson.time}
                />
              ))}
            </LessonCarousel>
          ) : (
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-gray-400 text-lg">
                No relevant lessons found. Students haven't created any lessons
                matching your subjects yet.
              </p>
            </div>
          )}
        </div>

        {/* Confirmed Classes Section for Tutors */}
        {!loading && paidLessons.length > 0 && (
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center sm:text-left">
              Confirmed Classes
            </h1>
            <LessonCarousel>
              {paidLessons.map((lesson, index) => (
                <LessonModel
                  key={lesson._id || index}
                  topic={lesson.topic}
                  subject={lesson.subject}
                  time={`${lesson.date} • ${lesson.time}`}
                  studentName={lesson.studentId?.name || "Unknown Student"}
                  onViewDetails={() => {
                    console.log(
                      "Tutor view details clicked for paid lesson:",
                      lesson
                    );
                    setOpenDetails(lesson);
                  }}
                  showActions={false}
                  isPaid={true}
                  date={lesson.date}
                  lessonTime={lesson.time}
                  onStartMeeting={() => handleStartMeeting(lesson)}
                />
              ))}
            </LessonCarousel>
          </div>
        )}

        <div className="mt-10 flex justify-center sm:justify-start">
          <a
            href={`${window.location.origin}/tutor/${userId}`}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-900 via-violet-800 to-violet-900 hover:from-violet-800 hover:to-violet-700 transition-all font-semibold text-sm shadow-lg"
            target="_blank"
          >
            Share Public Profile
          </a>
        </div>
      </main>

      {openDetails && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[9999] px-4"
          onClick={() => {
            console.log("Tutor modal overlay clicked, closing...");
            setOpenDetails(null);
          }}
        >
          <div
            className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl w-full sm:w-[480px] space-y-5 shadow-2xl border border-violet-500/20"
            onClick={(e) => {
              console.log("Tutor modal content clicked");
              e.stopPropagation();
            }}
          >
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {openDetails.topic}
              </h2>
              {openDetails.subject && (
                <span className="text-xs font-semibold text-violet-200 border border-violet-400/40 px-3 py-1 rounded-full bg-violet-500/10">
                  {openDetails.subject}
                </span>
              )}
            </div>

            {openDetails.subTopic && (
              <p className="text-gray-300 text-base">
                <span className="font-semibold text-violet-300">
                  Sub Topic:
                </span>{" "}
                {openDetails.subTopic}
              </p>
            )}

            <div className="space-y-2 bg-slate-800/50 p-4 rounded-xl border border-white/5">
              <p className="text-gray-300">
                <span className="font-semibold text-violet-300">Student:</span>{" "}
                {openDetails.studentId?.name || "Unknown"}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold text-violet-300">Class:</span>{" "}
                {openDetails.class}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold text-violet-300">Date:</span>{" "}
                {openDetails.date}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold text-violet-300">Time:</span>{" "}
                {openDetails.time}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold text-violet-300">Status:</span>{" "}
                <span
                  className={`font-semibold ${
                    openDetails.isPaid
                      ? "text-green-400"
                      : isLessonConfirmedByCurrentUser(openDetails)
                      ? "text-green-500"
                      : "text-red-400"
                  }`}
                >
                  {openDetails.isPaid
                    ? "Paid & Scheduled"
                    : isLessonConfirmedByCurrentUser(openDetails)
                    ? "Confirmed (awaiting payment)"
                    : "Not Confirmed yet "}
                </span>
              </p>
            </div>

            <button
              onClick={() => setOpenDetails(null)}
              className="w-full mt-4 bg-gradient-to-r from-violet-600 to-purple-600 
                       hover:from-violet-500 hover:to-purple-500 transition-all duration-300 
                       px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-violet-500/50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDashboard;
