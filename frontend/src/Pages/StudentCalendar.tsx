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
      <main className="px-4 sm:px-8 py-10 flex flex-col gap-10 transition-all duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-wide">
            My Class Calendar
          </h2>
          <div className="text-sm text-gray-400">
            Total Lessons: {lessons.length}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : lessons.length > 0 ? (
          <Calendar
            lessons={lessons}
            onLessonClick={handleLessonClick}
            userRole="student"
          />
        ) : (
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-lg">
              No lessons scheduled. Create your first lesson!
            </p>
          </div>
        )}
      </main>

      {/* Lesson Details Modal */}
      {openDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl w-full sm:w-[480px] space-y-5 shadow-2xl border border-violet-500/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {openDetails.topic}
              </h2>
              {openDetails.subject && (
                <span className="text-xs font-medium text-white border border-violet-400/40 px-3 py-1 rounded-full bg-violet-500/10">
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
              <p className="text-gray-300 text-sm flex items-center gap-2">
                <span className="text-violet-400">📅</span>
                <span className="font-semibold">Date:</span> {openDetails.date}
              </p>

              <p className="text-gray-300 text-sm flex items-center gap-2">
                <span className="text-violet-400">⏰</span>
                <span className="font-semibold">Time:</span> {openDetails.time}
              </p>

              {openDetails.class && (
                <p className="text-gray-300 text-sm flex items-center gap-2">
                  <span className="text-violet-400">🎓</span>
                  <span className="font-semibold">Class:</span>{" "}
                  {openDetails.class}
                </p>
              )}
            </div>

            {/* Confirmed Tutors Section */}
            {openDetails.confirmedTutors &&
              openDetails.confirmedTutors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-violet-300">
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
                                    ✓ Payment Completed
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

export default StudentCalendar;
