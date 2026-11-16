import {
  DestinationForm,
  destinationToFormInitial,
} from "@/components/admin/destination-form";
import { resolveCountryId } from "@/components/admin/destination-form-helpers";
import type { AdminContinent, Destination } from "@/lib/api";

function getEditInitial(
  destination: Destination,
  continents: AdminContinent[],
  presetCountry?: string,
) {
  const initial = destinationToFormInitial(destination);
  initial.location.countryId = resolveCountryId(
    destination.location?.country,
    continents,
    presetCountry,
  );
  return initial;
}

interface AdminDestinationDialogsProps {
  continents: AdminContinent[];
  presetCountry?: string;
  createOpen: boolean;
  onCloseCreate: () => void;
  editing: Destination | null;
  onCloseEdit: () => void;
  onSaved: () => void;
}

export function AdminDestinationDialogs({
  continents,
  presetCountry,
  createOpen,
  onCloseCreate,
  editing,
  onCloseEdit,
  onSaved,
}: AdminDestinationDialogsProps) {
  return (
    <>
      {createOpen && (
        <DestinationForm
          continents={continents}
          presetCountry={presetCountry}
          onSaved={() => {
            onCloseCreate();
            onSaved();
          }}
        />
      )}

      {editing && (
        <DestinationForm
          continents={continents}
          initial={getEditInitial(editing, continents, presetCountry)}
          presetCountry={presetCountry}
          onSaved={() => {
            onCloseEdit();
            onSaved();
          }}
        />
      )}
    </>
  );
}

