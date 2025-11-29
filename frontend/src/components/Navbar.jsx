import { Link, Outlet, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    navigate("/login")
  }

  return (
    <>
      <nav className="flex gap-4 justify-end border-b border-slate-700 bg-slate-900 px-8 py-4">
        <Link to="/" className="text-slate-100 hover:text-indigo-400 transition">
          Home
        </Link>
        <Link to="/browse" className="text-slate-100 hover:text-indigo-400 transition">
          Browse
        </Link>
        
        {isLoggedIn ? (
          <>
            <Link to="/upload" className="text-slate-100 hover:text-indigo-400 transition">
              Upload
            </Link>
            <Link to="/profile" className="text-slate-100 hover:text-indigo-400 transition">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-slate-100 hover:text-red-400 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-slate-100 hover:text-indigo-400 transition">
              Login
            </Link>
            <Link to="/signup" className="text-slate-100 hover:text-indigo-400 transition">
              Signup
            </Link>
          </>
        )}
      </nav>

      <main className="w-full">
        <Outlet />
      </main>
    </>
  )
}

export default Navbar
