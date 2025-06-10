"use client";

// import { Appbar } from "@/components/Appbar";
import { DarkButton } from "@/components/buttons/DarkButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL, HOOKS_URL } from "../config";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/components/buttons/LinkButton";
import Image from "next/image";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ZapDashboardHero } from "@/components/ZapDashboardHero";
// import { Footer } from "@/components/Footer";

interface Zap {
  id: string;
  name: string;
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

export default function Dashboard() {
  // const { loading, zaps } = useZaps();
  const [zaps, setZaps] = useState<Zap[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchZaps = async () => {
    try {
      const res = await axios
        .get(`${BACKEND_URL}/api/v1/zap`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        })
        .then((res) => {
          setZaps(res.data.zaps);
          setLoading(false);
        });

      console.log(res);
    } catch (err) {
      console.error("Failed to fetch zaps", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZaps();
  }, []);

  const deleteZap = async (zapId: string) => {
    try {
      // console.log("reach 1");
      // console.log(zapId);
      // console.log(localStorage.getItem("token"));

      await axios.delete(`${BACKEND_URL}/api/v1/zap/${zapId}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      // console.log("reach 2");
      // Optimistically update UI
      setZaps((prev) => prev.filter((z) => z.id !== zapId));
      // console.log("reach 3");
    } catch (err) {
      alert("Failed to delete zap.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* <Appbar /> */}

      <div className="flex-grow">
        <div className="flex justify-center pt-8 pb-24">
          <div className="w-full max-w-screen-lg px-4">
            {/* Header Row */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-2xl font-bold">My Zaps</div>
              <DarkButton onClick={() => router.push("/zap/create")}>
                + Create
              </DarkButton>
            </div>

            {/* Content */}
            {loading ? (
              <div className="text-gray-600">Loading...</div>
            ) : zaps.length === 0 ? (
              <div className="flex justify-center">
                <div className="w-full md:w-[600px]">
                  <ZapDashboardHero />
                </div>
              </div>
            ) : (
              <ZapTable zaps={zaps} onDelete={deleteZap} />
            )}
          </div>
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
}

function ZapTable({
  zaps,
  onDelete,
}: {
  zaps: Zap[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-8 max-w-screen-lg w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b text-gray-600">
            <th className="py-2 px-4">Zap Flow</th>
            <th className="py-2 px-4">Zap ID</th>
            <th className="py-2 px-4">name</th>
            <th className="py-2 px-4">Webhook URL</th>
            <th className="py-2 px-4">Trash</th>
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
              <td className="py-3 px-4 text-sm text-gray-700">{z.name}</td>
              <td className="py-3 px-4 text-sm text-blue-700 break-all">
                {`${HOOKS_URL}/hooks/catch/1/${z.id}`}
              </td>
              <td className="py-3 px-4">
                <LinkButton onClick={() => onDelete(z.id)}>
                  <TrashIcon className="h-5 w-5" />
                </LinkButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
