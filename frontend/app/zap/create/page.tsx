"use client";

// import { Appbar } from "@/components/Appbar";
import { useEffect, useState } from "react";
import { ZapCell } from "@/components/ZapCell";
// import { LinkButton } from "@/components/buttons/LinkButton";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { BACKEND_URL } from "@/app/config";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
// import { DarkButton } from "@/components/buttons/DarkButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/Input";

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

function Modal({
  index,
  onSelect,
  availableItems,
}: {
  index: number;
  onSelect: (
    props: null | {
      name: string;
      id: string;
      metadata: ActionMetadata | undefined;
    }
  ) => void;
  availableItems: { id: string; name: string; image: string }[];
}) {
  const [step, setStep] = useState(0);
  const [selectedAction, setSelectedAction] = useState<{
    id: string;
    name: string;
  }>();
  const isTrigger = index === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-lg mx-4 md:mx-auto rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Select {isTrigger ? "Trigger" : "Action"}
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

        <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
          {step === 1 && selectedAction?.id === "email" && (
            <EmailSelector
              setMetadata={(metadata) => {
                if (selectedAction) {
                  onSelect({
                    ...selectedAction,
                    metadata,
                  });
                }
              }}
            />
          )}
          {/* {step === 1 && selectedAction?.id === "send-sol" && (
            <SolanaSelector
              setMetadata={(metadata) => {
                if (selectedAction) {
                  onSelect({
                    ...selectedAction,
                    metadata,
                  });
                }
              }}
            />
          )} */}

          {step === 0 && (
            <div className="grid gap-3">
              {availableItems.map(({ id, name, image }) => (
                <div
                  key={id}
                  className="flex items-center gap-4 border border-gray-200 hover:border-blue-500 hover:shadow-md rounded-lg p-3 transition duration-200 cursor-pointer bg-white"
                  onClick={() => {
                    if (isTrigger || id === "notion" || id === "send-sol") {
                      onSelect({ id, name, metadata: undefined });
                    } else {
                      setStep((s) => s + 1);
                      setSelectedAction({ id, name });
                    }
                  }}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-white shrink-0">
                    <Image
                      src={image}
                      alt={name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <span className="text-gray-800 font-medium text-base">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// TODO: add images of triggers and actions in link boxes

function EmailSelector({
  setMetadata,
}: {
  setMetadata: (params: { body: string }) => void;
}) {
  // const [email, setEmail] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="space-y-4">
      {/* <Input
        label="To"
        type="text"
        placeholder="Recipient Email"
        onChange={(e) => setEmail(e.target.value)}
      /> */}
      <Input
        label="Body"
        type="text"
        placeholder="Message Content"
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="pt-2 text-right">
        <PrimaryButton
          onClick={() => {
            setMetadata({ body });
          }}
        >
          Submit
        </PrimaryButton>
      </div>
    </div>
  );
}

// function SolanaSelector({
//   setMetadata,
// }: {
//   setMetadata: (params: { amount: string; address: string }) => void;
// }) {
//   const [amount, setAmount] = useState("");
//   const [address, setAddress] = useState("");

//   return (
//     <div className="space-y-4">
//       <Input
//         label="To"
//         type="text"
//         placeholder="Wallet Address"
//         onChange={(e) => setAddress(e.target.value)}
//       />
//       <Input
//         label="Amount"
//         type="text"
//         placeholder="Amount in SOL"
//         onChange={(e) => setAmount(e.target.value)}
//       />
//       <div className="pt-2 text-right">
//         <PrimaryButton
//           onClick={() => {
//             setMetadata({ amount, address });
//           }}
//         >
//           Submit
//         </PrimaryButton>
//       </div>
//     </div>
//   );
// }
