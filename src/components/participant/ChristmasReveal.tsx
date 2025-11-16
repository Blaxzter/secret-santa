import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const translations = {
    de: {
        youDrew: "Du hast gezogen",
        continue: "Weiter",
        instruction:
            "Das ist die Person, für die du ein Geschenk besorgen darfst! Klicke auf 'Weiter' um fortzufahren.",
    },
    en: {
        youDrew: "You drew",
        continue: "Continue",
        instruction:
            "This is the person you will buy a gift for! Click 'Continue' to proceed.",
    },
};

interface ChristmasRevealProps {
    drawnName: string;
    language: "de" | "en";
    onComplete: () => void;
}

export default function ChristmasReveal({
    drawnName,
    language,
    onComplete,
}: ChristmasRevealProps) {
    const [showName, setShowName] = useState(false);
    const t = translations[language];

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowName(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FF6B9D] via-[#FFD93D] to-[#A8E6CF] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Floating decorations */}
            <motion.div
                className="absolute top-10 left-10"
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 10, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <Star
                    className="w-12 h-12 text-black opacity-20"
                    fill="black"
                />
            </motion.div>

            <motion.div
                className="absolute top-20 right-20"
                animate={{
                    y: [0, 20, 0],
                    rotate: [0, -10, 0],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <Sparkles className="w-16 h-16 text-black opacity-20" />
            </motion.div>

            <motion.div
                className="absolute bottom-20 left-20"
                animate={{
                    y: [0, -15, 0],
                    rotate: [0, 15, 0],
                }}
                transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <Gift className="w-14 h-14 text-black opacity-20" />
            </motion.div>

            <motion.div
                className="absolute top-40 right-10"
                animate={{
                    y: [0, -25, 0],
                    rotate: [0, -15, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <Gift className="w-10 h-10 text-black opacity-15" />
            </motion.div>

            <motion.div
                className="absolute bottom-10 right-32"
                animate={{
                    y: [0, 30, 0],
                    rotate: [0, 20, 0],
                }}
                transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <Star
                    className="w-10 h-10 text-black opacity-15"
                    fill="black"
                />
            </motion.div>

            <motion.div
                className="absolute top-1/3 left-32"
                animate={{
                    y: [0, -18, 0],
                    rotate: [0, -12, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <Sparkles className="w-12 h-12 text-black opacity-20" />
            </motion.div>

            <motion.div
                className="absolute bottom-1/4 right-16"
                animate={{
                    y: [0, 22, 0],
                    rotate: [0, -8, 0],
                }}
                transition={{
                    duration: 3.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <Sparkles className="w-14 h-14 text-black opacity-18" />
            </motion.div>

            <motion.div
                className="absolute top-1/4 right-1/4"
                animate={{
                    y: [0, -12, 0],
                    rotate: [0, 25, 0],
                }}
                transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <Star className="w-8 h-8 text-black opacity-15" fill="black" />
            </motion.div>

            <motion.div
                className="absolute bottom-1/3 left-1/4"
                animate={{
                    y: [0, 28, 0],
                    rotate: [0, -18, 0],
                }}
                transition={{
                    duration: 3.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <Gift className="w-16 h-16 text-black opacity-20" />
            </motion.div>

            <motion.div
                className="absolute top-2/3 left-10"
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 12, 0],
                    scale: [1, 0.9, 1],
                }}
                transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <Star
                    className="w-11 h-11 text-black opacity-18"
                    fill="black"
                />
            </motion.div>

            <motion.div
                className="absolute top-1/2 right-8"
                animate={{
                    y: [0, 15, 0],
                    rotate: [0, -20, 0],
                }}
                transition={{
                    duration: 4.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <Sparkles className="w-10 h-10 text-black opacity-16" />
            </motion.div>

            <motion.div
                className="absolute bottom-40 left-1/3"
                animate={{
                    y: [0, -16, 0],
                    rotate: [0, 8, 0],
                }}
                transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <Gift className="w-9 h-9 text-black opacity-14" />
            </motion.div>

            {/* Main content */}
            <div className="text-center space-y-8 z-10">
                {/* Animated gift box */}
                <AnimatePresence mode="wait">
                    {!showName ? (
                        <motion.div
                            key="gift"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ duration: 0.8 }}
                            className="flex justify-center"
                        >
                            <motion.div
                                animate={{
                                    y: [0, -30, 0],
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="bg-white border-4 border-black p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rotate-[5deg]"
                            >
                                <Gift className="w-32 h-32 text-[#FF6B9D]" />
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="name"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, type: "spring" }}
                            className="space-y-6"
                        >
                            <motion.div
                                animate={{
                                    rotate: [0, -2, 2, -2, 2, 0],
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: 3,
                                }}
                            >
                                <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
                                    {t.youDrew}
                                </h2>
                            </motion.div>

                            <motion.div
                                className="bg-white border-4 border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: [0.8, 1.1, 1] }}
                                transition={{ duration: 0.6 }}
                            >
                                <motion.h1
                                    className="text-6xl md:text-8xl font-black text-black"
                                    style={{
                                        textShadow: "6px 6px 0px #FFD93D",
                                    }}
                                    animate={{
                                        scale: [1, 1.05, 1],
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    {drawnName}
                                </motion.h1>
                            </motion.div>

                            {/* Confetti-like sparkles */}
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute"
                                    style={{
                                        left: `${20 + i * 10}%`,
                                        top: `${30 + (i % 2) * 20}%`,
                                    }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: [0, 1, 0],
                                        scale: [0, 1.5, 0],
                                        y: [-50, 50],
                                    }}
                                    transition={{
                                        duration: 2,
                                        delay: i * 0.1,
                                        repeat: Infinity,
                                        repeatDelay: 1,
                                    }}
                                >
                                    <Star
                                        className="w-6 h-6 text-black"
                                        fill="black"
                                    />
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="space-y-6"
                            >
                                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl mx-auto mt-12">
                                    <p className="text-xl font-bold text-black">
                                        {t.instruction}
                                    </p>
                                </div>

                                <Button
                                    onClick={onComplete}
                                    className="border-4 border-black bg-[#A8E6CF] hover:bg-[#88D4AB] h-16 px-12 text-2xl font-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[6px] hover:translate-y-[6px] transition-all"
                                >
                                    {t.continue}
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
