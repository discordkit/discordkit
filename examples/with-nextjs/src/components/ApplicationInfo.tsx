"use client";

import React from "react";
import { trpc } from "../app/providers";

const ApplicationInfo: React.FC = () => {
  const { data, isLoading, isFetching } = trpc.getCurrentApplication.useQuery();
  console.log({ data });
  return (
    <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex" />
  );
};

export default ApplicationInfo;
