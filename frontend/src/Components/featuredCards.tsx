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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sliding Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-[420px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl text-white shadow-2xl border-l border-violet-500/20 z-50 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 130, damping: 20 }}
          >
            <div className="p-6">
              {editMode? 
              <h2 className="text-3xl font-bold mb-6 pb-4 border-b border-violet-500/20 bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
               Update your Lesson
                
              </h2>
              :
              <h2 className="text-3xl font-bold mb-6 pb-4 border-b border-violet-500/20 bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
               Schedule your Lesson
                
              </h2>
              
              }


              <form className="flex flex-col gap-5">
                <div>
                  <label className="font-semibold text-violet-200 flex items-center gap-2">
                    Topic <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="topic"
                    type="text"
                    required
                    className="w-full p-3 rounded-xl mt-2 bg-slate-800/70 border border-violet-500/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="e.g., Calculus Basics"
                  />
                </div>

                <div>
                  <label className="font-semibold text-violet-200 flex items-center gap-2">
                    Sub Topic
                  </label>
                  <input
                    id="subTopic"
                    type="text"
                    className="w-full p-3 rounded-xl mt-2 bg-slate-800/70 border border-violet-500/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="e.g., Derivatives"
                  />
                </div>

                <div>
                  <label className="font-semibold text-violet-200 flex items-center gap-2">
                    Subject <span className="text-red-400">*</span>
                  </label>


                  <select id="subject" className="w-full p-3 rounded-xl mt-2 bg-slate-800/70 border border-violet-500/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all">
                    <option value="">Select Subject</option>
                    <option value="Mathematics" >Mathematics</option>
                    <option value="English">English</option>
                    <option value="Science">Science</option>
                    <option value="Computer Science">Computer Science</option>


                  </select>
                </div>

                <div>
                  <label className="font-semibold text-violet-200 flex items-center gap-2">
                    Class <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="class"
                    required
                    className="w-full p-3 rounded-xl mt-2 bg-slate-800/70 border border-violet-500/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
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
                    <option value="phd">phd</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-violet-200 flex items-center gap-2">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="date"
                    type="date"
                    min={minDate}
                    required
                    value={selecetedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}

                    className="w-full p-3 rounded-xl mt-2 bg-slate-800/70 border border-violet-500/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="font-semibold text-violet-200 flex items-center gap-2">
                    Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="time"
                    type="time"
                    required
                    min={minTime}
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-3 rounded-xl mt-2 bg-slate-800/70 border border-violet-500/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
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
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 
                           hover:from-violet-500 hover:via-purple-500 hover:to-violet-500 
                           font-bold shadow-xl transition-all duration-300 hover:shadow-violet-500/50 
                           disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >

                  {isSubmitting ? "Scheduling..." : "Schedule Lesson"}
                </button>
              
                  }
                  </form>

              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full py-3 mt-4 rounded-xl bg-slate-800/70 border border-violet-500/20 text-gray-200 hover:bg-slate-700/70 transition-all hover:border-violet-400/30 disabled:opacity-50 disabled:cursor-not-allowed"

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