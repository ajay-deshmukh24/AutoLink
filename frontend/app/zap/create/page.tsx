"use client";

import { Appbar } from "@/components/Appbar";
import { useEffect, useState } from "react";
import { ZapCell } from "@/components/ZapCell";
// import { LinkButton } from "@/components/buttons/LinkButton";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { BACKEND_URL } from "@/app/config";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";

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
    }[]
  >([]);
  const [selectedModalIndex, setSelectedModalIndex] = useState<null | number>(
    null
  );

  return (
    <div>
      <Appbar></Appbar>
      <div className="flex justify-end">
        <PrimaryButton
          onClick={async () => {
            if (!selectedTrigger?.id) {
              return;
            }

            const response = await axios.post(
              `${BACKEND_URL}/api/v1/zap`,
              {
                availableTriggerId: selectedTrigger.id,
                triggerMetadata: {},
                actions: selectedActions.map((a) => ({
                  availableActionId: a.availableActionId,
                  actionMetadata: {},
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
          Publish
        </PrimaryButton>
      </div>
      <div className="w-full min-h-screen bg-slate-200 flex flex-col justify-center ">
        <div className="flex justify-center w-full">
          <ZapCell
            onClick={() => {
              setSelectedModalIndex(1);
            }}
            name={selectedTrigger?.name ? selectedTrigger.name : "Trigger"}
            index={1}
          ></ZapCell>
        </div>
        <div className="w-full pt-2 pb-2">
          {selectedActions.map((action, index) => (
            <div className="flex justify-center pt-2" key={index}>
              <ZapCell
                onClick={() => {
                  setSelectedModalIndex(action.index);
                }}
                name={
                  action.availableActionName
                    ? action.availableActionName
                    : "Action"
                }
                index={action.index}
              ></ZapCell>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <div>
            <PrimaryButton
              onClick={() => {
                setSelectedActions((a) => [
                  ...a,
                  {
                    index: a.length + 2,
                    availableActionId: "",
                    availableActionName: "",
                  },
                ]);
              }}
            >
              <div className="text-2xl">+</div>
            </PrimaryButton>
          </div>
        </div>
      </div>
      {selectedModalIndex && (
        <Modal
          availableItems={
            selectedModalIndex === 1 ? availableTriggers : availableActions
          }
          onSelect={(props: null | { name: string; id: string }) => {
            if (props === null) {
              setSelectedModalIndex(null);
              return;
            }

            if (selectedModalIndex == 1) {
              setSelectedTrigger({
                id: props.id,
                name: props.name,
              });
            } else {
              setSelectedActions((a) => {
                const newActions = [...a];
                newActions[selectedModalIndex - 2] = {
                  index: selectedModalIndex,
                  availableActionId: props.id,
                  availableActionName: props.name,
                };
                return newActions;
              });
            }

            setSelectedModalIndex(null);
          }}
          index={selectedModalIndex}
        ></Modal>
      )}
    </div>
  );
}

function Modal({
  index,
  onSelect,
  availableItems,
}: {
  index: number;
  onSelect: (props: null | { name: string; id: string }) => void;
  availableItems: { id: string; name: string; image: string }[];
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-2xl mx-4 md:mx-auto rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">
            Select {index === 1 ? "Trigger" : "Action"}
          </h2>
          <button
            onClick={() => onSelect(null)}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {availableItems.map(({ id, name, image }) => {
            // console.log("Rendering image:", image);
            return (
              <div
                key={id}
                className="flex items-center gap-4 border border-gray-100 hover:border-blue-500 hover:shadow-lg rounded-xl p-4 transition duration-200 cursor-pointer"
                onClick={() => onSelect({ id, name })}
              >
                <Image
                  src={image}
                  alt={name}
                  width={50}
                  height={50}
                  className="rounded-full object-cover border border-gray-200"
                />
                <span className="text-gray-800 font-medium text-lg">
                  {name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// TODO: add images of triggers and actions in link boxes
