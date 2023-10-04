"use client";

import React from "react";
import Image from "next/image";
import { userAvatar } from "@discordkit/client";
import { trpc } from "../app/providers";

const ApplicationInfo: React.FC = () => {
  const { data, isLoading } = trpc.getCurrentApplication.useQuery();
  console.log({ data });

  if (isLoading) {
    return <div>{`Loading...`}</div>;
  }

  if (data) {
    return (
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        {data.icon ? (
          <Image
            alt={data.name}
            src={userAvatar({
              user: data.id,
              avatar: data.icon,
              params: { size: 256 }
            })}
            width={256}
            height={256}
          />
        ) : null}
      </div>
    );
  }
  return null;
};

export default ApplicationInfo;
