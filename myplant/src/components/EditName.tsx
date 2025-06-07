import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EditName() {
  const [plantName, setPlantName] = useState("My Plant");
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("My Plant");

  useEffect(() => {
    const fetchName = async () => {
      try {
        const docRef = doc(db, "esp32_logs", "latest");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.name) {
            setPlantName(data.name);
            setInputValue(data.name);
          }
        }
      } catch (error) {
        console.error("Error fetching plant name:", error);
      }
    };

    fetchName();
  }, []);

  const startEditing = () => {
    setInputValue(plantName);
    setIsEditing(true);
  };

  const saveName = async () => {
    const trimmed = inputValue.trim() || "My Plant";
    setPlantName(trimmed);
    setIsEditing(false);
    try {
      const docRef = doc(db, "esp32_logs", "latest");
      await updateDoc(docRef, { name: trimmed });
    } catch (error) {
      console.error("Error saving plant name:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveName();
    } else if (e.key === "Escape") {
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
