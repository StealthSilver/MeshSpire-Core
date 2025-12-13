import React, { useEffect, useState } from "react";
import Calendar from "../Components/Calendar";
import { getMyLessons } from "../api";
import { payForLesson } from "../api/payment";

const StudentCalendar: React.FC = () => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDetails, setOpenDetails] = useState<any>(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const data = await getMyLessons();
      setLessons(data);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lesson: any) => {
    setOpenDetails(lesson);
  };

  const handlePayment = async (tutorData: { tutorId: string }) => {
    try {
      const paymentData = {
        lessonId: openDetails._id,
        tutorId: tutorData.tutorId,
      };

      const url = await payForLesson(paymentData);

      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      alert(
        error.response?.data?.message ||
          "Failed to initialize payment. Please try again."
      );
    }
  };

  return (
    <div className="bg-black text-white flex flex-col w-full overflow-x-hidden min-h-screen">
      <main className="px-2 sm:px-4 md:px-8 py-3 sm:py-6 flex flex-col gap-3 sm:gap-6 transition-all duration-300 h-[calc(100vh-5rem)] overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            My Class Calendar
          </h2>
          <div className="text-xs sm:text-sm text-gray-400 bg-slate-900/60 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-white/10">
            Total Lessons: {lessons.length}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-emerald-500"></div>
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl"></div>
            </div>
          </div>
        ) : lessons.length > 0 ? (
          <Calendar
            lessons={lessons}
            onLessonClick={handleLessonClick}
            userRole="student"
          />
        ) : (
          <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center shadow-xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-400"
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
            </div>
            <p className="text-gray-300 text-base sm:text-lg font-medium mb-2">
              No lessons scheduled
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              Create your first lesson to get started!
            </p>
          </div>
        )}
      </main>

      {/* Lesson Details Modal */}
      {openDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 sm:px-4">
          <div className="bg-gradient-to-b from-slate-900/95 to-slate-900/90 backdrop-blur-xl text-white p-4 sm:p-8 rounded-xl sm:rounded-2xl w-full sm:w-[480px] space-y-3 sm:space-y-5 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-200">
                {openDetails.topic}
              </h2>
              {openDetails.subject && (
                <span className="text-[10px] sm:text-xs font-medium text-white border border-violet-400/40 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-violet-500/10 whitespace-nowrap">
                  {openDetails.subject}
                </span>
              )}
            </div>

            {openDetails.subTopic && (
              <p className="text-gray-300 text-sm sm:text-base">
                <span className="font-semibold text-gray-200">Sub Topic:</span>{" "}
                {openDetails.subTopic}
              </p>
            )}

            <div className="space-y-2 sm:space-y-3 bg-slate-800/40 backdrop-blur-sm p-3 sm:p-5 rounded-lg sm:rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-violet-400 flex-shrink-0"
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
                <p className="text-gray-300 text-sm">
                  <span className="font-semibold text-gray-200">Date:</span>{" "}
                  {openDetails.date}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-violet-400 flex-shrink-0"
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
                <p className="text-gray-300 text-sm">
                  <span className="font-semibold text-gray-200">Time:</span>{" "}
                  {openDetails.time}
                </p>
              </div>

              {openDetails.class && (
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-violet-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                    />
                  </svg>
                  <p className="text-gray-300 text-sm">
                    <span className="font-semibold text-gray-200">Class:</span>{" "}
                    {openDetails.class}
                  </p>
                </div>
              )}
            </div>

            {/* Confirmed Tutors Section */}
            {openDetails.confirmedTutors &&
              openDetails.confirmedTutors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-200">
                    Confirmed Tutors
                  </h3>
                  <div className="space-y-2">
                    {openDetails.confirmedTutors.map(
                      (confirmedTutor: any, index: number) => {
                        // Check if tutorId is populated (object) or just an ID (string)
                        const isTutorPopulated =
                          confirmedTutor.tutorId &&
                          typeof confirmedTutor.tutorId === "object";
                        const tutorName = isTutorPopulated
                          ? confirmedTutor.tutorId.name
                          : null;
                        const tutorEmail = isTutorPopulated
                          ? confirmedTutor.tutorId.email
                          : null;
                        const tutorId = isTutorPopulated
                          ? confirmedTutor.tutorId._id
                          : confirmedTutor.tutorId;

                        // Skip rendering if tutor data is invalid
                        if (!tutorId) {
                          console.warn("Invalid tutor data:", confirmedTutor);
                          return null;
                        }

                        return (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-4 rounded-xl border border-green-500/30 space-y-3"
                          >
                            <p className="text-gray-200 font-semibold">
                              {tutorName || "Tutor"}
                            </p>

                            {tutorEmail && (
                              <p className="text-gray-400 text-sm">
                                {tutorEmail}
                              </p>
                            )}

                            {confirmedTutor.confirmedAt && (
                              <p className="text-gray-400 text-xs">
                                Confirmed:{" "}
                                {new Date(
                                  confirmedTutor.confirmedAt
                                ).toLocaleString()}
                              </p>
                            )}

                            {!openDetails.isPaid && (
                              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                <button
                                  onClick={() =>
                                    handlePayment({ tutorId: tutorId })
                                  }
                                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 
                                       hover:from-green-500 hover:to-emerald-500 transition-all duration-300 
                                       px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-green-500/50"
                                >
                                  Pay Now
                                </button>
                              </div>
                            )}

                            {openDetails.isPaid && (
                              <div className="pt-1">
                                <div className="bg-green-900/20 border border-green-500/30 px-4 py-2 rounded-xl text-center">
                                  <span className="text-green-400 font-semibold">
                                    Payment Completed
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

            {/* No Tutors Confirmed Yet */}
            {(!openDetails.confirmedTutors ||
              openDetails.confirmedTutors.length === 0) && (
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <p className="text-gray-400 text-center">
                  No tutors have confirmed yet. Please wait for a tutor to
                  accept your lesson request.
                </p>
              </div>
            )}

            <button
              onClick={() => setOpenDetails(null)}
              className="w-full mt-4 bg-gradient-to-r from-slate-700 to-slate-600 
                       hover:from-slate-600 hover:to-slate-500 transition-all duration-300 
                       px-4 py-3 rounded-xl font-semibold shadow-lg border border-slate-500/20"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCalendar;
