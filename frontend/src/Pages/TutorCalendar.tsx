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
      <main className="px-4 sm:px-8 py-10 flex flex-col gap-10 transition-all duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-wide">
            My Teaching Calendar
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
            userRole="tutor"
          />
        ) : (
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-lg">
              No relevant lessons found. Students haven't created any lessons
              matching your subjects yet.
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
                  className={`${
                    openDetails.isPaid ? "text-green-400" : "text-yellow-400"
                  } font-semibold`}
                >
                  {openDetails.isPaid ? "Confirmed ✓" : "Pending Payment"}
                </span>
              </p>
            </div>

            {openDetails.confirmedTutors &&
              openDetails.confirmedTutors.length > 0 && (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                  <h3 className="font-semibold text-violet-300 mb-2">
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

export default TutorCalendar;
