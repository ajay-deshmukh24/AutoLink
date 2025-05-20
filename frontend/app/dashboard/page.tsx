"use client";

import { Appbar } from "@/components/Appbar";
import { DarkButton } from "@/components/buttons/DarkButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL, HOOKS_URL } from "../config";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/components/buttons/LinkButton";
import Image from "next/image";

interface Zap {
  id: string;
  triggerId: string;
  userId: number;
  actions: {
    id: string;
    zapId: string;
    actionId: string;
    sortingOrder: number;
    type: {
      id: string;
      name: string;
      image: string;
    };
  }[];
  trigger: {
    id: string;
    zapId: string;
    triggerId: string;
    type: {
      id: string;
      name: string;
      image: string;
    };
  };
}

function useZaps() {
  const [loading, setLoading] = useState(true);
  const [zaps, setZaps] = useState<Zap[]>([]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/zap`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setZaps(res.data.zaps);
        setLoading(false);
      });
  }, []);

  return {
    loading,
    zaps,
  };
}

export default function Dashboard() {
  const { loading, zaps } = useZaps();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <Appbar />

      <div className="flex justify-center pt-8">
        <div className="w-full max-w-screen-lg px-4">
          {/* Header Row */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-2xl font-bold">My Zaps</div>
            <DarkButton
              onClick={() => {
                router.push("/zap/create");
              }}
            >
              Create
            </DarkButton>
          </div>

          {/* TODO: Add beautiful loader */}
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : (
            <ZapTable zaps={zaps} />
          )}
        </div>
      </div>
    </div>
  );
}

function ZapTable({ zaps }: { zaps: Zap[] }) {
  const router = useRouter();

  return (
    <div className="p-8 max-w-screen-lg w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b text-gray-600">
            <th className="py-2 px-4">Zap Flow</th>
            <th className="py-2 px-4">Zap ID</th>
            <th className="py-2 px-4">Created</th>
            <th className="py-2 px-4">Webhook URL</th>
            <th className="py-2 px-4">Run</th>
          </tr>
        </thead>
        <tbody>
          {zaps.map((z) => (
            <tr
              key={z.id}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Image
                    src={z.trigger.type.image}
                    width={20}
                    height={20}
                    className="rounded"
                    alt="Trigger"
                  />
                  {z.actions.map((x, idx) => (
                    <div key={x.id} className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">→</span>
                      <Image
                        src={x.type.image}
                        width={20}
                        height={20}
                        className="rounded"
                        alt={`Action ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </td>

              <td className="py-3 px-4 text-sm text-gray-700 break-words">
                {z.id}
              </td>
              <td className="py-3 px-4 text-sm text-gray-700">Nov 13, 2023</td>
              <td className="py-3 px-4 text-sm text-blue-700 break-all">
                {`${HOOKS_URL}/hooks/catch/1/${z.id}`}
              </td>
              <td className="py-3 px-4">
                <LinkButton onClick={() => router.push("/zap/" + z.id)}>
                  Go
                </LinkButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
