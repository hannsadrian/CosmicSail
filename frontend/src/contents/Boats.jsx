import React from 'react';

function Boats() {
    const logout = () => {
        localStorage.removeItem("username")
        localStorage.removeItem("token")
        window.location.reload()
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-black">
            <div className="m-auto">
                <h1 className="dark:text-gray-200">Boats</h1>
                <button onClick={logout} className="w-40 py-1 rounded-lg bg-red-600 hover:ring ring-red-800 text-white transition duration-200">Logout</button>
            </div>
        </div>
    );
}

export default Boats;