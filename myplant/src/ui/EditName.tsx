import { useState } from "react";

export default function EditName() {
  const [plantName, setPlantName] = useState("My Plant");
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(plantName);

  const startEditing = () => {
    setInputValue(plantName);
    setIsEditing(true);
  };

  const saveName = () => {
    setPlantName(inputValue.trim() || "My Plant");
    setIsEditing(false);
  };

  const handleKeyDown = (e: { key: string; }) => {
    if (e.key === "Enter") {
      saveName();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-center mb-6 gap-2">
      <h1 className="text-4xl font-bold flex items-center gap-2">
        🪴
        {isEditing ? (
          <input
            type="text"
            className="text-4xl text-gray-700 font-bold border-b border-gray-400 focus:outline-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={saveName}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          plantName
        )}
      </h1>
      {!isEditing && (
        <button
          onClick={startEditing}
          aria-label="Edit plant name"
          className="text-2xl hover:text-gray-600 transition-colors"
          type="button"
        >
          ✏️
        </button>
      )}
    </div>
  );
}