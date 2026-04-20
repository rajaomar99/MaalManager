"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Pencil, Check, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/category.action";
import type { Category } from "@/lib/types";

const DEFAULT_ICON = "📦";

interface CategoryManagerProps {
  initialCategories: Category[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditIcon("");
  }

  function handleUpdate(id: number) {
    startTransition(async () => {
      const result = await updateCategory(id, editName, editIcon);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      const resolvedIcon = editIcon.trim() || DEFAULT_ICON;
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, name: editName.trim(), icon: resolvedIcon }
            : c
        )
      );
      toast.success("Category updated");
      cancelEdit();
    });
  }

  function handleCreate() {
    if (!newName.trim()) {
      toast.error("Enter a category name");
      return;
    }
    startTransition(async () => {
      const result = await createCategory(newName, newIcon);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      const resolvedIcon = newIcon.trim() || DEFAULT_ICON;
      setCategories((prev) =>
        [
          ...prev,
          {
            id: result.id,
            name: newName.trim(),
            icon: resolvedIcon,
            _count: { products: 0 },
          },
        ].sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success("Category added");
      setNewName("");
      setNewIcon("");
    });
  }

  function handleDelete(id: number, name: string, productCount: number) {
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeletingId(null);
      toast.success(
        productCount > 0
          ? `"${name}" and ${productCount} product${productCount !== 1 ? "s" : ""} deleted`
          : `"${name}" deleted`
      );
    });
  }

  return (
    <div className="space-y-6">
      {/* Add New Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Add New Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="new-icon">
                Emoji Icon{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="new-icon"
                placeholder={DEFAULT_ICON}
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-24 text-center text-xl"
                maxLength={4}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="new-name">Category Name *</Label>
              <Input
                id="new-name"
                placeholder="e.g. Tea & Coffee"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={isPending}
              className="min-h-[44px] shrink-0"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Category
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category List */}
      <div className="space-y-2">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="p-4">
              {editingId === cat.id ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    placeholder={DEFAULT_ICON}
                    className="w-20 text-center text-xl"
                    maxLength={4}
                    aria-label="Icon"
                  />
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                    aria-label="Name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate(cat.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => handleUpdate(cat.id)}
                      disabled={isPending}
                      title="Save"
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10"
                      onClick={cancelEdit}
                      disabled={isPending}
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>
                    {cat.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat._count.products} product
                      {cat._count.products !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[44px] gap-2"
                      onClick={() => startEdit(cat)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>

                    {/* Delete dialog */}
                    <Dialog
                      open={deletingId === cat.id}
                      onOpenChange={(open) =>
                        setDeletingId(open ? cat.id : null)
                      }
                    >
                      <DialogTrigger
                        render={
                          <Button
                            variant="outline"
                            size="sm"
                            className="min-h-[44px] text-destructive hover:bg-destructive/10"
                          />
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete "{cat.name}"?</DialogTitle>
                          <DialogDescription>
                            {cat._count.products > 0 ? (
                              <>
                                This will permanently delete{" "}
                                <strong>
                                  {cat._count.products} product
                                  {cat._count.products !== 1 ? "s" : ""}
                                </strong>{" "}
                                and all their stock movement history. This
                                cannot be undone.
                              </>
                            ) : (
                              "This category has no products. It will be deleted permanently."
                            )}
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeletingId(null)}
                            disabled={isPending}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleDelete(
                                cat.id,
                                cat.name,
                                cat._count.products
                              )
                            }
                            disabled={isPending}
                          >
                            {isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {categories.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No categories yet. Add one above.
          </p>
        )}
      </div>
    </div>
  );
}
