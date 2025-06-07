"use client";

import { collection, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";

export default function WaterLedButtons() {
  const [docId, setDocId] = useState<string | null>(null);
  const [motorState, setMotorState] = useState<"on" | "off">("off");
  const [ledState, setLedState] = useState<"on" | "off">("off");
  const [controlState, setControlState] = useState<"auto" | "manual">("manual");

  useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "esp32_controls"), (snapshot) => {
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      setDocId(docSnap.id);
      const data = docSnap.data();
      if (data.motor_control) setMotorState(data.motor_control);
      if (data.led_control) setLedState(data.led_control);
      if (data.mode === "auto" || data.mode === "manual") {
        setControlState(data.mode);
      }
    } else {
      console.error("No documents found in esp32_controls");
    }
  }, (error) => {
    console.error("Error in real-time listener:", error);
  });
  return () => unsubscribe(); // clean up on unmount
}, []);


  const toggleControl = async (type: "motor_control" | "led_control") => {
    if (!docId || controlState === "auto") return;

    const newState =
      type === "motor_control"
        ? motorState === "on"
          ? "off"
          : "on"
        : ledState === "on"
          ? "off"
          : "on";

    try {
      const docRef = doc(db, "esp32_controls", docId);
      await updateDoc(docRef, {
        [type]: newState,
      });

      if (type === "motor_control") {
        setMotorState(newState as "on" | "off");
      } else {
        setLedState(newState as "on" | "off");
      }
    } catch (error) {
      console.error("Error updating control:", error);
    }
  };

  const toggleStateMode = async () => {
    if (!docId) return;
    const newState = controlState === "manual" ? "auto" : "manual";
    try {
      const docRef = doc(db, "esp32_controls", docId);
      await updateDoc(docRef, {
        mode: newState,
      });
      setControlState(newState);
    } catch (error) {
      console.error("Error updating mode:", error);
    }
  };

  const isDisabled = controlState === "auto";

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Mode: <span className="font-semibold">{controlState === "auto" ? "Auto" : "Manual"}</span>
        </p>
        <button
          className={`px-3 py-1 rounded text-sm text-white shadow-md transition-all duration-300 ${controlState === "manual" ? "bg-emerald-400 hover:bg-emerald-500" : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          onClick={toggleStateMode}
          disabled={!docId}
        >
          Switch to {controlState === "manual" ? "Auto" : "Manual"}
        </button>
      </div>
      <div className="flex gap-4">
        <button
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-4 border-white shadow-inner text-white text-lg font-semibold transition-all duration-300 shadow-lg ${
            isDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : motorState === "on"
                ? "bg-indigo-200 hover:bg-indigo-200"
                : "bg-indigo-300 hover:bg-indigo-200"
            }`}
          onClick={() => toggleControl("motor_control")}
          disabled={isDisabled || !docId}
        >
          {motorState === "on" ? "💧 Motor On" : "💧 Motor Off"}
        </button>

        <button
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-4 border-white shadow-inner text-white text-lg font-semibold transition-all duration-300 shadow-lg ${
            isDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : ledState === "on"
                ? "bg-pink-200 hover:bg-pink-200"
                : "bg-pink-300 hover:bg-pink-200"
            }`}
          onClick={() => toggleControl("led_control")}
          disabled={isDisabled || !docId}
        >
          {ledState === "on" ? "💡 LED On" : "💡 LED Off"}
        </button>
      </div>
    </div>
  );
}
