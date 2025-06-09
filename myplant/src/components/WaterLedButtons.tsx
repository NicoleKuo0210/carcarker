"use client";

import { collection, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";

export default function WaterLedButtons() {
  const [docId, setDocId] = useState<string | null>(null);
  const [motorState, setMotorState] = useState<"on" | "off">("off");
  const [ledState, setLedState] = useState<string>("off");
  const [controlState, setControlState] = useState<"auto" | "manual">("manual");

  const ledCommands = ["off", "grow light", "dim light", "white", "green"];

  const ledColorMap: Record<string, string> = {
    "off": "bg-pink-300 hover:bg-pink-200 text-white",
    "grow light": "bg-fuchsia-300 hover:bg-fuchsia-200 text-white",
    "dim light": "bg-purple-300 hover:bg-purple-200 text-white",
    "white": "bg-orange-100 hover:bg-orange-50 text-gray-800",
    "green": "bg-green-400 hover:bg-green-300 text-white",
  };
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


  const toggleMotorControl = async (type: "motor_control") => {
    if (!docId || controlState === "auto") return;

    const newState =
      type === "motor_control"
        ? motorState === "on"
          ? "on"
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

  const toggleLedControl = async () => {
    if (!docId || controlState === "auto") return;

    const currentIndex = ledCommands.indexOf(ledState);
    const nextIndex = (currentIndex + 1) % ledCommands.length;
    const nextCommand = ledCommands[nextIndex];

    try {
      const docRef = doc(db, "esp32_controls", docId);
      await updateDoc(docRef, {
        led_control: nextCommand,
      });
      setLedState(nextCommand);
    } catch (error) {
      console.error("Error updating LED command:", error);
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

  const ledButtonColor = isDisabled
    ? "bg-gray-400 cursor-not-allowed text-white"
    : ledColorMap[ledState] || "bg-pink-400 hover:bg-pink-300";

  const ledLabel = `💡LED: ${ledState.toUpperCase()}`;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-l text-gray-700">
          Mode: <span className={`font-semibold ${controlState === "manual" ? "text-emerald-600" : "text-sky-600"}`}>{controlState === "auto" ? "Auto" : "Manual"}</span>
        </p>
        <button
          className={`px-4 py-2 rounded text-sm font-semibold text-white shadow-md transition-all duration-300 ${controlState === "manual" ? "bg-gradient-to-t from-emerald-500 to-emerald-400 hover:bg-emerald-500" : "bg-gradient-to-t from-sky-500 to-sky-600 hover:bg-sky-500"
            }`}
          onClick={toggleStateMode}
          disabled={!docId}
        >
          Switch to {controlState === "manual" ? "Auto" : "Manual"}
        </button>
      </div>
      <div className="flex gap-4">
        <button
          className={`bg-gradient-to-b from-indigo-200 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-4 border-white shadow-inner text-white text-lg font-semibold transition-all duration-300 ${isDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : motorState === "on"
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-indigo-400 hover:bg-indigo-300"
            }`}
          onClick={() => toggleMotorControl("motor_control")}
          disabled={isDisabled || !docId}
        >
          {motorState === "on" ? "💧Watering..." : "💧Tap to Water"}
        </button>

        <button
          className={`bg-gradient-to-b from-red-50 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-4 border-white shadow-inner text-lg font-semibold transition-all duration-300 ${ledButtonColor}`}
          onClick={toggleLedControl}
          disabled={isDisabled || !docId}
        >
          {ledLabel}
        </button>

      </div>
    </div>
  );
}
