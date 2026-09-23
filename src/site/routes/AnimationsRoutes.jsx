import { lazy } from "react";
import Animations from "../pages/home/animations/Animations";
import usePageMeta from "../../utils/usePageMeta";

const AnimationsLanding = () => {
  usePageMeta({ title: "Animations" });
  return <Animations />;
};

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
const ExplosiveAttraction = lazy(() =>
  import("../pages/animations/explosive-attraction/ExplosiveAttraction"),
);
const ThreeDRowingBoat = lazy(() =>
  import("../pages/animations/3d-rowing-boat/ThreeDRowingBoat"),
);
const NotComets = lazy(() =>
  import("../pages/animations/not-comets/NotComets"),
);
const Fireworks = lazy(() => import("../pages/animations/fireworks/Fireworks"));

const AnimationsRoutes = [
  { path: "/animations", element: <AnimationsLanding /> },
  { path: "/animations/dragon-cursor", element: <DragonCursor /> },
  { path: "/animations/generative-lines", element: <GenerativeLines /> },
  { path: "/animations/lightbeams", element: <Lightbeams /> },
  { path: "/animations/blend-overlay", element: <BlendOverlay /> },
  { path: "/animations/aizawa-attractor", element: <AizawaAttractor /> },
  {
    path: "/animations/explosive-attraction",
    element: <ExplosiveAttraction />,
  },
  { path: "/animations/3d-rowing-boat", element: <ThreeDRowingBoat /> },
  { path: "/animations/not-comets", element: <NotComets /> },
  { path: "/animations/fireworks", element: <Fireworks /> },
];

export default AnimationsRoutes;