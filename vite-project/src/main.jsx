// index.js
import React, { Suspense, lazy } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from './components/AuthContext';
import AuthRequiredRoute from "./components/AuthRequiredRoute";
import { SearchProvider } from './components/SearchContext'; 


// Lazy-loaded components
const VideoDetails = lazy(() => import("./components/VideoDetails"));
const Videos = lazy(() => import("./components/Videos"));
const ChannelPage=lazy(() => import("./components/ChannelPage"));
const ChannelUpdate = lazy(() => import("./components/ChannelUpdate"));
// const ChannelCreationForm = lazy(() => import("./components/ChannelCreationForm"));
const ChannelVideosManagement=lazy(() => import("./components/ChannelVideosManagement"));
const VideoEditForm=lazy(() => import("./components/VideoEditForm"));
const LoginForm=lazy(() => import("./components/LoginForm"));


const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Videos />
          </Suspense>
        ),
      },
      {
        path: "/video/:videoId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <VideoDetails />
          </Suspense>
        ),
      },
      {
        path: "/channel/:channelId/:userId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AuthRequiredRoute>
              <ChannelPage />
            </AuthRequiredRoute>
          </Suspense>
        ),
      },

      {
        path: "/channels/:userId/:channelId/edit",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ChannelUpdate />
          </Suspense>
        ),
      },
      {
        path: "/channel/:channelId/videos",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ChannelVideosManagement />
          </Suspense>
        ),
      },
      {
        path: "/edit-video/:channelId/:videoId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <VideoEditForm />
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        ),
      },


      
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <SearchProvider> 
        <RouterProvider router={appRouter} />
      </SearchProvider>
    </AuthProvider>
  </StrictMode>
);