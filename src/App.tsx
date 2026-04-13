import { useState, useEffect, useRef } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// PCM to WAV converter for TTS playback
function pcmToWav(base64Pcm: string): string {
  const pcm = Uint8Array.from(atob(base64Pcm), (c) => c.charCodeAt(0));
  const sampleRate = 24000;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const w = (o: number, s: string) =>
    s.split("").forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF");
  view.setUint32(4, 36 + pcm.length, true);
  w(8, "WAVE");
  w(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  w(36, "data");
  view.setUint32(40, pcm.length, true);
  const wav = new Uint8Array(44 + pcm.length);
  wav.set(new Uint8Array(header), 0);
  wav.set(pcm, 44);
  return URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A12] via-[#12101c] to-[#0A0A12]" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#8B4513] rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Cross symbol */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-1 h-16 bg-gradient-to-b from-[#D4AF37] to-[#8B4513]" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-[#8B4513] via-[#D4AF37] to-[#8B4513]" />
          </div>
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-center text-[#D4AF37] mb-2 tracking-wider">
          Divine Word
        </h1>
        <p className="font-body text-[#F5E6D3]/60 text-center mb-8 text-sm md:text-base">
          Receive your revelation
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full px-4 py-3 bg-[#1a1825]/80 border border-[#D4AF37]/20 rounded-lg text-[#F5E6D3] placeholder-[#F5E6D3]/40 font-body focus:outline-none focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-3 bg-[#1a1825]/80 border border-[#D4AF37]/20 rounded-lg text-[#F5E6D3] placeholder-[#F5E6D3]/40 font-body focus:outline-none focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
            />
          </div>
          <input name="flow" type="hidden" value={flow} />

          {error && (
            <p className="text-red-400 text-sm text-center font-body">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#8B4513] via-[#D4AF37] to-[#8B4513] text-[#0A0A12] font-display text-lg rounded-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "..." : flow === "signIn" ? "Enter" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="text-[#D4AF37]/60 hover:text-[#D4AF37] text-sm font-body transition-colors"
          >
            {flow === "signIn" ? "Create new account" : "Already have an account?"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => signIn("anonymous")}
            className="text-[#F5E6D3]/40 hover:text-[#F5E6D3]/70 text-sm font-body transition-colors"
          >
            Continue as guest
          </button>
        </div>

        <Footer />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 text-center">
      <p className="text-[#F5E6D3]/30 text-xs font-body">
        Requested by{" "}
        <a href="https://twitter.com/Salmong" className="hover:text-[#D4AF37]/50 transition-colors">
          @Salmong
        </a>
        {" · "}
        Built by{" "}
        <a href="https://twitter.com/clonkbot" className="hover:text-[#D4AF37]/50 transition-colors">
          @clonkbot
        </a>
      </p>
    </footer>
  );
}

interface Revelation {
  _id: Id<"revelations">;
  verse: string;
  reference: string;
  reflection: string;
  audioBase64?: string;
  videoUrl?: string;
  createdAt: number;
}

function RevelationCard({ revelation, onPlay }: { revelation: Revelation; onPlay: (r: Revelation) => void }) {
  const remove = useMutation(api.revelations.remove);

  return (
    <div className="group p-4 bg-[#1a1825]/60 border border-[#D4AF37]/10 rounded-lg hover:border-[#D4AF37]/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[#D4AF37] font-display text-sm">{revelation.reference}</span>
        <button
          onClick={() => remove({ id: revelation._id })}
          className="opacity-0 group-hover:opacity-100 text-[#F5E6D3]/30 hover:text-red-400 text-xs transition-all"
        >
          Remove
        </button>
      </div>
      <p className="text-[#F5E6D3]/80 font-body text-sm leading-relaxed line-clamp-3 mb-3">
        "{revelation.verse}"
      </p>
      <button
        onClick={() => onPlay(revelation)}
        className="text-[#D4AF37]/60 hover:text-[#D4AF37] text-xs font-body flex items-center gap-1 transition-colors"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
        Replay
      </button>
    </div>
  );
}

type GenerationPhase = "idle" | "verse" | "audio" | "video" | "complete";

function MainApp() {
  const { signOut } = useAuthActions();
  const revelations = useQuery(api.revelations.list);
  const createRevelation = useMutation(api.revelations.create);
  const chat = useAction(api.ai.chat);
  const tts = useAction(api.ai.textToSpeech);
  const generateVideo = useAction(api.ai.generateVideo);

  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [currentRevelation, setCurrentRevelation] = useState<{
    verse: string;
    reference: string;
    reflection: string;
    audioBase64?: string;
    videoUrl?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isGenerating = phase !== "idle" && phase !== "complete";

  const generateRevelation = async () => {
    setError("");
    setPhase("verse");
    setCurrentRevelation(null);

    try {
      // Step 1: Generate random Bible verse with reflection
      const verseResponse = await chat({
        systemPrompt: `You are a biblical scholar. Generate a random Bible verse or short passage (1-3 verses) with its reference, followed by a brief spiritual reflection. Format your response EXACTLY as follows:

REFERENCE: [Book Chapter:Verse]
VERSE: [The actual verse text]
REFLECTION: [A 2-3 sentence contemplative reflection on the verse's meaning]

Choose from any book of the Bible - vary between Old and New Testament. Include well-known and obscure passages alike.`,
        messages: [{ role: "user", content: "Generate a random Bible verse with reflection." }],
      });

      // Parse the response
      const referenceMatch = verseResponse.match(/REFERENCE:\s*(.+)/);
      const verseMatch = verseResponse.match(/VERSE:\s*(.+)/);
      const reflectionMatch = verseResponse.match(/REFLECTION:\s*(.+)/s);

      const reference = referenceMatch?.[1]?.trim() || "Scripture";
      const verse = verseMatch?.[1]?.trim() || verseResponse;
      const reflection = reflectionMatch?.[1]?.trim() || "";

      setCurrentRevelation({ verse, reference, reflection });

      // Step 2: Generate audio narration
      setPhase("audio");
      const audioText = `${verse}. ${reflection}`;
      const audioBase64 = await tts({ text: audioText, voice: "Charon" });

      setCurrentRevelation((prev) => prev ? { ...prev, audioBase64 } : null);

      // Play audio
      if (audioBase64) {
        const audioUrl = pcmToWav(audioBase64);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play().catch(() => {});
        }
      }

      // Step 3: Generate ambient video
      setPhase("video");
      const videoResult = await generateVideo({
        prompt: `Cinematic slow motion: ancient temple interior with rays of golden light streaming through stained glass windows, dust particles floating in air, peaceful and sacred atmosphere, 4K quality, ethereal mood`,
        aspectRatio: "16:9",
      });

      const videoUrl = videoResult?.url || undefined;
      setCurrentRevelation((prev) => prev ? { ...prev, videoUrl } : null);

      // Save to database
      await createRevelation({
        verse,
        reference,
        reflection,
        audioBase64,
        videoUrl,
      });

      setPhase("complete");
    } catch (err) {
      console.error(err);
      setError("A moment of silence... Please try again.");
      setPhase("idle");
    }
  };

  const playRevelation = (revelation: Revelation) => {
    setCurrentRevelation({
      verse: revelation.verse,
      reference: revelation.reference,
      reflection: revelation.reflection,
      audioBase64: revelation.audioBase64,
      videoUrl: revelation.videoUrl,
    });
    setPhase("complete");

    if (revelation.audioBase64 && audioRef.current) {
      const audioUrl = pcmToWav(revelation.audioBase64);
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(() => {});
    }
  };

  const getPhaseMessage = () => {
    switch (phase) {
      case "verse": return "Seeking divine wisdom...";
      case "audio": return "Giving voice to the Word...";
      case "video": return "Crafting your vision (this may take a moment)...";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A0A12] via-[#12101c] to-[#0A0A12]" />

      {/* Animated ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-[150px] opacity-10 animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#8B4513] rounded-full blur-[120px] opacity-15 animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-[#D4AF37] rounded-full blur-[100px] opacity-10 animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      {/* Video background when playing */}
      {currentRevelation?.videoUrl && phase === "complete" && (
        <div className="fixed inset-0 z-0">
          <video
            ref={videoRef}
            src={currentRevelation.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A12] via-transparent to-[#0A0A12]/80" />
        </div>
      )}

      <audio ref={audioRef} className="hidden" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-0.5 h-8 bg-gradient-to-b from-[#D4AF37] to-transparent" />
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#D4AF37]" />
            </div>
            <span className="font-display text-lg md:text-xl text-[#D4AF37] tracking-wider">Divine Word</span>
          </div>
          <button
            onClick={() => signOut()}
            className="text-[#F5E6D3]/40 hover:text-[#F5E6D3]/70 text-sm font-body transition-colors"
          >
            Leave
          </button>
        </header>

        {/* Center content */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          {/* Current revelation display */}
          {currentRevelation && (
            <div className="max-w-2xl w-full text-center mb-8 md:mb-12 animate-fade-in">
              <span className="inline-block text-[#D4AF37] font-display text-sm md:text-base tracking-[0.3em] uppercase mb-4 md:mb-6">
                {currentRevelation.reference}
              </span>
              <blockquote className="text-[#F5E6D3] font-body text-xl md:text-2xl lg:text-3xl leading-relaxed mb-6 md:mb-8 italic">
                "{currentRevelation.verse}"
              </blockquote>
              {currentRevelation.reflection && (
                <p className="text-[#F5E6D3]/60 font-body text-sm md:text-base leading-relaxed max-w-xl mx-auto">
                  {currentRevelation.reflection}
                </p>
              )}
            </div>
          )}

          {/* Loading state */}
          {isGenerating && (
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-2 border-[#D4AF37]/20 rounded-full" />
                  <div className="absolute inset-0 border-2 border-[#D4AF37] rounded-full border-t-transparent animate-spin" />
                  <div className="absolute inset-2 border border-[#D4AF37]/30 rounded-full border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                </div>
              </div>
              <p className="text-[#F5E6D3]/60 font-body text-sm md:text-base animate-pulse">
                {getPhaseMessage()}
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <p className="text-red-400/80 font-body text-sm mb-6 text-center">{error}</p>
          )}

          {/* Main action button */}
          <button
            onClick={generateRevelation}
            disabled={isGenerating}
            className="group relative px-8 md:px-12 py-4 md:py-5 overflow-hidden rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#8B4513] via-[#D4AF37] to-[#8B4513] opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
            <div className="absolute -inset-4 bg-[#D4AF37]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <span className="relative font-display text-[#0A0A12] text-lg md:text-xl tracking-wider">
              {isGenerating ? "Receiving..." : currentRevelation ? "Reveal Another" : "Reveal"}
            </span>
          </button>

          {!currentRevelation && !isGenerating && (
            <p className="mt-6 text-[#F5E6D3]/30 font-body text-xs md:text-sm text-center max-w-md">
              Press to receive a random Bible verse with narration and visual meditation
            </p>
          )}
        </main>

        {/* History section */}
        {revelations && revelations.length > 0 && (
          <section className="p-4 md:p-8 border-t border-[#D4AF37]/10">
            <h2 className="font-display text-[#D4AF37]/60 text-sm tracking-[0.2em] uppercase mb-4 md:mb-6">
              Past Revelations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {revelations.slice(0, 6).map((rev: Revelation) => (
                <RevelationCard key={rev._id} revelation={rev} onPlay={playRevelation} />
              ))}
            </div>
          </section>
        )}

        <Footer />
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .group-hover\\:animate-shimmer:hover {
          animation: shimmer 1.5s ease-in-out infinite;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A12]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-[#D4AF37]/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-[#D4AF37] rounded-full border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return isAuthenticated ? <MainApp /> : <SignInForm />;
}
