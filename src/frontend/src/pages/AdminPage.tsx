import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Car,
  Check,
  Database,
  Layers,
  Loader2,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Shield,
  ShieldOff,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { CarCategory, CarModel, Feature, Trim } from "@/backend.d";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAddCarModel,
  useAddTrim,
  useAllCarModels,
  useAllTrims,
  useClaimAdminIfNoneExists,
  useDeleteCarModel,
  useDeleteTrim,
  useGetCallerPrincipal,
  useIsCallerAdmin,
  useIsSeeded,
  useSeedData,
  useUpdateCarModel,
  useUpdateTrim,
} from "@/hooks/useQueries";

// ─── Owner principal (permanent admin) ─────────────────────────────────────
const OWNER_PRINCIPAL =
  "xkh5y-mmyoe-vquq7-42fdf-xmiwm-gqvrh-jzqej-4uqep-vogg2-yumzv-kae";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ModelFormData {
  name: string;
  description: string;
  category: CarCategory | "";
  tagline: string;
  imageUrl: string;
}

interface FeatureRow extends Feature {
  _id: number;
}

interface TrimFormData {
  carModelId: string;
  name: string;
  price: string;
  monthlyEMI: string;
  features: FeatureRow[];
}

const EMPTY_MODEL_FORM: ModelFormData = {
  name: "",
  description: "",
  category: "",
  tagline: "",
  imageUrl: "",
};

let _featureCounter = 0;
function nextFeatId() {
  return ++_featureCounter;
}

const EMPTY_TRIM_FORM: TrimFormData = {
  carModelId: "",
  name: "",
  price: "",
  monthlyEMI: "",
  features: [{ _id: nextFeatId(), name: "", value: "", included: true }],
};

const CATEGORY_LABELS: Record<CarCategory, string> = {
  sedan: "Sedan",
  suv: "SUV",
  hatchback: "Hatchback",
  mpv: "MPV",
  coupe: "Coupé",
};

// ─── Model Form Dialog ───────────────────────────────────────────────────────

interface ModelFormDialogProps {
  open: boolean;
  onClose: () => void;
  editingModel: CarModel | null;
}

function ModelFormDialog({
  open,
  onClose,
  editingModel,
}: ModelFormDialogProps) {
  const [form, setForm] = useState<ModelFormData>(
    editingModel
      ? {
          name: editingModel.name,
          description: editingModel.description,
          category: editingModel.category,
          tagline: editingModel.tagline,
          imageUrl: editingModel.imageUrl,
        }
      : EMPTY_MODEL_FORM,
  );

  const addModel = useAddCarModel();
  const updateModel = useUpdateCarModel();

  const isSubmitting = addModel.isPending || updateModel.isPending;

  function handleOpenChange(o: boolean) {
    if (!o) onClose();
  }

  // Reset when dialog opens with new editing target
  function handleOpen() {
    setForm(
      editingModel
        ? {
            name: editingModel.name,
            description: editingModel.description,
            category: editingModel.category,
            tagline: editingModel.tagline,
            imageUrl: editingModel.imageUrl,
          }
        : EMPTY_MODEL_FORM,
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category) {
      toast.error("Please select a category");
      return;
    }

    try {
      if (editingModel) {
        await updateModel.mutateAsync({
          id: editingModel.id,
          name: form.name,
          description: form.description,
          category: form.category as CarCategory,
          tagline: form.tagline,
          imageUrl: form.imageUrl,
        });
        toast.success("Model updated successfully");
      } else {
        await addModel.mutateAsync({
          name: form.name,
          description: form.description,
          category: form.category as CarCategory,
          tagline: form.tagline,
          imageUrl: form.imageUrl,
        });
        toast.success("Model added successfully");
      }
      onClose();
    } catch {
      toast.error("Failed to save model");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-lg bg-surface-01 border-border/60"
        onOpenAutoFocus={handleOpen}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {editingModel ? "Edit Model" : "Add New Model"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/70">
            {editingModel
              ? "Update the car model details below."
              : "Fill in the details to create a new car model."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="model-name">Model Name</Label>
            <Input
              id="model-name"
              placeholder="e.g. Honda City"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="bg-surface-02 border-border/60"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="model-tagline">Tagline</Label>
            <Input
              id="model-tagline"
              placeholder="e.g. Drive the Future"
              value={form.tagline}
              onChange={(e) =>
                setForm((f) => ({ ...f, tagline: e.target.value }))
              }
              required
              className="bg-surface-02 border-border/60"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="model-category">Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, category: v as CarCategory }))
              }
            >
              <SelectTrigger
                id="model-category"
                className="bg-surface-02 border-border/60"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-surface-01 border-border/60">
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="model-description">Description</Label>
            <Textarea
              id="model-description"
              placeholder="Describe the car model..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              required
              rows={3}
              className="bg-surface-02 border-border/60 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="model-image">Image URL</Label>
            <Input
              id="model-image"
              placeholder="https://..."
              value={form.imageUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrl: e.target.value }))
              }
              className="bg-surface-02 border-border/60"
            />
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              data-ocid="admin.confirm_delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gold text-black hover:bg-gold/90 font-semibold"
              data-ocid="admin.model_form.submit_button"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSubmitting
                ? "Saving..."
                : editingModel
                  ? "Update Model"
                  : "Add Model"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Trim Form Dialog ────────────────────────────────────────────────────────

