"use client";

import React from "react";
import { MathJaxContext } from "better-react-mathjax";

const config = {
  loader: { load: ["input/tex", "output/chtml"] },
  tex: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
  },
  options: {
    enableMenu: false,
    renderActions: {
      addMenu: [0, "", ""]
    }
  },
};

export default function MathJaxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MathJaxContext version={3} config={config}>
      {children}
    </MathJaxContext>
  );
}
