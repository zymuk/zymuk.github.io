import React from "react";
import usePageMeta from "../../../../utils/usePageMeta";
import "./BlendOverlay.css";

const BlendOverlay = () => {
  usePageMeta({
    title: "Blend Overlay",
    description:
      "A full-screen background photo layered with an animated color overlay driven by CSS mix-blend-mode.",
    keywords:
      "css, mix-blend-mode, overlay, keyframe, animation, color, creative coding",
  });

  return (
    <div
      className="blend-overlay-page"
      style={{ backgroundImage: 'url("/animations/blend-overlay/n1.avif")' }}
    >
      <aside className="blend-overlay-inner" />
    </div>
  );
};

export default BlendOverlay;