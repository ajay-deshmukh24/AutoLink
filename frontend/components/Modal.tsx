"use client";

import { useState } from "react";
// import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import Image from "next/image";
// import { Input } from "@/components/Input";
import { EmailSelector } from "./EmailSelector";

type ActionMetadata = { body: string };
// | { email: string; body: string }
// | { address: string; amount: string };

export const Modal = ({
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
}) => {
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
};

// TODO: add images of triggers and actions in link boxes

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
