"use client";

import React from "react";
import Image from "next/image";
import { userAvatar } from "@discordkit/client/images/userAvatar";
import { trpc } from "../app/providers";

export const ApplicationInfo: React.FC = () => {
  const { data, isLoading } = trpc.getCurrentApplication.useQuery();

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
              params: { size: 128 }
            })}
            width={128}
            height={128}
          />
        ) : null}

        <h1>{data.name}</h1>
      </div>
    );
  }
  return null;
};
