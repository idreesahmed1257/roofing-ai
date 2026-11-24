"use client";

import Image from "next/image";

export default function HeroTalkButton() {
  return (
    <button
      type="button"
      className="btn-primary btn-agent"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("schoenherr:start-voice"));
      }}
    >
      <Image
        src="/bot.png"
        alt=""
        width={36}
        height={36}
        className="btn-agent-avatar"
      />
      Talk to our AI sales agent
    </button>
  );
}
