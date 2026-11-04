"use client";

import { useActionState, useState, type ReactNode } from "react";
import { createVenue, type CreateVenueActionState } from "../actions";

const initialState: CreateVenueActionState = {
  error: null,
  success: false,
};

export function VenueCreateForm({
  children,
  className,
  onSuccess,
}: {
  children: ReactNode;
  className?: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (previousState: CreateVenueActionState, formData: FormData) => {
      const result = await createVenue(previousState, formData);
      if (result.success) onSuccess?.();
      return result;
    },
    initialState,
  );
  const [errorDismissed, setErrorDismissed] = useState(false);

  return (
    <form
      action={formAction}
      className={className}
      onSubmit={() => setErrorDismissed(false)}
    >
      {children}
      {state.error && !errorDismissed && !pending && (
        <div className="flex items-center gap-2">
          <p role="alert">{state.error}</p>
          <button
            type="button"
            aria-label="Fehlermeldung schließen"
            onClick={() => setErrorDismissed(true)}
          >
            ×
          </button>
        </div>
      )}
    </form>
  );
}
