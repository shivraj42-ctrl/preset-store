import ProtectedRoute from "@/components/ProtectedRoute";

export default function UploadPage() {
  return (
    <ProtectedRoute>

      <div className="p-10 text-white">
        <h1 className="text-2xl">Upload Preset</h1>
        {/* your upload UI */}
      </div>

    </ProtectedRoute>
  );
}