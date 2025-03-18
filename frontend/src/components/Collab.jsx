import React, { useState } from 'react';
import { FaRegEnvelope } from 'react-icons/fa';
import { assets } from '../assets/assets';

const usersData = [
    {
        id: 1,
        name: "Alice Johnson",
        bio: "Frontend Developer.",
        profilePic: assets.user2,
        active: true,
        lastSeen: "Active now"
    },
    {
        id: 2,
        name: "Bob Smith",
        bio: "Backend Developer.",
        profilePic: assets.user5,
        active: false,
        lastSeen: "1 hour ago"
    },
    {
        id: 3,
        name: "Carol White",
        bio: "Fullstack Engineer.",
        profilePic: assets.user4,
        active: true,
        lastSeen: "Active now"
    },
    {
        id: 4,
        name: "David Green",
        bio: "Data Scientist.",
        profilePic: assets.user1,
        active: false,
        lastSeen: "30 min ago"
    },
    {
        id: 5,
        name: "Eve Black",
        bio: "DevOps Engineer.",
        profilePic: assets.user3,
        active: true,
        lastSeen: "Active now"
    },
];

const Collaboration = () => {
    const [showActive, setShowActive] = useState(true);

    // Filter users based on the toggle state
    const filteredUsers = usersData.filter(user => user.active === showActive);

    return (
        <div className="overflow-y-scroll h-full scrollbar-hide">
            {/* Top toggle switch for Active/Inactive users */}
            <div>
                <h1 className="text-purple-700 text-xl font-bold text-center mb-8">Collaboration</h1>
                <div className="flex  justify-left items-center gap-2">
                    <span className="text-sm">
                        {showActive ? 'Active Users' : 'Inactive Users'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={showActive}
                            onChange={() => setShowActive(!showActive)}
                        />
                        <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 dark:bg-gray-700 peer-checked:bg-purple-800 transition-all">
                            <span className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
                        </div>
                    </label>
                </div>
            </div>

            {/* User cards */}
            <div className="space-y-4 mt-5">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-gray-200 rounded-xl p-2 flex justify-between gap-2">
                        <img
                            className="rounded-full w-14 h-14 bg-purple-700"
                            src={user.profilePic}
                            alt={user.name}
                        />
                        <div>
                            <h2 className="text-sm font-semibold">{user.name}</h2>
                            <p className="text-xs">{user.bio}</p>
                            <p className="text-xs">
                                {user.active ? 'Active' : `Last seen: ${user.lastSeen}`}
                            </p>
                        </div>
                        <div className='w-fit justify-center items-center flex'>
                        <button className="p-2 rounded-full bg-purple-200 hover:bg-purple-100 cursor-pointer">
                            <FaRegEnvelope className="text-purple-700" size={18} />
                        </button>
                        </div>
                        
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Collaboration;
