"use client";
import { useState } from "react";
import ChordDiagram from "./ChordDiagram";

interface ChordHoverProps {
  chord: string;
  children: React.ReactNode;
}

export default function ChordHover({ chord, children }: ChordHoverProps) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-block cursor-pointer"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="chord">{children}</span>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2">
          <ChordDiagram chord={chord} />
        </div>
      )}
    </span>
  );
}
