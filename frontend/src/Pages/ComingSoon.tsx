import React from "react";

const ComingSoon: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">
          Coming Soon
        </h1>
        <p className="text-xl md:text-2xl text-gray-400">
          We're working on something amazing!
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
