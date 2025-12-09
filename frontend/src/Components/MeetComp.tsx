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
    <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300 flex flex-col w-full">
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
          className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg border border-emerald-500/20"
        >
          Join Now
        </button>
      </div>
    </div>
  );
};

export default MeetComp;
