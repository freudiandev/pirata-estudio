"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HeartHandshake, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function BreathingButton() {
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!open || !soundOn) {
      oscillatorRef.current?.stop();
      oscillatorRef.current = null;
      return;
    }

    const audioContext = new AudioContext();
    const gain = audioContext.createGain();
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = 220;
    gain.gain.value = 0.015;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();

    audioContextRef.current = audioContext;
    oscillatorRef.current = oscillator;

    return () => {
      oscillator.stop();
      audioContext.close().catch(() => undefined);
    };
  }, [open, soundOn]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full bg-[#123b62] px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5"
      >
        <HeartHandshake className="h-5 w-5" />
        Necesito un momento
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#123b62]/35 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-lg rounded-[2rem] bg-[#fffaf1] p-8 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-5 top-5 rounded-full bg-white p-2 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="space-y-6 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
                  Pausa breve
                </p>
                <motion.div
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  className="mx-auto h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,_#a9e3cb_0%,_#63c0a0_45%,_#dff6ea_100%)]"
                />
                <p className="text-2xl font-bold text-slate-900">
                  Respira. No tienes que aceptar todo.
                </p>
                <p className="text-base leading-7 text-slate-600">
                  Inhala 4 segundos, sostén 4, exhala 6. Hazlo tres veces y vuelve a mirar tus pendientes.
                </p>
                <button
                  type="button"
                  onClick={() => setSoundOn((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-slate-700"
                >
                  {soundOn ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                  {soundOn ? "Sonido suave encendido" : "Encender sonido suave"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
