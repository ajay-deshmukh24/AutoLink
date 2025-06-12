"use client";

import { useRouter } from "next/navigation";

export const ZapDashboardHero = () => {
  const router = useRouter();

  return (
    <div className="bg-[#f5f3eb] rounded-lg p-10 flex flex-col items-center gap-4 ">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        height="36"
        width="36"
        // size="36"
        color="GrayWarm6"
        name="miscBoltOutlined"
      >
        <path
          fill="rgb(136, 130, 126)"
          d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm1-14-5.87 7H11v5l5.87-7H13V6Z"
        ></path>
      </svg>
      {/* <i className="fas fa-bolt text-gray-500 text-3xl"></i> */}
      <h2 className="text-black text-xl font-semibold">
        You haven’t created a Zap yet
      </h2>
      <p className="text-gray-600 text-sm">
        Build automated workflows by creating your first Zap.
      </p>
      <div className="flex gap-3 mt-2">
        {/* <button
          type="button"
          className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 text-gray-800 text-sm hover:bg-gray-100"
        >
          <i className="fas fa-globe"></i> Explore templates
        </button> */}
        <button
          type="button"
          className="flex items-center gap-2 bg-indigo-300 hover:bg-indigo-400 text-indigo-900 text-sm rounded px-4 py-2"
          onClick={() => {
            router.push("/zap/create");
          }}
        >
          <i className="fas fa-plus"></i> Create Zap
        </button>
      </div>
    </div>
  );
};
