"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import WaterLedButtons from "@/ui/WaterLedButtons"

console.log("🔍 Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

export default function Home() {
  const [data, setData] = useState<null | {
    imageUrl: string;
    temperature: string;
    humidity: string;
  }>(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const docRef = doc(db, "esp32_logs", "latest");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(docSnap.data() as any);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  fetchData();
}, []);

  if (!data) return <p className="p-4">Loading...</p>;

  const temperature = parseFloat(data.temperature);
  const humidity = parseFloat(data.humidity);

  return (
    <div className="h-screen w-full bg-white p-2">
      <div className="h-full w-full p-2 pl-6 pr-6  border-4 border-white rounded-2xl bg-cyan-700">
        <p className="w-full font-bold font-serif text-3xl text-white text-center p-4"> My Plant </p>
        <div className="grid grid-cols-1 md:grid-cols-2 h-full gap-6 items-stretch">
          <div className="w-full max-h-120 bg-white shadow-md rounded-xl p-6 flex flex-col">
            <div>
              <p className="text-lg font-medium mb-1 text-gray-600">🌡️ Temperature</p>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-red-500 h-4 transition-all duration-300"
                  style={{ width: `${(temperature / 50) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-right text-sm text-gray-600">{temperature} °C</p>
            </div>

            <div>
              <p className="text-lg font-medium mb-1 text-gray-600">💧 Humidity</p>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-500 h-4 transition-all duration-300"
                  style={{ width: `${(humidity / 100) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-right text-sm text-gray-600">{humidity} %</p>
            </div>
            <WaterLedButtons/>
          </div>

          <div className="h-full w-full">
            <img
              src={data.imageUrl}
              alt="ESP32 Snapshot"
              className="w-full h-auto rounded-xl border"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
