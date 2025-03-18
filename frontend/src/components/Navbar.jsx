import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faFileLines, faChartLine, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { faPiedPiperAlt } from '@fortawesome/free-brands-svg-icons';

function Navbar({ activeTab, setActiveTab }) {
    return (
        <nav className="bg-gradient-to-t from-purple-500 via-purple-600 to-purple-700 h-full w-20 z-10 flex flex-col rounded-3xl relative">
            <div className="text-5xl text-center font-bold text-purple-100 mb-8 border-b-2 border-indigo-100 pt-6 pb-5 cursor-pointer">
                <FontAwesomeIcon icon={faPiedPiperAlt} style={{ transform: 'scaleX(-1)' }} />
            </div>
            <div className='w-full items-center flex justify-center text-lg mb-5'>
                <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`cursor-pointer h-8 w-8 rounded-lg ${activeTab === "dashboard"
                        ? "bg-purple-900 font-semibold text-white"
                        : "text-gray-200 hover:bg-purple-300"
                        }`}
                >
                    <FontAwesomeIcon icon={faHouse} />
                </button>
            </div>

            <div className='w-full items-center flex justify-center text-lg mb-5'>
                <button
                    onClick={() => setActiveTab("checkLog")}
                    className={`cursor-pointer h-8 w-8 rounded-lg ${activeTab === "checkLog"
                        ? "bg-purple-900 font-semibold text-white"
                        : "text-gray-200 hover:bg-purple-300"
                        }`}
                >
                    <FontAwesomeIcon icon={faFileLines} />
                </button>
            </div>

            <div className='w-full items-center flex justify-center text-lg mb-5'>
                <button
                    onClick={() => setActiveTab("chartLine")}
                    className={`cursor-pointer h-8 w-8 rounded-lg ${activeTab === "chartLine"
                        ? "bg-purple-900 font-semibold text-white"
                        : "text-gray-200 hover:bg-purple-300"
                        }`}
                >
                    <FontAwesomeIcon icon={faChartLine} />
                </button>
            </div>


            <div className='absolute bottom-4 text-center w-full border-t-2 border-indigo-100 items-center flex justify-center text-lg pt-3'>
                <button
                    onClick={() => setActiveTab("logOut")}
                    className={`cursor-pointer h-8 w-8 rounded-lg ${activeTab === "logOut"
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
