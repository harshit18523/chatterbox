import { useState, type SubmitEvent } from "react";

interface JoinPrivateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<void>;
}

export default function JoinPrivateRoomModal({ isOpen, onClose, onJoin }: JoinPrivateRoomModalProps) {
  const [joinCode, setJoinCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  if (!isOpen) {
    return null;
  }

  const handleSubmit = async(e: SubmitEvent) => {
    e.preventDefault();
    setError("");
    if (!joinCode.trim()) {
      return setError("please enter a valid room code");
    }
    setIsLoading(true);
    try {
      await onJoin(joinCode.trim().toUpperCase());
      setJoinCode("");
      onClose();
    } catch (err) {
      setError("invalid code or you don't have permission");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-800">Join Private Room</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 mb-1">
              Room Code
            </label>
            <input
              id="joinCode"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="e.g., A1B2C3D4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center tracking-widest uppercase"
              autoComplete="off"
              maxLength={8}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
