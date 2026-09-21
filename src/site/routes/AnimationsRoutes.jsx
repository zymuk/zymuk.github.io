import { lazy } from "react";
import Animations from "../pages/home/animations/Animations";

const DragonCursor = lazy(() =>
  import("../pages/animations/dragon-cursor/DragonCursor"),
);
const GenerativeLines = lazy(() =>
  import("../pages/animations/generative-lines/GenerativeLines"),
);
const Lightbeams = lazy(() =>
  import("../pages/animations/lightbeams/Lightbeams"),
);
const BlendOverlay = lazy(() =>
  import("../pages/animations/blend-overlay/BlendOverlay"),
);
const AizawaAttractor = lazy(() =>
  import("../pages/animations/aizawa-attractor/AizawaAttractor"),
);

const AnimationsRoutes = [
  { path: "/animations", element: <Animations /> },
  { path: "/animations/dragon-cursor", element: <DragonCursor /> },
  { path: "/animations/generative-lines", element: <GenerativeLines /> },
  { path: "/animations/lightbeams", element: <Lightbeams /> },
  { path: "/animations/blend-overlay", element: <BlendOverlay /> },
  { path: "/animations/aizawa-attractor", element: <AizawaAttractor /> },
];

export default AnimationsRoutes;