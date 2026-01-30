import { OralInput } from "@/app/_components/oral-input";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Orah</h1>
        <p className="text-sm text-neutral-600">
          An oral-first mentor/professor/learning partner.
        </p>
      </header>

      <OralInput />
    </main>
  );
}
