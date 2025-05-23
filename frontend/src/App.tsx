import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "./providers/ThemeProvider";

import Home from "./pages/home/home";
import AlbumRequestApproval from "./pages/approveRequestAlbum/albumRequestApproval";
import LandingPage from "./pages/landing/landing";

import { AppLayout } from "./components/layout/AppLayout";
import { ProfilePage } from "./pages/profile/viewProfile";
import CreateAlbumPage from "./pages/draftAlbum/createAlbumForm";
import ExploreAlbums from "./pages/exploreAlbums/exploreAlbums";
import BuyAlbum from "./pages/exploreAlbums/buyAlbum";
import PublishDraftAlbum from "./pages/approveRequestAlbum/waitForSign";
import ViewPurchasedAlbum from "./pages/myPurchase/viewPurchasedAlbum";
import ViewPublishAlbum from "./pages/profile/viewPublishAlbum";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: <LandingPage />,
        },
        {
          path: "home",
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
          path: "management-contents",
          element: <AlbumRequestApproval />,
        },
        {
          path: "management-contents/:albumId",
          element: <PublishDraftAlbum />,
        },
        {
          path: "explore-albums",
          element: <ExploreAlbums />,
        },
        {
          path: "explore-albums/:albumId",
          element: <BuyAlbum />,
        },
        {
          path: "profile/myPurchase/:albumId",
          element: <ViewPurchasedAlbum />,
        },
        {
          path: "profile/myPublish/:albumId",
          element: <ViewPublishAlbum />,
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
