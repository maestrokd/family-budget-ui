import { CameraCapture } from "@/components/image/CameraCapture2";

export default function CameraTest2() {
    return (
        <div className="p-6">
            <CameraCapture facingMode="environment" />
        </div>
    );
}
