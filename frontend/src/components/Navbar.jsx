import { Link, Outlet, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { API_BASE_URL } from "../config"

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check if user is logged in and fetch their role
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
    
    if (token) {
      fetchUserRole()
    } else {
      setUserRole(null)
    }
  }, [location.pathname])
  
  const fetchUserRole = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUserRole(data.role)
      }
    } catch (err) {
      console.error("Failed to fetch user role:", err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    setUserRole(null)
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
            {/* Only show Upload link for artists and admins */}
            {(userRole === "artist" || userRole === "admin") && (
              <Link to="/upload" className="text-slate-100 hover:text-indigo-400 transition">
                Upload
              </Link>
            )}
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
