"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import imageCompression from "browser-image-compression";
import { GripVertical, ImagePlus, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/button";
import { deleteCarImage, reorderCarImages, uploadCarImage } from "@/lib/actions/admin";
import { cn } from "@/lib/cn";

export interface ManagedPhoto {
  id: string;
  url: string;
}

// ~1600px wide, ~250 KB JPEGs. JPEG (not WebP) because older iPhones can't
// encode WebP in the browser and would fall back to huge PNGs.
const COMPRESSION = {
  maxWidthOrHeight: 1600,
  maxSizeMB: 0.3,
  initialQuality: 0.8,
  fileType: "image/jpeg",
  useWebWorker: true,
} as const;

export function PhotoManager({ carId, carLabel, initial }: { carId: string; carLabel: string; initial: ManagedPhoto[] }) {
  const [photos, setPhotos] = useState(initial);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // Long-press to drag on phones, so normal scrolling still works.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const saveOrder = (next: ManagedPhoto[], previous: ManagedPhoto[]) => {
    setPhotos(next);
    startTransition(async () => {
      const res = await reorderCarImages(carId, next.map((p) => p.id));
      if (!res.ok) {
        setPhotos(previous);
        setError(`Couldn't save the new order: ${res.error}`);
      }
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = photos.findIndex((p) => p.id === active.id);
    const to = photos.findIndex((p) => p.id === over.id);
    saveOrder(arrayMove(photos, from, to), photos);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const failures: string[] = [];

    // One at a time keeps each request small and shows steady progress.
    for (const [i, file] of list.entries()) {
      setProgress(`Compressing and uploading ${i + 1} of ${list.length}…`);
      try {
        const compressed = await imageCompression(file, COMPRESSION);
        const fd = new FormData();
        fd.append("file", compressed, file.name.replace(/\.\w+$/, "") + ".jpg");
        fd.append("alt", `${carLabel}, photo`);
        const res = await uploadCarImage(carId, fd);
        if (res.ok) {
          setPhotos((prev) => [...prev, { id: res.image.id, url: res.image.url }]);
        } else {
          failures.push(`${file.name}: ${res.error}`);
        }
      } catch {
        failures.push(`${file.name}: couldn't process this image`);
      }
    }

    setProgress(null);
    if (failures.length) setError(failures.join("\n"));
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (photo: ManagedPhoto) => {
    if (!window.confirm("Delete this photo?")) return;
    const previous = photos;
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    startTransition(async () => {
      const res = await deleteCarImage(photo.id);
      if (!res.ok) {
        setPhotos(previous);
        setError(`Couldn't delete: ${res.error}`);
      }
    });
  };

  const makeCover = (photo: ManagedPhoto) =>
    saveOrder([photo, ...photos.filter((p) => p.id !== photo.id)], photos);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className={buttonClasses("dark", "lg", progress ? "pointer-events-none opacity-60" : "cursor-pointer")}>
          <ImagePlus size={20} aria-hidden="true" />
          Add photos
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={Boolean(progress)}
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
        <p className="text-sm text-muted" aria-live="polite">
          {progress ?? "First photo is the cover. Drag to reorder (long-press on a phone)."}
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-card border border-status-sold/30 bg-white p-3 text-sm whitespace-pre-line text-status-sold">
          {error}
        </p>
      )}

      {photos.length === 0 ? (
        <p className="mt-4 rounded-card border border-dashed border-line bg-white p-6 text-center text-muted">
          No photos yet. Cars with good photos sell faster: front, back, both sides, interior, dashboard, boot.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo, i) => (
                <SortablePhoto
                  key={photo.id}
                  photo={photo}
                  index={i}
                  onRemove={() => remove(photo)}
                  onMakeCover={() => makeCover(photo)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortablePhoto({
  photo,
  index,
  onRemove,
  onMakeCover,
}: {
  photo: ManagedPhoto;
  index: number;
  onRemove: () => void;
  onMakeCover: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative overflow-hidden rounded-card border bg-white",
        index === 0 ? "border-2 border-orange-500" : "border-line",
        isDragging && "z-10 shadow-lg",
      )}
    >
      <div className="relative aspect-3/2 bg-sand">
        <Image src={photo.url} alt={`Photo ${index + 1}`} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
        {index === 0 && (
          <span className="absolute top-2 left-2 rounded-sm bg-orange-500 px-2 py-0.5 text-xs font-bold uppercase text-navy-950">
            Cover
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-1 p-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag photo ${index + 1} to reorder`}
          className="inline-flex size-11 cursor-grab touch-none items-center justify-center rounded-card text-muted hover:bg-sand active:cursor-grabbing"
        >
          <GripVertical size={20} />
        </button>
        {index > 0 && (
          <button
            type="button"
            onClick={onMakeCover}
            aria-label={`Make photo ${index + 1} the cover`}
            className="inline-flex size-11 items-center justify-center rounded-card text-muted hover:bg-sand hover:text-orange-700"
          >
            <Star size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Delete photo ${index + 1}`}
          className="inline-flex size-11 items-center justify-center rounded-card text-muted hover:bg-status-sold/10 hover:text-status-sold"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </li>
  );
}
