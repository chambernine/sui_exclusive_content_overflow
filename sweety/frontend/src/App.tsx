import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/common/navbar";
import Profile from "./pages/profile/editProfile";
import CreateDraftAlbum from "./pages/draftAlbum/createAlbumForm";
import Home from "./pages/home/home";
import AlbumRequestApproval from "./pages/approveRequestAlbum/albumRequestApproval";
import MyAlbumRequest from "./pages/myAlbumRequest/myAlbumRequest";
import "./App.css";
import ExploreAlbums from "./pages/exploreAlbums/exploreAlbums";
import BuyAlbum from "./pages/exploreAlbums/buyAlbum";

function App() {
  return (
    <main className="min-h-screen">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-draft" element={<CreateDraftAlbum />} />
          <Route path="/approve" element={<AlbumRequestApproval />} />
          <Route path="/my-requests" element={<MyAlbumRequest />} />
          <Route path="/explore-albums" element={<ExploreAlbums />} />
          <Route path="/explore-albums/:albumId" element={<BuyAlbum />} />

        </Routes>
      </BrowserRouter>
    </main>
  );
}

export default App;
