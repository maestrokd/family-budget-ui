import React, {useState} from "react";
import {Dialog, DialogClose, DialogContent} from "@/components/ui/dialog";

interface ImagePreviewListProps {
    images: string[];
}

export const ImagePreviewList: React.FC<ImagePreviewListProps> = ({images}) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string>("");

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {images.map((src, idx) => (
                    <button
                        key={idx}
                        type="button"
                        className="focus:outline-none"
                        onClick={() => {
                            setSelected(src);
                            setOpen(true);
                        }}
                    >
                        <div className="h-32 w-32 flex justify-center">
                            <img
                                src={src}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-full object-contain rounded border border-gray-200"
                            />
                        </div>
                    </button>
                ))}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="h-full w-full bg-black/70">
                    {/*<DialogHeader>
                    <DialogTitle>Full view photo</DialogTitle>
                    </DialogHeader>*/}
                    <img src={selected} alt="Full view" className="w-full h-full object-contain"/>
                    <DialogClose asChild>
                        <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white"/>
                    </DialogClose>
                </DialogContent>
            </Dialog>
        </>
    );
};