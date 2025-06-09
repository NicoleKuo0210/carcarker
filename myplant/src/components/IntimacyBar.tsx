'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function IntimacyBar() {
  const [intimacy, setIntimacy] = useState(0);
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const docRef1 = doc(db, 'esp32_controls', 'CYWo758dq4hQ5MMOrbrt');
  const docRef2 = doc(db, 'esp32_logs', 'latest');

  useEffect(() => {
    const fetchData = async () => {
      const snapshot1 = await getDoc(docRef1);
      if (snapshot1.exists()) {
        const data = snapshot1.data();
        setIntimacy(data.intimacy ?? 0);
        setLevel(data.level ?? 1);
      }
      const snapshot2 = await getDoc(docRef2);
      if (snapshot2.exists()) {
        const data = snapshot2.data();
        setMessage(data.message ?? "Hello!");
      }
      setLoading(false);
    };
    fetchData();
  });

  const handleClick = async () => {
    let newIntimacy = intimacy + 1;
    let newLevel = level;
    let newMessage: string = message;

    if (newIntimacy >= 5*level) {
      newIntimacy = 0;
      newLevel += 1;
      newMessage = "I love you, too 🥰";
    }

    await updateDoc(docRef1, {
      intimacy: newIntimacy,
      level: newLevel,
    });

    await updateDoc(docRef2, {
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
          style={{ width: `${intimacy*20/level}%` }}
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
