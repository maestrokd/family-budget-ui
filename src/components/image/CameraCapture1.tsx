// CameraCapture.tsx
import * as React from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";

type Props = {
    /** "environment" for back camera (default), "user" for front camera */
    capture?: "environment" | "user";
    /** Optional input label */
    label?: string;
};

export function CameraCapture({ capture = "environment", label = "Base64" }: Props) {
    const fileRef = React.useRef<HTMLInputElement | null>(null);
    const [dataUrl, setDataUrl] = React.useState<string | null>(null); // for preview
    const [base64, setBase64] = React.useState<string>("");            // bare base64
    const [open, setOpen] = React.useState(false);

    const openCamera = () => fileRef.current?.click();

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            // basic guard
            e.target.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string; // "data:image/jpeg;base64,AAAA..."
            setDataUrl(result);
            const commaIdx = result.indexOf(",");
            setBase64(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
        };
        reader.readAsDataURL(file);
    };

    const clearPhoto = () => {
        setDataUrl(null);
        setBase64("");
        if (fileRef.current) fileRef.current.value = "";
    };

    const copyBase64 = async () => {
        if (!base64) return;
        try {
            await navigator.clipboard.writeText(base64);
        } catch {
            /* noop */
        }
    };

    return (
        <div className="space-y-3">
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture={capture}
                className="sr-only"
                onChange={onFileChange}
                aria-label="Take or choose a photo"
            />

            <div className="flex gap-2">
                <Button type="button" onClick={openCamera} aria-label="Open camera">
                    Take photo
                </Button>
                <Button type="button" variant="secondary" onClick={copyBase64} disabled={!base64}>
                    Copy base64
                </Button>
                <Button type="button" variant="ghost" onClick={clearPhoto} disabled={!base64 && !dataUrl}>
                    Clear
                </Button>
            </div>

            <div className="space-y-1">
                <label className="text-sm text-muted-foreground">{label}</label>
                <Input
                    value={base64}
                    readOnly
                    aria-label="Photo as base64"
                    className="font-mono text-xs overflow-x-auto"
                />
            </div>

            {dataUrl && (
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="outline-none"
                        aria-label="Open full image"
                        title="Open full image"
                    >
                        <img
                            src={dataUrl}
                            alt="Captured preview"
                            className="h-24 w-24 rounded-md border object-cover cursor-zoom-in"
                        />
                    </button>
                    <span className="text-sm text-muted-foreground">Tap preview to view full image</span>
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[95vw] p-0">
                    <DialogHeader className="px-4 pt-4">
                        <DialogTitle>Captured photo</DialogTitle>
                    </DialogHeader>
                    {dataUrl && (
                        <img
                            src={dataUrl}
                            alt="Full captured"
                            className="w-full h-auto max-h-[90vh] object-contain"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
