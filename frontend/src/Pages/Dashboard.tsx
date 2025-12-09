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
import { ensureConversation } from "../api/chat";
import { useAuth } from "../Context/AuthContext";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
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
  };

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

  const handleStartChat = async (lesson: any, confirmedTutor: any) => {
    try {
      console.log("🚀 Starting chat with:", { lesson, confirmedTutor });

      const tutorId =
        typeof confirmedTutor.tutorId === "object"
          ? confirmedTutor.tutorId._id
          : confirmedTutor.tutorId;

      console.log("📝 Extracted tutorId:", tutorId);

      if (!tutorId) {
        alert("Tutor information is not available. Please try again.");
        return;
      }

      console.log(
        "📞 Creating conversation for lesson:",
        lesson._id,
        "with tutor:",
        tutorId
      );

      const conversation = await ensureConversation({
        lessonId: lesson._id,
        tutorId,
      });

      console.log("✅ Conversation created/found:", conversation);

      navigate(role === "tutor" ? "/tutor-dashboard/chat" : "/dashboard/chat", {
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

  const handleEditLesson = (lesson: any) => {
    // For now, just show the details modal
    // In the future, you could navigate to an edit page or show an edit modal
    setOpenDetails(lesson);
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
    <div className="bg-gradient-to-br from-black via-slate-950 to-slate-900 text-white flex flex-col w-full overflow-x-hidden min-h-screen">
      <main className="px-4 sm:px-8 py-8 flex flex-col gap-8 transition-all duration-300">
        {/* Header Section with elegant design */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-200">
              My Lessons
            </h1>
          </div>
          <button
            onClick={() => setOpenCard(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 
                     hover:from-emerald-500 hover:to-green-500 
                     rounded-xl font-semibold shadow-lg transition-all duration-300 
                     cursor-pointer 
                     border border-emerald-500/20 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Schedule New Lesson
          </button>
        </div>

        {/* Unpaid Lesson Cards Section */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-400 animate-pulse">
              Loading your lessons...
            </p>
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
              No pending lessons
            </p>
            <p className="text-gray-500 text-sm">
              Schedule your first lesson to get started!
            </p>
          </div>
        )}

        {/* Confirmed Classes Section */}
        {!loading && paidLessons.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
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
                  onEditLesson={() => handleEditLesson(lesson)}
                  onStartChat={() => {
                    console.log("💬 Chat button clicked for lesson:", lesson);
                    console.log("📋 Confirmed tutors:", lesson.confirmedTutors);

                    const firstConfirmed = (lesson.confirmedTutors || []).find(
                      (ct: any) => !!ct.tutorId
                    );

                    console.log("👤 First confirmed tutor:", firstConfirmed);

                    if (!firstConfirmed) {
                      alert("No confirmed tutor found for this lesson.");
                      return;
                    }
                    handleStartChat(lesson, firstConfirmed);
                  }}
                  onDelete={() => handleDeleteLesson(lesson._id, lesson.topic)}
                />
              ))}
            </LessonCarousel>
          </>
        )}

        {/* Explore Classes Section */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-200">
              Explore Classes
            </h1>
          </div>
          <div className="max-w-[100vw] overflow-x-hidden">
            <Carousel items={cards} />
          </div>
        </div>
      </main>

      {openCard && (
        <FeaturedCard
          open={openCard}
          onClose={() => {
            setOpenCard(false);
            setEdit(false);
          }}
          onSchedule={handleScheduleLesson}
          editMode={edit}
          lessonData={editData}
        />
      )}

      {openDetails && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[9999] px-4"
          onClick={() => {
            console.log("Modal overlay clicked, closing...");
            setOpenDetails(null);
          }}
        >
          <div
            className="bg-gradient-to-b from-slate-900/95 to-slate-900/90 backdrop-blur-xl text-white p-8 rounded-2xl w-full sm:w-[520px] space-y-6 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => {
              console.log("Modal content clicked");
              e.stopPropagation();
            }}
          >
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent">
                {openDetails.topic}
              </h2>
              {openDetails.subject && (
                <span className="text-xs font-semibold text-emerald-200 border border-emerald-500/40 px-3 py-1.5 rounded-full bg-emerald-500/10 whitespace-nowrap">
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

            <div className="space-y-3 bg-slate-800/40 backdrop-blur-sm p-5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-sm text-white font-medium">
                    {openDetails.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
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
                </div>
                <div>
                  <p className="text-xs text-gray-400">Time</p>
                  <p className="text-sm text-white font-medium">
                    {openDetails.time}
                  </p>
                </div>
              </div>

              {openDetails.class && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Class</p>
                    <p className="text-sm text-white font-medium">
                      {openDetails.class}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmed Tutors Section */}
            {openDetails.confirmedTutors &&
              openDetails.confirmedTutors.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-emerald-300 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
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
                            className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm p-5 rounded-xl border border-emerald-500/20 space-y-3 hover:border-emerald-500/40 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold">
                                {(tutorName || "T").charAt(0).toUpperCase()}
                              </div>
                              <p className="text-white font-semibold text-lg">
                                {tutorName || "Tutor"}
                              </p>
                            </div>

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
                                        transition-all px-4 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/50
                                        active:scale-95 text-white border border-emerald-500/20"
                                    >
                                      Pay & Confirm
                                    </button>

                                    <a
                                      href={`${window.location.origin}/tutor/${tutorId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <button
                                        className="flex-1 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500
                                    transition-all px-4 py-2.5 rounded-xl font-semibold shadow-lg
                                    active:scale-95 text-white border border-slate-500/20"
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
                                  <div className="pt-1 flex gap-3">
                                    <button
                                      className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl hover:from-emerald-500 hover:to-green-500 font-medium shadow-md border border-emerald-500/20 active:scale-95 transition-all"
                                      onClick={() =>
                                        handleStartChat(
                                          openDetails,
                                          confirmedTutor
                                        )
                                      }
                                    >
                                      Chat
                                    </button>
                                    <a
                                      href={`${window.location.origin}/tutor/${tutorId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <button
                                        className="flex-1 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500
                                           transition-all px-4 py-2 rounded-xl font-medium shadow-md
                                           active:scale-95 text-white border border-slate-500/20"
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
              <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-xl border border-white/10 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700/50 to-slate-600/50 flex items-center justify-center mx-auto mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-400"
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
                </div>
                <p className="text-gray-300 font-medium mb-1">
                  Waiting for Confirmation
                </p>
                <p className="text-gray-500 text-sm">
                  A tutor will accept your lesson request soon.
                </p>
              </div>
            )}

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