interface TrimFormDialogProps {
  open: boolean;
  onClose: () => void;
  editingTrim: (Trim & { modelName: string }) | null;
  models: CarModel[];
}

function TrimFormDialog({
  open,
  onClose,
  editingTrim,
  models,
}: TrimFormDialogProps) {
  const [form, setForm] = useState<TrimFormData>(
    editingTrim
      ? {
          carModelId: editingTrim.carModelId.toString(),
          name: editingTrim.name,
          price: editingTrim.price.toString(),
          monthlyEMI: editingTrim.monthlyEMI.toString(),
          features: editingTrim.features.length
            ? editingTrim.features.map((f) => ({ ...f, _id: nextFeatId() }))
            : [{ _id: nextFeatId(), name: "", value: "", included: true }],
        }
      : EMPTY_TRIM_FORM,
  );

  const addTrim = useAddTrim();
  const updateTrim = useUpdateTrim();
  const isSubmitting = addTrim.isPending || updateTrim.isPending;

  function handleOpenChange(o: boolean) {
    if (!o) onClose();
  }

  function handleOpen() {
    setForm(
      editingTrim
        ? {
            carModelId: editingTrim.carModelId.toString(),
            name: editingTrim.name,
            price: editingTrim.price.toString(),
            monthlyEMI: editingTrim.monthlyEMI.toString(),
            features: editingTrim.features.length
              ? editingTrim.features.map((f) => ({ ...f, _id: nextFeatId() }))
              : [{ _id: nextFeatId(), name: "", value: "", included: true }],
          }
        : EMPTY_TRIM_FORM,
    );
  }

  function addFeatureRow() {
    setForm((f) => ({
      ...f,
      features: [
        ...f.features,
        { _id: nextFeatId(), name: "", value: "", included: true },
      ],
    }));
  }

  function removeFeatureRow(featId: number) {
    setForm((f) => ({
      ...f,
      features: f.features.filter((feat) => feat._id !== featId),
    }));
  }

  function updateFeature(
    featId: number,
    field: keyof Feature,
    value: string | boolean,
  ) {
    setForm((f) => ({
      ...f,
      features: f.features.map((feat) =>
        feat._id === featId ? { ...feat, [field]: value } : feat,
      ),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.carModelId) {
      toast.error("Please select a model");
      return;
    }

    const price = Number.parseFloat(form.price);
    const monthlyEMI = Number.parseFloat(form.monthlyEMI);
    if (Number.isNaN(price) || Number.isNaN(monthlyEMI)) {
      toast.error("Invalid price or EMI value");
      return;
    }

    const carModelId = BigInt(form.carModelId);
    const features = form.features
      .filter((f) => f.name.trim() !== "")
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ _id, ...rest }) => rest);

    try {
      if (editingTrim) {
        await updateTrim.mutateAsync({
          id: editingTrim.id,
          carModelId,
          name: form.name,
          price,
          monthlyEMI,
          features,
        });
        toast.success("Trim updated successfully");
      } else {
        await addTrim.mutateAsync({
          carModelId,
          name: form.name,
          price,
          monthlyEMI,
          features,
        });
        toast.success("Trim added successfully");
      }
      onClose();
    } catch {
      toast.error("Failed to save trim");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-2xl bg-surface-01 border-border/60 max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={handleOpen}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {editingTrim ? "Edit Trim" : "Add New Trim"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/70">
            {editingTrim
              ? "Update the trim details and features."
              : "Define the trim name, pricing, and feature list."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Model selector */}
          <div className="space-y-1.5">
            <Label>Car Model</Label>
            <Select
              value={form.carModelId}
              onValueChange={(v) => setForm((f) => ({ ...f, carModelId: v }))}
            >
              <SelectTrigger className="bg-surface-02 border-border/60">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent className="bg-surface-01 border-border/60">
                {models.map((m) => (
                  <SelectItem key={m.id.toString()} value={m.id.toString()}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trim name */}
          <div className="space-y-1.5">
            <Label htmlFor="trim-name">Trim Name</Label>
            <Input
              id="trim-name"
              placeholder="e.g. V Turbo CVT"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="bg-surface-02 border-border/60"
            />
          </div>

          {/* Pricing row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="trim-price">Price (₹)</Label>
              <Input
                id="trim-price"
                type="number"
                placeholder="1450000"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                required
                min={0}
                className="bg-surface-02 border-border/60 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trim-emi">Monthly EMI (₹)</Label>
              <Input
                id="trim-emi"
                type="number"
                placeholder="24500"
                value={form.monthlyEMI}
                onChange={(e) =>
                  setForm((f) => ({ ...f, monthlyEMI: e.target.value }))
                }
                required
                min={0}
                className="bg-surface-02 border-border/60 font-mono"
              />
            </div>
          </div>

          {/* Feature builder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Features</Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={addFeatureRow}
                className="text-gold hover:text-gold-bright hover:bg-gold-subtle text-xs gap-1"
              >
                <Plus className="h-3 w-3" /> Add Feature
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {form.features.map((feat) => (
                <div
                  key={feat._id}
                  className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center"
                >
                  <Input
                    placeholder="Feature name"
                    value={feat.name}
                    onChange={(e) =>
                      updateFeature(feat._id, "name", e.target.value)
                    }
                    className="bg-surface-02 border-border/60 text-sm h-8"
                  />
                  <Input
                    placeholder="Value / spec"
                    value={feat.value}
                    onChange={(e) =>
                      updateFeature(feat._id, "value", e.target.value)
                    }
                    className="bg-surface-02 border-border/60 text-sm h-8"
                  />
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id={`feat-inc-${feat._id}`}
                      checked={feat.included}
                      onCheckedChange={(v) =>
                        updateFeature(feat._id, "included", !!v)
                      }
                      className="border-border/60 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                    />
                    <label
                      htmlFor={`feat-inc-${feat._id}`}
                      className="text-xs text-muted-foreground cursor-pointer select-none"
                    >
                      Incl.
                    </label>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFeatureRow(feat._id)}
                    disabled={form.features.length === 1}
                    className="h-7 w-7 text-muted-foreground hover:text-danger"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gold text-black hover:bg-gold/90 font-semibold"
              data-ocid="admin.trim_form.submit_button"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSubmitting
                ? "Saving..."
                : editingTrim
                  ? "Update Trim"
                  : "Add Trim"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ───────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  label: string;
  isDeleting: boolean;
}

function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  label,
  isDeleting,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm bg-surface-01 border-border/60">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-danger">
            Confirm Delete
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/70">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{label}</span>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            data-ocid="admin.confirm_delete.cancel_button"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-danger hover:bg-danger/80 text-white"
            data-ocid="admin.confirm_delete.confirm_button"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Models Tab ──────────────────────────────────────────────────────────────

function ModelsTab() {
  const { data: models, isLoading } = useAllCarModels();
  const deleteModel = useDeleteCarModel();

  const [modelDialog, setModelDialog] = useState<{
    open: boolean;
    editing: CarModel | null;
  }>({ open: false, editing: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    model: CarModel | null;
  }>({ open: false, model: null });

  function openAdd() {
    setModelDialog({ open: true, editing: null });
  }

  function openEdit(model: CarModel) {
    setModelDialog({ open: true, editing: model });
  }

  async function confirmDelete() {
    if (!deleteDialog.model) return;
    try {
      await deleteModel.mutateAsync(deleteDialog.model.id);
      toast.success("Model deleted");
      setDeleteDialog({ open: false, model: null });
    } catch {
      toast.error("Failed to delete model");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold">Car Models</h3>
          <p className="text-sm text-muted-foreground/70">
            {models?.length ?? 0} models in catalogue
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-gold text-black hover:bg-gold/90 font-semibold gap-2"
          data-ocid="admin.add_model_button"
        >
          <Plus className="h-4 w-4" />
          Add Model
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full bg-surface-02" />
          ))}
        </div>
      ) : !models || models.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-border/40 rounded-lg"
          data-ocid="admin.empty_state"
        >
          <Car className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground/60">No car models found.</p>
          <Button
            variant="ghost"
            size="sm"
            className="text-gold hover:text-gold-bright"
            onClick={openAdd}
          >
            Add your first model
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-02 hover:bg-surface-02 border-border/60">
                <TableHead className="text-muted-foreground font-semibold">
                  Model
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold">
                  Category
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold hidden md:table-cell">
                  Tagline
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model, idx) => (
                <TableRow
                  key={model.id.toString()}
                  className="border-border/40 hover:bg-surface-02/50 transition-colors"
                  data-ocid={`admin.model.row.${idx + 1}`}
                >
                  <TableCell className="font-semibold">{model.name}</TableCell>
                  <TableCell>
                    <span className="badge-category">
                      {CATEGORY_LABELS[model.category] ?? model.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground/70 hidden md:table-cell max-w-xs truncate">
                    {model.tagline}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(model)}
                        className="text-muted-foreground hover:text-gold hover:bg-gold-subtle h-8 w-8 p-0"
                        data-ocid={`admin.model.edit_button.${idx + 1}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteDialog({ open: true, model })}
                        className="text-muted-foreground hover:text-danger hover:bg-danger-dim h-8 w-8 p-0"
                        data-ocid={`admin.model.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ModelFormDialog
        open={modelDialog.open}
        onClose={() => setModelDialog({ open: false, editing: null })}
        editingModel={modelDialog.editing}
      />
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, model: null })}
        onConfirm={confirmDelete}
        label={deleteDialog.model?.name ?? "this model"}
        isDeleting={deleteModel.isPending}
      />
    </div>
  );
}

// ─── Trims Tab ───────────────────────────────────────────────────────────────

function TrimsTab() {
  const { data: models } = useAllCarModels();
  const { data: trims, isLoading } = useAllTrims();
  const deleteTrim = useDeleteTrim();

  const [trimDialog, setTrimDialog] = useState<{
    open: boolean;
    editing: (Trim & { modelName: string }) | null;
  }>({ open: false, editing: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    trim: (Trim & { modelName: string }) | null;
  }>({ open: false, trim: null });

  function openAdd() {
    setTrimDialog({ open: true, editing: null });
  }

  function openEdit(trim: Trim & { modelName: string }) {
    setTrimDialog({ open: true, editing: trim });
  }

  async function confirmDelete() {
    if (!deleteDialog.trim) return;
    try {
      await deleteTrim.mutateAsync({
        id: deleteDialog.trim.id,
        carModelId: deleteDialog.trim.carModelId,
      });
      toast.success("Trim deleted");
      setDeleteDialog({ open: false, trim: null });
    } catch {
      toast.error("Failed to delete trim");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold">Trims & Variants</h3>
          <p className="text-sm text-muted-foreground/70">
            {trims?.length ?? 0} trims across all models
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-gold text-black hover:bg-gold/90 font-semibold gap-2"
          data-ocid="admin.add_trim_button"
        >
          <Plus className="h-4 w-4" />
          Add Trim
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.loading_state">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full bg-surface-02" />
          ))}
        </div>
      ) : !trims || trims.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-border/40 rounded-lg"
          data-ocid="admin.empty_state"
        >
          <Layers className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground/60">No trims found.</p>
          <Button
            variant="ghost"
            size="sm"
            className="text-gold hover:text-gold-bright"
            onClick={openAdd}
          >
            Add your first trim
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-02 hover:bg-surface-02 border-border/60">
                <TableHead className="text-muted-foreground font-semibold">
                  Model
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold">
                  Trim
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold hidden sm:table-cell">
                  Price
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold hidden md:table-cell">
                  EMI/mo
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold hidden lg:table-cell">
                  Features
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trims.map((trim, idx) => (
                <TableRow
                  key={trim.id.toString()}
                  className="border-border/40 hover:bg-surface-02/50 transition-colors"
                  data-ocid={`admin.trim.row.${idx + 1}`}
                >
                  <TableCell className="text-muted-foreground/80 text-sm">
                    {trim.modelName}
                  </TableCell>
                  <TableCell className="font-semibold">{trim.name}</TableCell>
                  <TableCell className="font-mono text-sm hidden sm:table-cell">
                    ₹{trim.price.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="emi-display hidden md:table-cell">
                    ₹{trim.monthlyEMI.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge
                      variant="outline"
                      className="border-border/60 text-muted-foreground/70 text-xs"
                    >
                      {trim.features.length} features
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(trim)}
                        className="text-muted-foreground hover:text-gold hover:bg-gold-subtle h-8 w-8 p-0"
                        data-ocid={`admin.trim.edit_button.${idx + 1}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteDialog({ open: true, trim })}
                        className="text-muted-foreground hover:text-danger hover:bg-danger-dim h-8 w-8 p-0"
                        data-ocid={`admin.trim.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TrimFormDialog
        open={trimDialog.open}
        onClose={() => setTrimDialog({ open: false, editing: null })}
        editingTrim={trimDialog.editing}
        models={models ?? []}
      />
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, trim: null })}
        onConfirm={confirmDelete}
        label={
          deleteDialog.trim
            ? `${deleteDialog.trim.name} (${deleteDialog.trim.modelName})`
            : "this trim"
        }
        isDeleting={deleteTrim.isPending}
      />
    </div>
  );
}

// ─── Admin Page ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();

  const isAuthenticated = !!identity;
  const localPrincipal = identity?.getPrincipal().toString();

  const { data: backendPrincipal } = useGetCallerPrincipal();
  const principal = backendPrincipal || localPrincipal;
  const isOwner = principal === OWNER_PRINCIPAL;

  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();
  const { data: seeded, isLoading: checkingSeeded } = useIsSeeded();
  const seedData = useSeedData();
  const claimAdmin = useClaimAdminIfNoneExists();

  // Auto-claim admin for owner principal on login — silent on success
  // biome-ignore lint/correctness/useExhaustiveDependencies: claimAdmin.mutateAsync and isPending intentionally excluded to prevent retriggering on mutation state changes
  useEffect(() => {
    if (!isAuthenticated || !isOwner || isAdmin || claimAdmin.isPending) return;
    claimAdmin.mutateAsync().catch(() => {
      toast.error("Failed to claim owner admin access. Please try again.");
    });
  }, [isAuthenticated, isOwner, isAdmin]);

  async function handleSeed() {
    try {
      await seedData.mutateAsync();
      toast.success("Sample data seeded successfully");
    } catch {
      toast.error("Failed to seed data");
    }
  }

  return (
    <main className="min-h-[calc(100vh-8rem)] px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-gold/10 border border-gold/30">
            <Shield className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight">
              Admin Panel
            </h1>
            <p className="text-muted-foreground/70 text-sm">
              Manage car models, trims, and catalogue data
            </p>
          </div>
        </div>
        <div className="divider-gold mt-6" />
      </motion.div>

      {/* Auth status bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <div className="rounded-lg border border-border/60 bg-surface-01 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status indicator */}
            <div className="flex items-center gap-3">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isAuthenticated
                    ? "bg-success shadow-[0_0_8px_oklch(0.62_0.16_160/0.6)]"
                    : "bg-muted-foreground/30"
                }`}
              />
              <div>
                {isInitializing ? (
                  <p className="text-sm text-muted-foreground/60">
                    Checking session...
                  </p>
                ) : isAuthenticated ? (
                  <>
                    <p className="text-sm font-semibold">Logged In</p>
                    <p className="text-xs text-muted-foreground/60 font-mono truncate max-w-xs">
                      {principal}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground/60">
                    Not logged in — login to access admin features
                  </p>
                )}
              </div>
            </div>

            {/* Auth action */}
            <div className="flex items-center gap-3 shrink-0">
              {!isAuthenticated ? (
                <Button
                  onClick={login}
                  disabled={isLoggingIn || isInitializing}
                  className="bg-gold text-black hover:bg-gold/90 font-semibold gap-2"
                  data-ocid="admin.login_button"
                >
                  {isLoggingIn ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  {isLoggingIn
                    ? "Logging in..."
                    : "Login with Internet Identity"}
                </Button>
              ) : (
                <>
                  {/* Seed data button (only when not seeded) */}
                  {isAdmin && !seeded && !checkingSeeded && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSeed}
                      disabled={seedData.isPending}
                      className="border-gold/40 text-gold hover:bg-gold-subtle gap-2 text-xs"
                    >
                      {seedData.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Database className="h-3.5 w-3.5" />
                      )}
                      {seedData.isPending ? "Seeding..." : "Seed Sample Data"}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clear}
                    className="text-muted-foreground hover:text-danger hover:bg-danger-dim gap-2"
                    data-ocid="admin.logout_button"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content area */}
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="not-auth"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-24 text-center gap-4"
            data-ocid="admin.error_state"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-02 border border-border/60">
              <ShieldOff className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <h2 className="font-display text-xl font-bold text-muted-foreground/60">
              Authentication Required
            </h2>
            <p className="text-sm text-muted-foreground/50 max-w-sm">
              Please login with your Internet Identity to access the admin
              panel.
            </p>
          </motion.div>
        ) : checkingAdmin ? (
          <motion.div
            key="checking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-24 gap-3 text-muted-foreground/60"
            data-ocid="admin.loading_state"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Verifying admin access...</span>
          </motion.div>
        ) : !isAdmin ? (
          isOwner ? (
            /* Owner is logged in but admin claim is in-flight — show spinner */
            <motion.div
              key="claiming-owner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center gap-4"
              data-ocid="admin.loading_state"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
                <Loader2 className="h-7 w-7 text-gold animate-spin" />
              </div>
              <h2 className="font-display text-xl font-bold text-gold">
                Claiming owner access...
              </h2>
              <p className="text-sm text-muted-foreground/60 max-w-sm">
                Setting up your permanent admin access. This only takes a
                moment.
              </p>
            </motion.div>
          ) : (
            /* Regular user — show claim button only (no reset) */
            <motion.div
              key="denied"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-24 text-center gap-4"
              data-ocid="admin.error_state"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-dim border border-danger/30">
                <ShieldOff className="h-7 w-7 text-danger" />
              </div>
              <h2 className="font-display text-xl font-bold">Access Denied</h2>
              <p className="text-sm text-muted-foreground/60 max-w-sm">
                Your account does not have admin privileges.
              </p>
              <div className="mt-1 px-3 py-1.5 rounded bg-surface-02 border border-border/60">
                <p className="text-xs font-mono text-muted-foreground/50 max-w-xs truncate">
                  {principal}
                </p>
              </div>
              <Button
                className="bg-gold text-black hover:bg-gold/90 font-semibold gap-2 mt-2"
                disabled={claimAdmin.isPending}
                data-ocid="admin.claim_admin_button"
                onClick={async () => {
                  try {
                    const granted = await claimAdmin.mutateAsync();
                    if (granted) {
                      toast.success("Admin access granted!");
                    } else {
                      toast.error(
                        "Admin access is already claimed by another user.",
                      );
                    }
                  } catch {
                    toast.error(
                      "Failed to claim admin access. Another admin already exists.",
                    );
                  }
                }}
              >
                {claimAdmin.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                {claimAdmin.isPending ? "Claiming..." : "Claim Admin Access"}
              </Button>
              <p className="text-xs text-muted-foreground/40">
                This only works if no admin has been set up yet.
              </p>
            </motion.div>
          )
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Admin role badge */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-subtle border border-gold/30">
                <Check className="h-3.5 w-3.5 text-gold" />
                <span className="text-xs font-semibold text-gold-bright">
                  Admin Access Granted
                </span>
              </div>
            </div>

            <Tabs defaultValue="models" className="space-y-6">
              <TabsList className="bg-surface-02 border border-border/60 h-11 p-1 gap-1">
                <TabsTrigger
                  value="models"
                  className="flex items-center gap-2 data-[state=active]:bg-gold data-[state=active]:text-black font-semibold"
                  data-ocid="admin.models_tab"
                >
                  <Car className="h-4 w-4" />
                  Models
                </TabsTrigger>
                <TabsTrigger
                  value="trims"
                  className="flex items-center gap-2 data-[state=active]:bg-gold data-[state=active]:text-black font-semibold"
                  data-ocid="admin.trims_tab"
                >
                  <Layers className="h-4 w-4" />
                  Trims
                </TabsTrigger>
              </TabsList>

              <TabsContent value="models" className="mt-6">
                <ModelsTab />
              </TabsContent>

              <TabsContent value="trims" className="mt-6">
                <TrimsTab />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
