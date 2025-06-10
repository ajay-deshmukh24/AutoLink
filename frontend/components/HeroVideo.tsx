"use client";

import { Card } from "@/components/ui/card";

export const HeroVideo = () => {
  return (
    <div className="flex justify-center px-4 md:px-8 lg:px-16 py-10">
      <Card className="rounded-2xl shadow-lg overflow-hidden max-w-5xl w-full">
        <video
          src="https://res.cloudinary.com/zapier-media/video/upload/f_auto,q_auto/v1706042175/Homepage%20ZAP%20Jan%2024/012324_Homepage_Hero1_1920x1080_pwkvu4.mp4"
          className="w-full h-auto"
          controls={false}
          muted
          autoPlay
          loop
          playsInline
        />
      </Card>
    </div>
  );
};
