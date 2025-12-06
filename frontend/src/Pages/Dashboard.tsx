import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Carousel, Card } from "../Components/ui/Card-Coursel";
import FeaturedCard from "../Components/featuredCards";
import LessonModel from "../Components/LessonModel";
import LessonCarousel from "../Components/LessonCarousel";
import { createLesson, getMyLessons, deleteLesson } from "../api";
import image1 from "../assets/calculus.png";
import image2 from "../assets/algebra.png";
import image3 from "../assets/digital_logic.png";
import image4 from "../assets/probablity.png";
import image5 from "../assets/quantum-computing.png";
import image6 from "../assets/python.png";
import { payForLesson } from "../api/payment";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [openCard, setOpenCard] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [openDetails, setOpenDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    lessonId: string | null;
    lessonTitle: string;
  }>({ show: false, lessonId: null, lessonTitle: "" });

  // Separate paid and unpaid lessons
  const unpaidLessons = lessons.filter((lesson) => !lesson.isPaid);
  const paidLessons = lessons.filter((lesson) => lesson.isPaid);
  

  useEffect(() => {
    fetchLessons();

    // Refresh lessons when navigating back from payment
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchLessons();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", fetchLessons);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", fetchLessons);
    };
  }, []);

  const OnEditLesson = (lessonId: string) => {
    const lesson = lessons.find((l) => l._id === lessonId);
    setEdit(true);
    setEditData(lesson);
    setOpenCard(true);
  }

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const data = await getMyLessons();
      console.log("📚 Fetched lessons:", data);
      // Log confirmed tutors for each lesson
      data.forEach((lesson: any, idx: number) => {
        if (lesson.confirmedTutors && lesson.confirmedTutors.length > 0) {
          console.log(
            `Lesson ${idx} (${lesson.topic}) confirmed tutors:`,
            lesson.confirmedTutors
          );
        }
      });
      setLessons(data);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleLesson = async (lessonData: any) => {
    try {
      await createLesson(lessonData);
      await fetchLessons(); // Refresh the list
      setOpenCard(false);
    } catch (error) {
      console.error("Error creating lesson:", error);
      alert("Failed to schedule lesson. Please try again.");
    }
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
      await fetchLessons();
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

  const meetings = [
    {
      id: 1,
      theoremName: "Calculus",
      teacherName: "Mr. Sharma",
      imageUrl: image1,
      rating: 4.5,
    },
    {
      id: 2,
      theoremName: "Algebra",
      teacherName: "Ms. Gupta",
      imageUrl: image2,
      rating: 4,
    },
    {
      id: 3,
      theoremName: "Digital Logic",
      teacherName: "Dr. Mehta",
      imageUrl: image3,
      rating: 3.5,
    },
    {
      id: 4,
      theoremName: "Probability",
      teacherName: "Mr. Singh",
      imageUrl: image4,
      rating: 5,
    },
    {
      id: 5,
      theoremName: "Quantum Computing",
      teacherName: "Ms. Verma",
      imageUrl: image5,
      rating: 4.2,
    },
    {
      id: 6,
      theoremName: "Python Programming",
      teacherName: "Ms. Verma",
      imageUrl: image6,
      rating: 4.8,
    },
  ];

  const cards = meetings.map((m, index) => (
    <Card
      key={index}
      index={index}
      card={{
        src: m.imageUrl,
        title: m.theoremName,
        category: `Instructor: ${m.teacherName}`,
        rating: m.rating,
        content: (
          <p className="text-gray-300 text-sm sm:text-base mt-1">
            Learn about {m.theoremName} with {m.teacherName}.
          </p>
        ),
      }}
    />
  ));

  return (
    <div className="bg-black text-white flex flex-col w-full overflow-x-hidden min-h-screen">
      <main className="px-4 sm:px-8 py-10 flex flex-col gap-10 transition-all duration-300">
        {/* Schedule Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-wide">
            My Scheduled Lessons
          </h2>
          <button
            onClick={() => setOpenCard(true)}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 via-violet-700 to-purple-600 
                     hover:from-violet-500 hover:via-violet-600 hover:to-purple-500 
                     rounded-xl font-semibold shadow-lg transition-all duration-300 
                     hover:shadow-violet-500/50 hover:scale-105 active:scale-95
                     border border-violet-500/20"
          >
            + Schedule New Lesson
          </button>
        </div>

        {/* Unpaid Lesson Cards */}
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
                onViewDetails={() => {
                  console.log("📝 View Details clicked for lesson:", lesson);
                  console.log("📝 Confirmed tutors:", lesson.confirmedTutors);
                  console.log("📝 Is paid:", lesson.isPaid);
                  setOpenDetails(lesson);
                }}
                isPaid={false}
                date={lesson.date}
                lessonTime={lesson.time}
                onEditLesson={() => OnEditLesson(lesson._id)}
                onDelete={() => handleDeleteLesson(lesson._id, lesson.topic)}
                hasConfirmedTutors={
                  lesson.confirmedTutors && lesson.confirmedTutors.length > 0
                }
              />
            ))}
          </LessonCarousel>
        ) : (
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-lg">
              No unpaid lessons. Create your first lesson!
            </p>
          </div>
        )}

        {/* Confirmed Classes Section */}
        {!loading && paidLessons.length > 0 && (
          <>
            <div className="flex justify-between items-center mt-8">
              <h2 className="text-2xl font-bold tracking-wide">
                Confirmed Classes
              </h2>
            </div>
            <LessonCarousel>
              {paidLessons.map((lesson, index) => (
                <LessonModel
                  key={lesson._id || index}
                  topic={lesson.topic}
                  subject={lesson.subject}
                  time={`${lesson.date} • ${lesson.time}`}
                  onViewDetails={() => {
                    console.log(
                      "View Details clicked for paid lesson:",
                      lesson
                    );
                    setOpenDetails(lesson);
                  }}
                  isPaid={true}
                  date={lesson.date}
                  lessonTime={lesson.time}
                  onStartMeeting={() => handleStartMeeting(lesson)}
                  onDelete={() => handleDeleteLesson(lesson._id, lesson.topic)}
                  onEditLesson={()=>OnEditLesson(lesson._id)}
                />
              ))}
            </LessonCarousel>
          </>
        )}

        <h1 className="text-3xl font-bold tracking-wide text-center sm:text-left mt-8">
          Explore Courses
        </h1>

        <div className="max-w-[100vw] overflow-x-hidden">
          <Carousel items={cards} />
        </div>
      </main>

      {openCard && (
        <FeaturedCard
          open={openCard}
          onClose={() => {setOpenCard(false); setEdit(false) }}
          onSchedule={handleScheduleLesson}
          editMode={edit}
          lessonData={editData}

        />
      )}

      {openDetails && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[9999] px-4"
          onClick={() => {
            console.log("Modal overlay clicked, closing...");
            setOpenDetails(null);
          }}
        >
          <div
            className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl w-full sm:w-[480px] space-y-5 shadow-2xl border border-violet-500/20 max-h-[90vh] overflow-y-auto"
            onClick={(e) => {
              console.log("Modal content clicked");
              e.stopPropagation();
            }}
          >
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
                <span className="text-violet-400"></span>
                <span className="font-semibold">Date:</span> {openDetails.date}
              </p>

              <p className="text-gray-300 text-sm flex items-center gap-2">
                <span className="text-violet-400"></span>
                <span className="font-semibold">Time:</span> {openDetails.time}
              </p>

              {openDetails.class && (
                <p className="text-gray-300 text-sm flex items-center gap-2">
                  <span className="text-violet-400"></span>
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
                        console.log(
                          `🔍 Processing tutor ${index}:`,
                          confirmedTutor
                        );
                        console.log(
                          `🔍 Tutor ID type:`,
                          typeof confirmedTutor.tutorId
                        );
                        console.log(
                          `🔍 Tutor ID value:`,
                          confirmedTutor.tutorId
                        );

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

                        console.log(`🔍 Extracted data:`, {
                          isTutorPopulated,
                          tutorName,
                          tutorEmail,
                          tutorId,
                        });
                        console.log(`🔍 isPaid:`, openDetails.isPaid);

                        // Skip rendering if tutor data is invalid
                        if (!tutorId) {
                          console.warn(
                            "⚠️ Invalid tutor data:",
                            confirmedTutor
                          );
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

                            {(() => {
                              console.log(
                                `🔘 Rendering buttons for tutor. isPaid: ${openDetails.isPaid}`
                              );
                              if (!openDetails.isPaid) {
                                console.log(
                                  "🔘 Showing Pay & Confirm and Teacher Details buttons"
                                );
                                return (
                                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                    <button
                                      onClick={async () => {
                                        console.log("💳 Initiating payment...");
                                        try {
                                          const url = await payForLesson({
                                            tutorId: tutorId,
                                            lessonId: openDetails._id,
                                          });
                                          window.location.href = url; // redirect to Stripe
                                        } catch (error) {
                                          console.error(
                                            "Payment Error:",
                                            error
                                          );
                                          alert(
                                            "Payment failed. Try again later."
                                          );
                                        }
                                      }}
                                      className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500
                                        transition-all px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-green-500/50
                                        active:scale-95 text-white"
                                    >
                                      Pay & Confirm
                                    </button>

                                    <a
                                      href={`${window.location.origin}/tutor/${tutorId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <button
                                        className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500
                                    transition-all px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-violet-500/50
                                    active:scale-95 text-white"
                                      >
                                        Teacher Details
                                      </button>
                                    </a>
                                  </div>
                                );
                              } else {
                                console.log(
                                  "🔘 Showing only Teacher Details button (paid)"
                                );
                                return (
                                  <div className="pt-1">
                                    <a
                                      href={`${window.location.origin}/tutor/${tutorId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <button
                                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500
                                           transition-all px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-violet-500/50
                                           active:scale-95 text-white"
                                      >
                                        Teacher Details
                                      </button>
                                    </a>
                                  </div>
                                );
                              }
                            })()}
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

      {/* Delete Confirmation Popup */}
      {deleteConfirmation.show && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[10000] px-4"
          onClick={cancelDelete}
        >
          <div
            className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl w-full sm:w-[400px] space-y-5 shadow-2xl border border-red-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-900/40">
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
              <h2 className="text-2xl font-bold text-red-400">
                Delete Lesson?
              </h2>
            </div>

            <p className="text-gray-300">
              Are you sure you want to delete the lesson{" "}
              <span className="font-semibold text-white">
                "{deleteConfirmation.lessonTitle}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-3 rounded-xl font-semibold 
                         bg-gray-700 hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 rounded-xl font-semibold 
                         bg-gradient-to-r from-red-600 to-red-700 
                         hover:from-red-500 hover:to-red-600 
                         transition-all shadow-lg hover:shadow-red-500/50"
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

export default Dashboard;
