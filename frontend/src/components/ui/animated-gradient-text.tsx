import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function AnimatedGradientText({ children, className = "" }: Props) {
  return (
    <span
      className={className}
      style={{
        background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #6366f1)",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: "gradientMove 3s linear infinite",
      }}
    >
      {children}
    </span>
  );
}