import React from "react";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
        <h1 className="text-xl font-bold text-indigo-600">PanelVerse</h1>
        <ul className="flex space-x-6 text-gray-700 font-medium">
          <li><a href="/home" className="hover:text-indigo-600">Home</a></li>
          <li><a href="/browse" className="hover:text-indigo-600">Browse</a></li>
          <li><a href="/upload" className="hover:text-indigo-600">Upload</a></li>
          <li><a href="/profile" className="hover:text-indigo-600">Profile</a></li>
          <li><a href="/logout" className="hover:text-indigo-600">Logout</a></li>
        </ul>
      </div>
    </nav>
  );
}
