// index.js
import React, { Suspense, lazy } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from './components/AuthContext';
import AuthRequiredRoute from './components/AuthRequiredRoute';

// Lazy-loaded components
const VideoDetails = lazy(() => import("./components/VideoDetails"));
const Videos = lazy(() => import("./components/Videos"));
const ChannelPage=lazy(() => import("./components/ChannelPage"));
const ChannelCustomizationPage=lazy(() => import("./components/ChannelCustomizationPage"));

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
        path: "/channel/:channelId/edit/:userId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AuthRequiredRoute>
              <ChannelCustomizationPage />
            </AuthRequiredRoute>
          </Suspense>
        ),
      },
      
      
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={appRouter} />
    </AuthProvider>
  </StrictMode>
);