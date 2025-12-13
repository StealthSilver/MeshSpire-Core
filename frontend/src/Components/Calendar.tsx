import React, { useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";

interface Lesson {
  _id: string;
  topic: string;
  subject: string;
  subTopic?: string;
  class: string;
  date: string;
  time: string;
  status: string;
  isPaid: boolean;
  studentId?: { name: string; email: string };
  confirmedTutors?: any[];
}

interface CalendarProps {
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
  userRole?: "student" | "tutor";
}

const Calendar: React.FC<CalendarProps> = ({
  lessons,
  onLessonClick,
  userRole = "student",
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentDate);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getLessonsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    return lessons.filter((lesson) => {
      // Parse the lesson date (assuming format: "YYYY-MM-DD" or "DD/MM/YYYY")
      let lessonDate = lesson.date;

      // Convert DD/MM/YYYY to YYYY-MM-DD if needed
      if (lessonDate.includes("/")) {
        const [d, m, y] = lessonDate.split("/");
        lessonDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }

      return lessonDate === dateStr;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const handleDayClick = (day: number, lessonsOnDay: Lesson[]) => {
    if (lessonsOnDay.length > 0) {
      setSelectedDay(day);
      setIsDrawerOpen(true);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedDay(null), 300);
  };

  const getSelectedDayLessons = () => {
    if (selectedDay === null) return [];
    return getLessonsForDate(selectedDay);
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="bg-gradient-to-b from-slate-900/40 to-slate-900/20 border border-white/5 rounded-lg p-2 min-h-[90px]"
        />
      );
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const lessonsOnDay = getLessonsForDate(day);
      const hasLessons = lessonsOnDay.length > 0;

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(day, lessonsOnDay)}
          className={`bg-gradient-to-b from-slate-900/60 to-slate-900/30 backdrop-blur-sm border rounded-lg p-1.5 sm:p-2 min-h-[70px] sm:min-h-[90px] transition-all hover:from-slate-800/70 hover:to-slate-800/40
            ${
              isToday(day)
                ? "border-emerald-500/50 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10"
                : "border-white/10"
            }
            ${hasLessons ? "cursor-pointer" : ""}`}
        >
          <div
            className={`text-xs sm:text-sm font-semibold mb-1 ${
              isToday(day) ? "text-emerald-400" : "text-gray-300"
            }`}
          >
            {day}
          </div>

          {lessonsOnDay.length > 0 && (
            <div className="space-y-0.5 sm:space-y-1">
              {lessonsOnDay.slice(0, 2).map((lesson) => (
                <div
                  key={lesson._id}
                  className={`text-[9px] sm:text-xs p-1 sm:p-1.5 rounded-md sm:rounded-lg transition-all hover:scale-[1.02] shadow-md
                    ${
                      lesson.isPaid
                        ? "bg-gradient-to-r from-emerald-900/40 to-green-900/40 border border-emerald-500/30"
                        : "bg-gradient-to-r from-violet-900/40 to-purple-900/40 border border-violet-500/30"
                    }`}
                >
                  <div className="font-semibold truncate text-white text-center">
                    {lesson.topic}
                  </div>
                  <div className="hidden sm:block text-gray-300 truncate text-[10px] text-center mt-0.5">
                    {lesson.time}
                  </div>
                </div>
              ))}
              {lessonsOnDay.length > 2 && (
                <div className="text-[9px] sm:text-[10px] text-emerald-400 font-medium text-center py-0.5">
                  +{lessonsOnDay.length - 2} more
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 bg-gradient-to-r from-slate-900/80 via-emerald-900/20 to-slate-900/80 backdrop-blur-xl p-2 sm:p-4 rounded-lg sm:rounded-xl border border-white/10 shadow-lg">
        <button
          onClick={previousMonth}
          className="p-1.5 sm:p-2 hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-green-600/20 rounded-lg transition-all duration-300 border border-white/5 hover:border-emerald-500/30"
        >
          <ChevronLeftIcon className="text-gray-300 text-xl sm:text-2xl" />
        </button>

        <h2 className="text-lg sm:text-2xl font-bold text-white">
          {monthNames[month]} {year}
        </h2>

        <button
          onClick={nextMonth}
          className="p-1.5 sm:p-2 hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-green-600/20 rounded-lg transition-all duration-300 border border-white/5 hover:border-emerald-500/30"
        >
          <ChevronRightIcon className="text-gray-300 text-xl sm:text-2xl" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-gray-400 text-[10px] sm:text-sm py-1 sm:py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="flex gap-2 sm:gap-4 mt-3 sm:mt-4 justify-center flex-wrap text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-violet-900/40 to-purple-900/40 border border-violet-500/30 rounded-md"></div>
          <span className="text-[10px] sm:text-xs text-gray-400">
            Pending Payment
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-emerald-900/40 to-green-900/40 border border-emerald-500/30 rounded-md"></div>
          <span className="text-[10px] sm:text-xs text-gray-400">
            Confirmed
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-emerald-500 rounded-md"></div>
          <span className="text-[10px] sm:text-xs text-gray-400">Today</span>
        </div>
      </div>

      {/* Drawer for Day Schedule */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <div
            className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-gradient-to-b from-slate-900/98 to-slate-900/95 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
              isDrawerOpen ? "translate-x-0" : "translate-x-full"
            } border-l border-white/10 overflow-y-auto`}
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center z-10">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Schedule for {monthNames[month]} {selectedDay}, {year}
              </h3>
              <button
                onClick={closeDrawer}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-all"
              >
                <CloseIcon className="text-gray-300" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 space-y-3">
              {getSelectedDayLessons().length > 0 ? (
                getSelectedDayLessons().map((lesson) => (
                  <div
                    key={lesson._id}
                    onClick={() => {
                      onLessonClick(lesson);
                      closeDrawer();
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] shadow-lg border
                      ${
                        lesson.isPaid
                          ? "bg-gradient-to-br from-emerald-900/40 to-green-900/40 border-emerald-500/30 hover:from-emerald-800/50 hover:to-green-800/50"
                          : "bg-gradient-to-br from-violet-900/40 to-purple-900/40 border-violet-500/30 hover:from-violet-800/50 hover:to-purple-800/50"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white text-base sm:text-lg">
                        {lesson.topic}
                      </h4>
                      {lesson.subject && (
                        <span className="text-[9px] sm:text-xs font-medium text-white border border-white/30 px-2 py-0.5 rounded-full bg-white/10">
                          {lesson.subject}
                        </span>
                      )}
                    </div>

                    {lesson.subTopic && (
                      <p className="text-gray-300 text-xs sm:text-sm mb-2">
                        {lesson.subTopic}
                      </p>
                    )}

                    <div className="space-y-1 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
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
                        <span>{lesson.time}</span>
                      </div>

                      {lesson.class && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          </svg>
                          <span>Class {lesson.class}</span>
                        </div>
                      )}

                      {userRole === "tutor" && lesson.studentId?.name && (
                        <div className="flex items-center gap-2 text-gray-300">
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
                          <span>{lesson.studentId.name}</span>
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-white/10">
                        <span
                          className={`text-xs font-semibold ${
                            lesson.isPaid ? "text-green-400" : "text-yellow-400"
                          }`}
                        >
                          {lesson.isPaid ? "✓ Confirmed" : "⏳ Pending Payment"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No lessons scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;
