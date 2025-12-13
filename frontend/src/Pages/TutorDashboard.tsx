import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LessonModel from "../Components/LessonModel";
import LessonCarousel from "../Components/LessonCarousel";
import {
  getRelevantLessons,
  confirmLesson,
  cancelLesson,
  deleteLesson,
} from "../api";
import { ensureConversation } from "../api/chat";
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
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    lessonId: string | null;
    lessonTitle: string;
  }>({ show: false, lessonId: null, lessonTitle: "" });

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

  const isLessonExpired = (lesson: any): boolean => {
    if (!lesson.date || !lesson.time) return false;

    const [hours, minutes] = lesson.time.split(":");
    const lessonDate = new Date(lesson.date);
    lessonDate.setHours(+hours, +minutes, 0, 0);

    const now = new Date();
    return now > lessonDate;
  };

  const handleDeleteLesson = (lessonId: string, lessonTitle: string) => {
    setDeleteConfirmation({
      show: true,
      lessonId,
      lessonTitle,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.lessonId) return;

    try {
      await deleteLesson(deleteConfirmation.lessonId);
      await fetchRelevantLessons();
      setDeleteConfirmation({ show: false, lessonId: null, lessonTitle: "" });
      alert("Lesson deleted successfully");
    } catch (error: any) {
      console.error("Error deleting lesson:", error);
      alert(
        error.response?.data?.message ||
          "Failed to delete lesson. Please try again."
      );
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, lessonId: null, lessonTitle: "" });
  };

  const handleStartMeeting = (lesson: any) => {
    console.log("🚀 TutorDashboard: handleStartMeeting called", lesson);
    // Use lesson ID as room ID to ensure both student and tutor join the same room
    const roomId = `lesson-${lesson._id}`;
    console.log("📍 Navigating to meeting page with roomId:", roomId);
    navigate(`/meeting`, {
      state: {
        lessonId: lesson._id,
        roomId: roomId,
        title: lesson.topic,
        category: lesson.subject,
        rating: 5,
        date: lesson.date,
        time: lesson.time,
        studentName: lesson.studentId?.name || "Unknown Student",
        autoJoin: true,
      },
    });
  };

  const handleStartChat = async (lesson: any) => {
    const currentUserId = userId;
    if (!currentUserId) {
      alert("You must be logged in to start a chat.");
      return;
    }

    try {
      console.log("🚀 Starting chat for lesson:", lesson);

      const studentId =
        typeof lesson.studentId === "object"
          ? lesson.studentId._id
          : lesson.studentId;

      console.log("📝 Extracted studentId:", studentId);

      if (!studentId) {
        alert("Student information is not available. Please try again.");
        return;
      }

      console.log(
        "📞 Creating conversation for lesson:",
        lesson._id,
        "with student:",
        studentId
      );

      const conversation = await ensureConversation({
        lessonId: lesson._id,
        tutorId: currentUserId,
      });

      console.log("✅ Conversation created/found:", conversation);

      navigate("/tutor-dashboard/chat", {
        state: { conversationId: conversation._id },
      });
    } catch (e: any) {
      console.error("❌ Error starting chat:", e);
      console.error("❌ Error response:", e.response);
      console.error("❌ Error details:", e.response?.data || e.message);

      const errorMessage =
        e.response?.data?.message || e.message || "Unknown error";
      console.error("❌ Specific error message:", errorMessage);

      alert(
        `Unable to start chat: ${errorMessage}\n\nPlease try again or contact support.`
      );
    }
  };

  // Separate paid and unpaid lessons
  const unpaidLessons = relevantLessons.filter((lesson) => !lesson.isPaid);

  // Filter paid lessons to only show those where the current tutor is confirmed
  const paidLessons = relevantLessons.filter((lesson) => {
    if (!lesson.isPaid) return false;

    // Check if current tutor is in confirmedTutors
    const isConfirmedTutor = lesson.confirmedTutors?.some(
      (ct: any) => ct.tutorId?._id === userId || ct.tutorId === userId
    );

    console.log(`Filtering paid lesson ${lesson._id}:`, {
      topic: lesson.topic,
      isPaid: lesson.isPaid,
      currentUserId: userId,
      confirmedTutors: lesson.confirmedTutors,
      isConfirmedTutor,
    });

    return isConfirmedTutor;
  });

  // Filter out expired lessons from unpaid (relevant) lessons
  const activeUnpaidLessons = unpaidLessons.filter(
    (lesson) => !isLessonExpired(lesson)
  );

  return (
    <div className="bg-black text-white flex flex-col w-full max-w-full overflow-x-hidden min-h-screen">
      <main className="px-4 sm:px-8 py-8 flex flex-col gap-8 transition-all duration-300 max-w-full">
        {/* Header Section with elegant design */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-200">
              Relevant Classes
            </h1>
          </div>
        </div>

        {/* Relevant Classes Section */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20"></div>
              </div>
            </div>
            <p className="text-gray-400 animate-pulse">
              Loading your lessons...
            </p>
          </div>
        ) : activeUnpaidLessons.length > 0 ? (
          <LessonCarousel>
            {activeUnpaidLessons.map((lesson, index) => (
              <LessonModel
                key={lesson._id || index}
                topic={lesson.topic}
                subject={lesson.subject}
                time={`${lesson.date} • ${lesson.time}`}
                studentName={lesson.studentId?.name || "Unknown Student"}
                onViewDetails={() => {
                  console.log("Tutor view details clicked for lesson:", lesson);
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
          <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center shadow-xl">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <p className="text-gray-300 text-lg font-medium mb-2">
              No relevant lessons
            </p>
            <p className="text-gray-500 text-sm">
              Students haven't created any lessons matching your subjects yet.
            </p>
          </div>
        )}

        {/* Confirmed Classes Section */}
        {!loading && paidLessons.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4 mt-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-200">
                Confirmed Classes
              </h1>
            </div>
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
                  onStartChat={() => handleStartChat(lesson)}
                  onDelete={
                    isLessonExpired(lesson)
                      ? () => handleDeleteLesson(lesson._id, lesson.topic)
                      : undefined
                  }
                />
              ))}
            </LessonCarousel>
          </>
        )}

        <div className="mt-4 flex justify-center sm:justify-start">
          <a
            href={`${window.location.origin}/tutor/${userId}`}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 
                     hover:from-emerald-500 hover:to-green-500 
                     rounded-xl font-semibold shadow-lg transition-all duration-300 
                     cursor-pointer 
                     border border-emerald-500/20 flex items-center gap-2"
            target="_blank"
          >
            Share Public Profile
          </a>
        </div>
      </main>

      {openDetails && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[9999] px-4"
          onClick={() => {
            console.log("Tutor modal overlay clicked, closing...");
            setOpenDetails(null);
          }}
        >
          <div
            className="bg-gradient-to-b from-slate-900/95 to-slate-900/90 backdrop-blur-xl text-white p-8 rounded-2xl w-full sm:w-[520px] space-y-6 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => {
              console.log("Tutor modal content clicked");
              e.stopPropagation();
            }}
          >
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-200">
                {openDetails.topic}
              </h2>
              {openDetails.subject && (
                <span className="text-xs font-semibold text-emerald-200 border border-emerald-400/40 px-3 py-1 rounded-full bg-emerald-500/10">
                  {openDetails.subject}
                </span>
              )}
            </div>

            {/* Payment Confirmed Badge */}
            {openDetails.isPaid && (
              <div
                className="text-sm text-emerald-300 bg-emerald-900/30 backdrop-blur-sm px-4 py-2.5 rounded-lg
                          border border-emerald-500/30 flex items-center gap-2 font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-emerald-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Payment Confirmed - Lesson Scheduled</span>
              </div>
            )}

            {openDetails.subTopic && (
              <p className="text-gray-300 text-base">
                <span className="font-semibold text-emerald-300">
                  Sub Topic:
                </span>{" "}
                {openDetails.subTopic}
              </p>
            )}

            <div className="space-y-3 bg-slate-800/40 backdrop-blur-sm p-5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-gray-300">
                  <span className="font-semibold text-emerald-300">
                    Student:
                  </span>{" "}
                  {openDetails.studentId?.name || "Unknown"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300">
                    <span className="font-semibold text-emerald-300">
                      Date:
                    </span>{" "}
                    {openDetails.date}
                  </p>
                  <p className="text-gray-300 mt-1">
                    <span className="font-semibold text-emerald-300">
                      Time:
                    </span>{" "}
                    {openDetails.time}
                  </p>
                </div>
              </div>

              {openDetails.class && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-emerald-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <p className="text-gray-300">
                    <span className="font-semibold text-emerald-300">
                      Class:
                    </span>{" "}
                    {openDetails.class}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-gray-300">
                  <span className="font-semibold text-emerald-300">
                    Status:
                  </span>{" "}
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
                      : "Not Confirmed yet"}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpenDetails(null)}
              className="w-full mt-2 bg-gradient-to-r from-slate-700 to-slate-600 
                       hover:from-slate-600 hover:to-slate-500 transition-all duration-300 
                       px-4 py-3 rounded-xl font-semibold shadow-lg border border-slate-500/20"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[10000] px-4"
          onClick={cancelDelete}
        >
          <div
            className="bg-gradient-to-b from-slate-900/95 to-slate-900/90 backdrop-blur-xl text-white p-8 rounded-2xl w-full sm:w-[520px] space-y-6 shadow-2xl border border-red-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-200">
                Delete Lesson?
              </h2>
            </div>

            <p className="text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                "{deleteConfirmation.lessonTitle}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex gap-4">
              <button
                onClick={cancelDelete}
                className="flex-1 bg-gradient-to-r from-slate-700 to-slate-600 
                         hover:from-slate-600 hover:to-slate-500 transition-all duration-300 
                         px-4 py-3 rounded-xl font-semibold shadow-lg border border-slate-500/20"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 
                         hover:from-red-500 hover:to-red-600 transition-all duration-300 
                         px-4 py-3 rounded-xl font-semibold shadow-lg border border-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDashboard;
