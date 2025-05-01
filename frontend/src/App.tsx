import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "./providers/ThemeProvider";

import Home from "./pages/home/home";
import AlbumRequestApproval from "./pages/approveRequestAlbum/albumRequestApproval";

import { AppLayout } from "./components/layout/AppLayout";
import { ProfilePage } from "./pages/profile/viewProfile";
import CreateAlbumPage from "./pages/draftAlbum/createAlbumForm";
import ExploreAlbums from "./pages/exploreAlbums/exploreAlbums";
import BuyAlbum from "./pages/exploreAlbums/buyAlbum";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "profile",
          element: <ProfilePage />,
        },
        {
          path: "create-draft",
          element: <CreateAlbumPage />,
        },
        {
          path: "album-requests",
          element: <AlbumRequestApproval />,
        },
        {
          path: "explore-albums",
          element: <ExploreAlbums />,
        },
        {
          path: "explore-albums/:albumId",
          element: <BuyAlbum />,
        },
      ],
    },
  ]);
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen transition-colors duration-300 bg-background text-foreground">
        <RouterProvider router={router} />
      </div>
    </ThemeProvider>
  );
}

export default App;
