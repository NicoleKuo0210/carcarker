'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function IntimacyBar() {
  const [intimacy, setIntimacy] = useState(0);
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const docRef = doc(db, 'esp32_logs', 'latest');

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setIntimacy(data.intimacy ?? 0);
        setLevel(data.level ?? 1);
        setMessage(data.message ?? "Hello!");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleClick = async () => {
    let newIntimacy = intimacy + 1;
    let newLevel = level;
    let newMessage: string = message;

    if (newIntimacy >= 100) {
      newIntimacy = 0;
      newLevel += 1;
      newMessage = "I love you, too 🥰";
    }

    await updateDoc(docRef, {
      intimacy: newIntimacy,
      level: newLevel,
      message: newMessage,
    });

    setIntimacy(newIntimacy);
    setLevel(newLevel);
    setMessage(newMessage);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="w-full flex items-center space-x-4 max-w-md mx-auto mt-2">
      <div className="text-lg font-semibold text-right">💕Lv. {level}</div>
      <div className="flex-1 bg-gray-100 h-6 rounded border-4 border-white overflow-hidden shadow-md">
        <div
          className="bg-gradient-to-r from-pink-300 to-pink-400 h-full transition-all duration-300"
          style={{ width: `${intimacy}%` }}
        />
      </div>
      <button
        onClick={handleClick}
        className="bg-gray-100 shadow-md text-gray-700 font-bold px-4 py-1 rounded hover:bg-gray-200 transition"
      >
        ❤️+1
      </button>
    </div>
  );
}
