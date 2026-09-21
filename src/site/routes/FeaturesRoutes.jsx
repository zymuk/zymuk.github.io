import { lazy } from "react";
import Features from "../pages/home/features/Features";
import usePageMeta from "../../utils/usePageMeta";

const FeaturesLanding = () => {
  usePageMeta({ title: "Features" });
  return <Features />;
};

const Calculator = lazy(() => import("../pages/calculator/Calculator"));
const Notes = lazy(() => import("../pages/notes/Notes"));
const NumerologyName = lazy(() =>
  import("../pages/numerologyName/NumerologyName"),
);
const TextEncoderDecoder = lazy(() =>
  import("../pages/textEncoderDecoder/TextEncoderDecoder"),
);
const SaveWeb = lazy(() => import("../pages/saveWeb/SaveWeb"));
const EncryptDecrypt = lazy(() =>
  import("../pages/encryptDecrypt/EncryptDecrypt"),
);
const JsonFormatter = lazy(() => import("../pages/jsonFormatter/JsonFormatter"));
const Reminders = lazy(() => import("../pages/reminders/Reminders"));
const ImageEditor = lazy(() => import("../pages/imageEditor/ImageEditor"));

const FeaturesRoutes = [
  { path: "/features", element: <FeaturesLanding /> },
  { path: "/features/calculator", element: <Calculator /> },
  { path: "/features/notes", element: <Notes /> },
  { path: "/features/numerology-name", element: <NumerologyName /> },
  { path: "/features/text-encoder-decoder", element: <TextEncoderDecoder /> },
  { path: "/features/save-web", element: <SaveWeb /> },
  { path: "/features/encrypt-decrypt", element: <EncryptDecrypt /> },
  { path: "/features/json-formatter", element: <JsonFormatter /> },
  { path: "/features/reminders", element: <Reminders /> },
  { path: "/features/image-editor", element: <ImageEditor /> },
];

export default FeaturesRoutes;