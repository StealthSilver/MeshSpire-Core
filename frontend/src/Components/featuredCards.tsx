import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { UpdateLesson } from "../api";

interface FeaturedCardProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (data: any) => void;
  lessonData?: any;
  editMode?:boolean;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({
  open,
  onClose,
  onSchedule,
  lessonData,
  editMode
}) => {
  const classOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minDate, setMinDate] = useState("");
  const [minTime, setMinTime] = useState("");
  const [selecetedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
  if (editMode && lessonData) {
    setSelectedDate(lessonData.date);
    setSelectedTime(lessonData.time);

    (document.getElementById("topic") as HTMLInputElement).value = lessonData.topic;
    (document.getElementById("subTopic") as HTMLInputElement).value = lessonData.subTopic || "";
    (document.getElementById("subject") as HTMLSelectElement).value = lessonData.subject;
    (document.getElementById("class") as HTMLSelectElement).value = lessonData.class;
  }
}, [editMode, lessonData]);



  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  useEffect(() => {
    if (!selecetedDate) return;
    const now = new Date();
    const todayString = now.toISOString().split("T")[0];
    if (selecetedDate === todayString) {
      const hh = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      setMinTime(`${hh}:${min}`);
    } else {
      setMinTime("00:00");
    }
  }, [selecetedDate]);

  const handleSubmit = async () => {
    const topic = (document.getElementById("topic") as HTMLInputElement).value;
    const subTopic = (document.getElementById("subTopic") as HTMLInputElement)
      .value;
    const subject = (document.getElementById("subject") as HTMLInputElement)
      .value;
    const classValue = (document.getElementById("class") as HTMLSelectElement)
      .value;
    const date = selecetedDate;
    const time = selectedTime;

    // Validation
    if (!topic || !subject || !classValue || !date || !time) {
      alert("Please fill in all required fields");
      return;
    }

    const lessonDataToSend = {
      topic,
      subTopic: subTopic || undefined,
      subject,
      class: classValue,
      date,
      time,
    };

    const now = new Date();
    const selectedDateTime = new Date(`${date}T${time}`);
    if (selectedDateTime < now) {
      alert("You cannot select past date/time");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editMode && lessonData) {
        await UpdateLesson(lessonData._id, lessonDataToSend);
        onClose();
      } else {
        await onSchedule(lessonDataToSend);
      }

    } catch (error) {
      console.error("Error scheduling lesson:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sliding Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-gradient-to-b from-slate-900/98 via-slate-900/95 to-slate-900/98 backdrop-blur-2xl text-white shadow-2xl border-l border-emerald-500/20 z-50 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 130, damping: 20 }}
          >
            <div className="p-6 sm:p-8">
              <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent">
                  Schedule Your Lesson
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
              </div>

              <form className="flex flex-col gap-6">
                <div>
                  <label className="font-semibold text-emerald-200 flex items-center gap-2 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    Topic <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="topic"
                    type="text"
                    required
                    className="w-full p-3 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-emerald-500/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
                    placeholder="e.g., Calculus Basics"
                  />
                </div>

                <div>
                  <label className="font-semibold text-emerald-200 flex items-center gap-2 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Sub Topic
                  </label>
                  <input
                    id="subTopic"
                    type="text"
                    className="w-full p-3 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-emerald-500/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
                    placeholder="e.g., Derivatives"
                  />
                </div>

                <div>
                  <label className="font-semibold text-emerald-200 flex items-center gap-2 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="subject"
                    required
                    className="w-full p-3 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-emerald-500/20 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Science">Science</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-emerald-200 flex items-center gap-2 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    Class <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="class"
                    required
                    className="w-full p-3 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-emerald-500/20 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select Class
                    </option>
                    {classOptions.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                    <option value="Bachelors">Bachelors</option>
                    <option value="Masters">Masters</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-emerald-200 flex items-center gap-2 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="date"
                      type="date"
                      min={minDate}
                      required
                      value={selecetedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-emerald-500/20 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-emerald-200 flex items-center gap-2 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="time"
                      type="time"
                      required
                      min={minTime}
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-emerald-500/20 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>
                  {editMode?
                  <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 
                           hover:from-violet-500 hover:via-purple-500 hover:to-violet-500 
                           font-bold shadow-xl transition-all duration-300 hover:shadow-violet-500/50 
                           disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >

                  {isSubmitting? "Updating..." : "Update Lesson"}
                </button>
                :
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 
                           hover:from-emerald-500 hover:via-green-500 hover:to-emerald-500 
                           font-bold shadow-xl transition-all duration-300 hover:shadow-emerald-500/50 
                           disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
                           border border-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Schedule Lesson
                    </>
                  )}
                </button>
              
                  }
                  </form>

              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full py-3 mt-4 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-600/30 text-gray-200 hover:bg-slate-700/60 transition-all hover:border-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FeaturedCard;
