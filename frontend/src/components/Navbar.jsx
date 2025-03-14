import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faFileLines, faChartLine, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { faPiedPiperAlt } from '@fortawesome/free-brands-svg-icons';

function Navbar({ activeTab, setActiveTab }) {
    return (
        <nav className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 h-full w-20 z-10 flex flex-col rounded-3xl relative">
            <div className="text-3xl text-center font-bold text-white mb-8 border-b-2 border-indigo-100 pt-6 pb-5 cursor-pointer">
                <FontAwesomeIcon icon={faPiedPiperAlt} style={{ transform: 'scaleX(-1)' }} />
            </div>
            <button
                onClick={() => setActiveTab("dashboard")}
                className={`cursor-pointer text-md w-fit px-3 py-2.5 mx-auto rounded-md ${activeTab === "dashboard"
                    ? "bg-purple-900 font-semibold text-white"
                    : "text-gray-200 hover:bg-purple-300"
                    }`}
            >
                <FontAwesomeIcon icon={faHouse} />
            </button>
            <button
                onClick={() => setActiveTab("checkLog")}
                className={`cursor-pointer text-sm w-fit px-3.5 py-2.5 mt-3 mx-auto rounded-md text-lg ${activeTab === "checkLog"
                    ? "bg-purple-900 font-semibold text-white"
                    : "text-gray-200 hover:bg-purple-300"
                    }`}
            >
                <FontAwesomeIcon icon={faFileLines} />
            </button>
            <button
                onClick={() => setActiveTab("chartLine")}
                className={`cursor-pointer text-sm w-fit px-3.5 py-2.5 mt-3 mx-auto rounded-md text-lg ${activeTab === "chartLine"
                    ? "bg-purple-900 font-semibold text-white"
                    : "text-gray-200 hover:bg-purple-300"
                    }`}
            >
                <FontAwesomeIcon icon={faChartLine} />
            </button>
            <div className='absolute bottom-4 text-center w-full border-t-2 border-indigo-100'>
                <button
                    onClick={() => setActiveTab("logOut")}
                    className={`cursor-pointer text-sm w-fit px-3.5 py-2.5 mt-3 mx-auto rounded-md text-lg ${activeTab === "logOut"
                        ? "bg-purple-900 font-semibold text-white"
                        : "text-gray-200 hover:bg-purple-300"
                        }`}
                >
                    <FontAwesomeIcon icon={faRightFromBracket} />
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
