import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Lock, Unlock, Info, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';

interface Op {
    thread: 'A' | 'B';
    action: string;
    counterAfter: number;
    note: string;
}

// Uten synkronisering: begge tråder leser samme verdi før noen rekker å skrive tilbake,
// så én av oppdateringene "forsvinner" (klassisk race condition / lost update).
const WITHOUT_LOCK: Op[] = [
    { thread: 'A', action: 'les counter → 0', counterAfter: 0, note: 'Tråd A leser counter (0) inn i sin egen lokale kopi.' },
    { thread: 'B', action: 'les counter → 0', counterAfter: 0, note: 'Tråd B rekker å lese counter (fortsatt 0) FØR A har skrevet tilbake.' },
    { thread: 'A', action: 'skriv counter = 0 + 1', counterAfter: 1, note: 'Tråd A skriver tilbake sin utregnede verdi: 1.' },
    { thread: 'B', action: 'skriv counter = 0 + 1', counterAfter: 1, note: 'Tråd B skriver tilbake SIN utregning (basert på den gamle 0-verdien): også 1! Én økning er tapt.' },
];

// Med synkronisering (f.eks. "synchronized" i Java): kun én tråd av gangen kan være
// inne i den kritiske seksjonen, så ingen oppdateringer går tapt.
const WITH_LOCK: Op[] = [
    { thread: 'A', action: 'tar lås, les counter → 0', counterAfter: 0, note: 'Tråd A tar låsen. Tråd B må nå vente.' },
    { thread: 'A', action: 'skriv counter = 0 + 1, slipper lås', counterAfter: 1, note: 'Tråd A fullfører hele operasjonen og slipper låsen.' },
    { thread: 'B', action: 'tar lås, les counter → 1', counterAfter: 1, note: 'Nå kan Tråd B ta låsen og lese den oppdaterte verdien.' },
    { thread: 'B', action: 'skriv counter = 1 + 1, slipper lås', counterAfter: 2, note: 'Tråd B fullfører korrekt. Sluttresultat: 2, som forventet.' },
];

export function ThreadRaceLab() {
    const [locked, setLocked] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    const ops = useMemo(() => (locked ? WITH_LOCK : WITHOUT_LOCK), [locked]);
    const step = ops[stepIndex];
    const counter = stepIndex === 0 ? 0 : ops[stepIndex - 1].counterAfter;

    const toggleMode = (value: boolean) => {
        setLocked(value);
        setStepIndex(0);
    };

    const next = () => setStepIndex(i => Math.min(i + 1, ops.length - 1));
    const prev = () => setStepIndex(i => Math.max(i - 1, 0));
    const reset = () => setStepIndex(0);

    const finalValue = ops[ops.length - 1].counterAfter;
    const isFinal = stepIndex === ops.length - 1;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Cpu className="text-primary w-8 h-8" />
                            Tråd-visualiserer
                        </h2>
                        <p className="text-gray-400">To tråder øker samme teller samtidig. Se hva som skjer med og uten synkronisering (IN1010).</p>
                    </div>

                    <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl p-1">
                        <button
                            onClick={() => toggleMode(false)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${!locked ? 'bg-red-500/80 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Unlock className="w-4 h-4" /> Uten lås
                        </button>
                        <button
                            onClick={() => toggleMode(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${locked ? 'bg-green-500/80 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Lock className="w-4 h-4" /> Med lås (synchronized)
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Timeline */}
                    <div className="bg-black/30 rounded-2xl p-4 border border-white/5 space-y-2">
                        {ops.map((op, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${idx === stepIndex ? 'bg-primary/20 border border-primary/40' : idx < stepIndex ? 'opacity-40' : 'opacity-70'
                                    }`}
                            >
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${op.thread === 'A' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                    }`}>
                                    {op.thread}
                                </span>
                                <span className="font-mono text-sm text-gray-200">{op.action}</span>
                            </div>
                        ))}
                    </div>

                    {/* Counter + forklaring */}
                    <div className="space-y-4">
                        <div className="bg-black/20 border border-white/10 rounded-2xl p-6 text-center">
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Delt teller (counter)</div>
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={counter}
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-5xl font-mono font-bold text-white"
                                >
                                    {counter}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-primary text-sm leading-relaxed flex items-start gap-3">
                            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{step.note}</span>
                        </div>

                        {isFinal && (
                            <div className={`rounded-2xl p-4 text-sm font-medium border ${finalValue === 2
                                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                                }`}>
                                Sluttresultat: {finalValue} {finalValue === 2 ? '— korrekt! Begge økningene talte.' : '— feil! Forventet 2, men én økning gikk tapt (race condition).'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-gray-500 font-mono">Steg {stepIndex + 1} / {ops.length}</div>
                    <div className="flex items-center gap-3">
                        <button onClick={prev} disabled={stepIndex === 0} className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 px-4 py-2 rounded-xl transition-all flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Forrige
                        </button>
                        <button onClick={reset} className="bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-2 rounded-xl transition-all">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={next} disabled={stepIndex === ops.length - 1} className="bg-primary hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                            Neste <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-surface/30 border border-white/10 rounded-2xl p-6 space-y-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Hva er en race condition?
                </h3>
                <p className="text-gray-400 leading-relaxed">
                    Når flere tråder leser og skriver til samme delte tilstand uten synkronisering, kan rekkefølgen
                    operasjonene faktisk kjøres i variere fra kjøring til kjøring. I eksempelet over "leser" begge
                    trådene telleren før noen har rukket å skrive tilbake, slik at én av økningene forsvinner.
                    I Java løses dette typisk med <code className="text-primary font-mono">synchronized</code>-blokker
                    eller <code className="text-primary font-mono">Lock</code>-objekter, som sørger for at kun én tråd
                    av gangen kan kjøre den kritiske seksjonen.
                </p>
            </div>
        </div>
    );
}

