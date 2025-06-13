"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { Input } from "@/components/Input";

export const EmailSelector = ({
  setMetadata,
}: {
  setMetadata: (params: { body: string }) => void;
}) => {
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
};
