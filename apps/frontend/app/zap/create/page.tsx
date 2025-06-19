"use client";

// import { Appbar } from "@/components/Appbar";
import { useEffect, useState } from "react";
import { ZapCell } from "@/components/ZapCell";
// import { LinkButton } from "@/components/buttons/LinkButton";
// import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { BACKEND_URL } from "@/app/config";
// import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
// import { DarkButton } from "@/components/buttons/DarkButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";

type ActionMetadata = { body: string };
// | { email: string; body: string }
// | { address: string; amount: string };

function useAvailableActionsAndTriggers() {
  const [availableActions, setAvailableActions] = useState<
    { id: string; name: string; image: string }[]
  >([]);
  const [availableTriggers, setAvailableTriggers] = useState<
    { id: string; name: string; image: string }[]
  >([]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/trigger/available`)
      .then((x) => setAvailableTriggers(x.data.availableTriggers));

    axios
      .get(`${BACKEND_URL}/api/v1/action/available`)
      .then((x) => setAvailableActions(x.data.availableActions));
  }, []);

  return {
    availableActions,
    availableTriggers,
  };
}

export default function CreateZap() {
  const router = useRouter();
  const { availableActions, availableTriggers } =
    useAvailableActionsAndTriggers();

  const [selectedTrigger, setSelectedTrigger] = useState<{
    id: string;
    name: string;
  }>();
  const [selectedActions, setSelectedActions] = useState<
    {
      index: number;
      availableActionId: string;
      availableActionName: string;
      metadata: ActionMetadata | undefined;
    }[]
  >([]);
  const [selectedModalIndex, setSelectedModalIndex] = useState<null | number>(
    null
  );
  const [zapName, setZapName] = useState("");

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col">
      {/* Header */}
      <div className="flex justify-end p-4 bg-slate-200">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          onClick={async () => {
            if (!selectedTrigger?.id) return;

            const response = await axios.post(
              `${BACKEND_URL}/api/v1/zap`,
              {
                name: zapName.trim() !== "" ? zapName : "Untitled Zap",
                availableTriggerId: selectedTrigger.id,
                triggerMetadata: {},
                actions: selectedActions.map((a) => ({
                  availableActionId: a.availableActionId,
                  actionMetadata: a.metadata,
                })),
              },
              {
                headers: {
                  Authorization: localStorage.getItem("token"),
                },
              }
            );

            console.log(response);
            router.push("/dashboard");
          }}
        >
          + Publish
        </Button>
      </div>

      {/* Body */}
      <div className="flex flex-col items-center gap-6 py-8">
        {/* Zap Name Input */}
        <Card className="w-full max-w-md p-4">
          <input
            type="text"
            placeholder="Enter Zap Name"
            value={zapName}
            onChange={(e) => setZapName(e.target.value)}
            className="w-full px-4 py-2 text-gray-800 placeholder-gray-500 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Card>

        {/* Trigger */}
        <div className="relative flex flex-col items-center gap-2">
          <ZapCell
            onClick={() => setSelectedModalIndex(1)}
            name={selectedTrigger?.name ?? "Trigger"}
            index={1}
            onDelete={
              selectedTrigger ? () => setSelectedTrigger(undefined) : undefined
            }
          />

          <div className="w-px h-6 bg-gray-400" />
        </div>

        {/* Actions */}
        {selectedActions.map((action, i) => (
          <div key={i} className="relative flex flex-col items-center gap-2">
            <ZapCell
              onClick={() => setSelectedModalIndex(action.index)}
              name={action.availableActionName || "Action"}
              index={action.index}
              onDelete={() =>
                setSelectedActions((actions) =>
                  actions
                    .filter((_, idx) => idx !== i)
                    .map((a, idx) => ({ ...a, index: idx + 2 }))
                )
              }
            />
            <div className="w-px h-6 bg-gray-400" />
          </div>
        ))}

        {/* + Button */}
        <button
          onClick={() => {
            setSelectedActions((a) => [
              ...a,
              {
                index: a.length + 2,
                availableActionId: "",
                availableActionName: "",
                metadata: undefined,
              },
            ]);
          }}
          className="h-12 w-12 rounded-full bg-white text-xl font-bold shadow-md hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-center border border-gray-300"
        >
          +
        </button>
      </div>

      {/* Modal */}
      {selectedModalIndex && (
        <Modal
          availableItems={
            selectedModalIndex === 1 ? availableTriggers : availableActions
          }
          onSelect={(props) => {
            if (!props) {
              setSelectedModalIndex(null);
              return;
            }

            if (selectedModalIndex === 1) {
              setSelectedTrigger({ id: props.id, name: props.name });
            } else {
              setSelectedActions((a) => {
                const updated = [...a];
                updated[selectedModalIndex - 2] = {
                  index: selectedModalIndex,
                  availableActionId: props.id,
                  availableActionName: props.name,
                  metadata: props.metadata,
                };
                return updated;
              });
            }

            setSelectedModalIndex(null);
          }}
          index={selectedModalIndex}
        />
      )}
    </div>
  );
}
