"use client";

import { useRef, useState } from "react";

export function OralInput() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());

        // Convert to text using Whisper API
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error("Microphone error:", err);
      setError("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("model_id", "scribe_v2");

      const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: {
          "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const data = await response.json();
      const transcribedText = data.text || "";
      setText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText).trim());
    } catch (err) {
      console.error("Transcription error:", err);
      setError("Failed to transcribe audio. Check your API key.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-900" htmlFor="prompt">
          Ask or say something
        </label>
        <textarea
          id="prompt"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type here, or use the microphone…"
          className="min-h-24 w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
          disabled={isRecording || isProcessing}
        />
        {isRecording && (
          <div className="text-xs text-neutral-500">Recording...</div>
        )}
        {isProcessing && (
          <div className="text-xs text-neutral-500">Transcribing...</div>
        )}
        {error && <div className="text-xs text-red-600">{error}</div>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isProcessing}
          className="rounded-md border border-neutral-900 bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRecording ? "Stop recording" : "Start recording"}
        </button>

        <button
          type="button"
          onClick={onPickFile}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900"
        >
          Upload document
        </button>

        <button
          type="button"
          onClick={() => {
            setText("");
            setError(null);
          }}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={() => {
            // TODO: Send to AI
            console.log("Send:", text);
          }}
          disabled={!text.trim()}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt,.md,.doc,.docx"
          onChange={onFileChange}
        />
      </div>

      {selectedFile && (
        <div className="text-xs text-neutral-600">
          Document: <span className="text-neutral-900">{selectedFile.name}</span>
        </div>
      )}
    </section>
  );
}

