import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Browse from "./pages/Browse";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import ComicReader from "./pages/ComicReader";
import EditComic from "./pages/EditComic";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navbar />}>
        <Route index element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="upload" element={<Upload />} />
        <Route path="profile" element={<Profile />} />
        <Route path="edit/:id" element={<EditComic />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="comic/:id" element={<ComicReader />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Route>
    </Routes>
  );
}

export default App;
