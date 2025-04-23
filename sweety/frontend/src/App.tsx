import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/common/navbar";
import Profile from "./pages/profile/editProfile";
import RequestApprovals from "./pages/approveAlbum/arroveAlbum";
import CreateDraftAlbum from "./pages/draftAlbum/createAlbumForm";
import Home from "./pages/home/home";

function App() {
  return (
    <div className="min-h-screen">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-draft" element={<CreateDraftAlbum />} />
          <Route path="/requests" element={<RequestApprovals />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
