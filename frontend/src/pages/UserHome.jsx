import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UserHome() {
  const [featured, setFeatured] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Example: get name from localStorage token
    const storedName = localStorage.getItem("username");
    if (storedName) setUserName(storedName);

    fetchFeatured();
    fetchBookmarks();
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/comics/featured");
      setFeatured(res.data);
    } catch (err) {
      console.log("Error fetching featured:", err);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const res = await axios.get(`http://localhost:5000/api/users/${userId}/bookmarks`);
      setBookmarks(res.data);
    } catch (err) {
      console.log("Error fetching bookmarks:", err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Welcome back, {userName} 👋</h1>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Featured Comics</h2>
        <div className="grid grid-cols-3 gap-4 mt-3">
          {featured.map((comic) => (
            <div key={comic._id} className="border p-3 rounded shadow">
              <img src={comic.thumbnail} alt={comic.title} />
              <h3 className="font-medium mt-2">{comic.title}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Your Bookmarks</h2>
        <div className="grid grid-cols-3 gap-4 mt-3">
          {bookmarks.map((comic) => (
            <div key={comic._id} className="border p-3 rounded shadow">
              <img src={comic.thumbnail} alt={comic.title} />
              <h3 className="font-medium mt-2">{comic.title}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
