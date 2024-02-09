"use client";

import { Button } from "@nextui-org/react";
import { PropsWithChildren } from "react";
import { useFormStatus } from "react-dom";

export default function FormButton({ children }: PropsWithChildren) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" isLoading={pending}>
      {children}
    </Button>
  );
}
