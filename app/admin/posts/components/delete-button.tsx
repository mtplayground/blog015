"use client";

import type { FormEvent } from "react";

type DeleteButtonProps = {
  action: () => Promise<void>;
  confirmMessage: string;
};

export function DeleteButton({ action, confirmMessage }: DeleteButtonProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) {
      event.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit}>
      <button type="submit" className="text-red-700 hover:underline">
        Delete
      </button>
    </form>
  );
}
