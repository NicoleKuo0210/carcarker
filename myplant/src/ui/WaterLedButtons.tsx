"use client";

import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";

export default function WaterLedButtons() {
  const [docId, setDocId] = useState<string | null>(null);
  const [motorState, setMotorState] = useState<"on" | "off">("off");
  const [ledState, setLedState] = useState<"on" | "off">("off");
  const [controlState, setControlState] = useState<"auto" | "manual">("manual");

  // Load document ID and initial values
  useEffect(() => {
    const getDocId = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "esp32_controls"));
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setDocId(docSnap.id);
          const data = docSnap.data();
          if (data.motor_control) setMotorState(data.motor_control);
          if (data.led_control) setLedState(data.led_control);
          if (data.state === "auto" || data.state === "manual") {
            setControlState(data.state);
          }
        } else {
          console.error("No documents found in esp32_controls");
        }
      } catch (error) {
        console.error("Error fetching document ID:", error);
      }
    };
    getDocId();
  }, []);

  // Toggle motor or LED state
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

  // Toggle auto/manual state
  const toggleStateMode = async () => {
    if (!docId) return;
    const newState = controlState === "manual" ? "auto" : "manual";
    try {
      const docRef = doc(db, "esp32_controls", docId);
      await updateDoc(docRef, {
        state: newState,
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
          Mode:{" "}
          <span className="font-semibold">
            {controlState === "auto" ? "Auto" : "Manual"}
          </span>
        </p>
        <button
          className={`px-3 py-1 rounded text-sm text-white ${
            controlState === "manual"
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-500 hover:bg-gray-600"
          }`}
          onClick={toggleStateMode}
          disabled={!docId}
        >
          Switch to {controlState === "manual" ? "Auto" : "Manual"}
        </button>
      </div>

      <button
        className={`w-full px-4 py-2 rounded text-white transition ${
          isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
        }`}
        onClick={() => toggleControl("motor_control")}
        disabled={isDisabled || !docId}
      >
        {motorState === "on" ? "Turn Motor Off" : "Turn Motor On"}
      </button>

      <button
        className={`w-full px-4 py-2 rounded text-white transition ${
          isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600"
        }`}
        onClick={() => toggleControl("led_control")}
        disabled={isDisabled || !docId}
      >
        {ledState === "on" ? "Turn LED Off" : "Turn LED On"}
      </button>
    </div>
  );
}
