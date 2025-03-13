import React from "react";

function Navbar({ activeTab, setActiveTab }) {
    return (
        <nav className="bg-purple-900 h-full w-25 z-10 flex flex-col rounded-4xl">
            <div className="text-4xl text-center font-bold text-white mb-8 border-b-6 border-gray-200 pt-4 pb-4">LV</div>
            <button
                onClick={() => setActiveTab("dashboard")}
                className={`cursor-pointer text-lg w-fit px-4 py-3.5 mx-auto rounded-full ${activeTab === "dashboard"
                        ? "bg-purple-700 font-semibold text-white"
                        : "text-gray-200 hover:bg-purple-800"
                    }`}
            >
                DB
            </button>
            <button
                onClick={() => setActiveTab("checkLog")}
                className={`cursor-pointer text-lg w-fit px-4 py-3.5 mt-5 mx-auto rounded-full ${activeTab === "checkLog"
                        ? "bg-purple-700 font-semibold text-white"
                        : "text-gray-200 hover:bg-purple-800"
                    }`}
            >
                CL
            </button>
        </nav>
    );
}

export default Navbar;
