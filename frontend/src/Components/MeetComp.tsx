import React from "react";
import { useNavigate } from "react-router-dom";

interface MeetProps {
  theoremName: string;
  teacherName: string;
  imageUrl: string;
}

const MeetComp: React.FC<MeetProps> = ({
  theoremName,
  teacherName,
  imageUrl,
}) => {
  const navigate = useNavigate();

  return (
    <div className="backdrop-blur-lg bg-slate-900/60 border border-white/20 rounded-2xl overflow-hidden shadow-xl hover:bg-slate-900/80 transition-all duration-300 flex flex-col">
      <div className="h-40 w-full">
        <img
          src={imageUrl}
          alt={theoremName}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col justify-between flex-1 p-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{theoremName}</h2>
          <p className="text-gray-300 mt-1">Instructor: {teacherName}</p>
        </div>

        <button
          onClick={() => navigate("/meeting")}
          className="mt-4 w-full bg-purple-900 hover:bg-purple-800 text-white py-2 rounded-md transition"
        >
          Join Now
        </button>
      </div>
    </div>
  );
};

export default MeetComp;
