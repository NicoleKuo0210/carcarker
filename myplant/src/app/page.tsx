"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import WaterLedButtons from "@/ui/WaterLedButtons";
import EditName from "@/ui/EditName";

export default function Home() {
  const [data, setData] = useState<null | {
    imageUrl: string;
    temperature: string;
    humidity: string;
    moisture: string;
    illuminance: string;
    timestamp: { seconds: number };
    message?: string;
  }>(null);

useEffect(() => {
  const docRef = doc(db, "esp32_logs", "latest");

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      setData(docSnap.data() as any);
    } else {
      console.log("No such document!");
    }
  }, (error: any) => {
    console.error("Error in real-time subscription:", error);
  });

  return () => unsubscribe(); // cleanup on unmount
}, []);

  if (!data) return <p className="p-4">Loading...</p>;

  const temperature = parseFloat(data.temperature || "0");
  const humidity = parseFloat(data.humidity || "0");
  const moisture = parseFloat(data.moisture || "0");
  const illuminance = parseFloat(data.illuminance || "0");
  const imageUrl = data.imageUrl || "https://via.placeholder.com/400x300";
  const message = data.message || "No message.";
  const updateTime = new Date((data.timestamp?.seconds || 0) * 1000).toLocaleString();

  return (
    <div className="min-h-screen w-full bg-violet-200 p-4 pt-6 text-gray-700">
      <EditName/>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left panel */}
        <div className="p-6 rounded-xl shadow-xl space-y-6 bg-transparent">
          <div className="flex justify-around bg-gray-100 p-4 rounded-xl text-center shadow-md">
            <div>
              <p className="text-lg font-semibold">🌡️Temperature</p>
              <p className="text-xl font-bold">{temperature} °C</p>
            </div>
            <div className="border-l border-gray-400 h-12" />
            <div>
              <p className="text-lg font-semibold">💧Humidity</p>
              <p className="text-xl font-bold">{humidity} %</p>
            </div>
          </div>

          <div>
            <p className="text-lg font-medium mb-1">🌱 Moisture:</p>
            <div className="w-full bg-white rounded-full h-6 overflow-hidden border-4 border-white shadow-inner">
              <div
                className="bg-cyan-400 h-5 transition-all duration-300 shadow-md"
                style={{ width: `${moisture}%` }}
              />
            </div>
            <p className="text-sm text-right">{moisture} %</p>
          </div>

          <div>
            <p className="text-lg font-medium mb-1">🌞 Illuminance:</p>
            <div className="w-full bg-white rounded-full h-6 overflow-hidden border-4 border-white shadow-inner">
              <div
                className="bg-yellow-300 h-5 transition-all duration-300 shadow-md"
                style={{ width: `${illuminance}%` }}
              />
            </div>
            <p className="text-sm text-right">{illuminance} %</p>
          </div>

          <WaterLedButtons />

          <p className="text-center text-md font-semibold mt-4">
            Update Time: <span className="font-normal">{updateTime}</span>
          </p>
        </div>

        {/* Right panel */}
        <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center justify-between space-y-4">
          <div className="bg-gray-100 rounded-xl p-3 w-full text-center shadow">
            <p className="text-md">{message}</p>
          </div>
          <img
            src={imageUrl}
            alt="ESP32 Snapshot"
            className="w-full h-auto max-h-[400px] rounded-xl border object-cover shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
