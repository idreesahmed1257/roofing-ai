"use client";

export default function HeroTalkButton({
  label = "Get a free estimate",
  className = "btn-primary",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.dispatchEvent(new CustomEvent("ridgeform:start-voice"));
      }}
    >
      {label}
    </button>
  );
}
