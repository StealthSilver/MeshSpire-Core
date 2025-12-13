import React, { useEffect, useState } from "react";
import Calendar from "../Components/Calendar";
import { getRelevantLessons } from "../api";

const TutorCalendar: React.FC = () => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDetails, setOpenDetails] = useState<any>(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const data = await getRelevantLessons();
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

  return (
    <div className="bg-black text-white flex flex-col w-full overflow-x-hidden min-h-screen">
      <main className="px-2 sm:px-4 md:px-8 py-3 sm:py-6 flex flex-col gap-3 sm:gap-6 transition-all duration-300 h-[calc(100vh-5rem)] overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            My Teaching Calendar
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
            userRole="tutor"
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
              No relevant lessons found
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              Students haven't created any lessons matching your subjects yet.
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
                <span className="text-[10px] sm:text-xs font-semibold text-white border border-violet-400/40 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-violet-500/10 whitespace-nowrap">
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
              <p className="text-gray-300 text-sm">
                <span className="font-semibold text-gray-200">Student:</span>{" "}
                {openDetails.studentId?.name || "Unknown"}
              </p>
              <p className="text-gray-300 text-sm">
                <span className="font-semibold text-gray-200">Class:</span>{" "}
                {openDetails.class}
              </p>
              <p className="text-gray-300 text-sm">
                <span className="font-semibold text-gray-200">Date:</span>{" "}
                {openDetails.date}
              </p>
              <p className="text-gray-300 text-sm">
                <span className="font-semibold text-gray-200">Time:</span>{" "}
                {openDetails.time}
              </p>
              <p className="text-gray-300 text-sm">
                <span className="font-semibold text-gray-200">Status:</span>{" "}
                <span
                  className={`${
                    openDetails.isPaid ? "text-green-400" : "text-yellow-400"
                  } font-semibold`}
                >
                  {openDetails.isPaid ? "Confirmed" : "Pending Payment"}
                </span>
              </p>
            </div>

            {openDetails.confirmedTutors &&
              openDetails.confirmedTutors.length > 0 && (
                <div className="bg-slate-800/40 backdrop-blur-sm p-5 rounded-xl border border-white/10">
                  <h3 className="font-semibold text-gray-200 mb-2">
                    Confirmed Tutors:
                  </h3>
                  <div className="space-y-2">
                    {openDetails.confirmedTutors.map(
                      (ct: any, index: number) => {
                        const tutorName =
                          ct.tutorId?.name ||
                          (typeof ct.tutorId === "string"
                            ? "Tutor"
                            : "Unknown Tutor");
                        return (
                          <div key={index} className="text-gray-300 text-sm">
                            • {tutorName}
                          </div>
                        );
                      }
                    )}
                  </div>
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

export default TutorCalendar;
