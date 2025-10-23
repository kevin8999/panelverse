import { Link, Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <nav style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "flex-end",
            borderBottom: "1px solid #ccc",
            padding: "1rem"
        }}>
        <Link to="/">Home</Link>
        <Link to="/browse">Browse</Link>
        <Link to="/upload">Upload</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </nav>

      <main style={{ padding: "20px" }}>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
