import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DestinationForm,
  destinationToFormInitial,
} from "@/components/admin/destination-form";
import type { AdminContinent, Destination } from "@/lib/api";

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
      <Dialog open={createOpen} onOpenChange={(open) => !open && onCloseCreate()}>
        <DialogContent className="max-w-3xl">
          <DestinationForm
            continents={continents}
            presetCountry={presetCountry}
            onSaved={() => {
              onCloseCreate();
              onSaved();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && onCloseEdit()}
      >
        <DialogContent className="max-w-3xl">
          {editing && (
            <DestinationForm
              continents={continents}
              initial={{
                ...destinationToFormInitial(editing),
                ...(presetCountry
                  ? {
                      location: {
                        ...editing.location,
                        countryId: presetCountry,
                      },
                    }
                  : {}),
              }}
              presetCountry={presetCountry}
              onSaved={() => {
                onCloseEdit();
                onSaved();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

