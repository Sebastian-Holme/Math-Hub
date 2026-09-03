import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Info, RotateCcw, Play } from 'lucide-react';

// Skjev "populasjon" (ligner en eksponentialfordeling) — de fleste verdier er lave,
// men det finnes en hale med store verdier. Poenget er at populasjonen IKKE er normalfordelt.
function drawFromPopulation() {
    // Invers transform-utvalg for en enkel eksponentialfordeling, klippet til [0, 20]
    const u = Math.random();
    const value = -Math.log(1 - u) * 3;
    return Math.min(value, 20);
}

function mean(values: number[]) {
    return values.reduce((a, b) => a + b, 0) / values.length;
}

const BIN_COUNT = 16;
const BIN_MAX = 12;

export function SamplingSimulator() {
    const [sampleSize, setSampleSize] = useState(30);
    const [sampleMeans, setSampleMeans] = useState<number[]>([]);
    const [lastSample, setLastSample] = useState<number[]>([]);

    const drawSample = () => {
        const sample = Array.from({ length: sampleSize }, drawFromPopulation);
        setLastSample(sample);
        setSampleMeans(prev => [...prev, mean(sample)]);
    };

    const drawMany = () => {
        const newMeans: number[] = [];
        let sample: number[] = [];
        for (let i = 0; i < 200; i++) {
            sample = Array.from({ length: sampleSize }, drawFromPopulation);
            newMeans.push(mean(sample));
        }
        setLastSample(sample);
        setSampleMeans(prev => [...prev, ...newMeans]);
    };

    const reset = () => {
        setSampleMeans([]);
        setLastSample([]);
    };

    const bins = useMemo(() => {
        const counts = new Array(BIN_COUNT).fill(0);
        sampleMeans.forEach(m => {
            const idx = Math.min(BIN_COUNT - 1, Math.floor((m / BIN_MAX) * BIN_COUNT));
            counts[idx]++;
        });
        const maxCount = Math.max(1, ...counts);
        return counts.map((c, i) => ({
            count: c,
            heightPct: (c / maxCount) * 100,
            label: (i * (BIN_MAX / BIN_COUNT)).toFixed(1)
        }));
    }, [sampleMeans]);

    const overallMean = sampleMeans.length ? mean(sampleMeans).toFixed(2) : '–';

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Database className="text-primary w-8 h-8" />
                            Sampling Simulator
                        </h2>
                        <p className="text-gray-400">Se Sentralgrensesetningen (CLT) i aksjon: trekk utvalg fra en skjev populasjon (STK-IN1050).</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-3 py-2">
                            <span className="text-xs text-gray-500 font-mono">n =</span>
                            <input
                                type="number"
                                min={1}
                                max={200}
                                value={sampleSize}
                                onChange={(e) => setSampleSize(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
                                className="w-16 bg-transparent text-white font-mono outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Siste utvalg */}
                    <div className="bg-black/20 border border-white/10 rounded-2xl p-4 space-y-3">
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Populasjon (skjev fordeling)</div>
                        <p className="text-gray-400 text-sm">
                            Hver prikk under er én observasjon fra det siste utvalget ditt (størrelse n = {sampleSize}).
                        </p>
                        <div className="relative h-24 bg-black/30 rounded-xl overflow-hidden">
                            {lastSample.map((v, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-secondary"
                                    style={{ left: `${Math.min(98, (v / BIN_MAX) * 100)}%` }}
                                />
                            ))}
                            {lastSample.length === 0 && (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                                    Trekk et utvalg for å se observasjonene
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Histogram av utvalgsgjennomsnitt */}
                    <div className="bg-black/20 border border-white/10 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Fordeling av utvalgsgjennomsnitt</div>
                            <div className="text-xs text-gray-500 font-mono">{sampleMeans.length} utvalg trukket</div>
                        </div>
                        <div className="h-24 flex items-end gap-[2px]">
                            {bins.map((bin, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                                    <motion.div
                                        animate={{ height: `${bin.heightPct}%` }}
                                        className="w-full bg-primary/70 rounded-t-sm min-h-[2px]"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">Gjennomsnitt av gjennomsnittene: {overallMean}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={drawSample}
                        className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <Play className="w-5 h-5" /> Trekk ett utvalg
                    </button>
                    <button
                        onClick={drawMany}
                        className="bg-white/5 hover:bg-white/10 text-gray-200 px-6 py-3 rounded-xl font-bold transition-all"
                    >
                        Trekk 200 utvalg
                    </button>
                    <button
                        onClick={reset}
                        className="bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-3 rounded-xl transition-all ml-auto"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-surface/30 border border-white/10 rounded-2xl p-6 space-y-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Hva viser dette?
                </h3>
                <p className="text-gray-400 leading-relaxed">
                    Populasjonen til venstre er tydelig skjev — de fleste verdier er lave, med en hale mot høyre.
                    Likevel vil fordelingen av <em>utvalgsgjennomsnitt</em> (histogrammet til høyre) nærme seg en
                    klokkeform (normalfordeling) etter hvert som du trekker flere utvalg, spesielt med et større
                    utvalgsstørrelse (n). Dette er selve poenget med Sentralgrensesetningen, og grunnen til at vi kan
                    bruke normalfordelingen til å bygge konfidensintervaller og hypotesetester selv når vi ikke vet
                    hvordan den underliggende populasjonen er fordelt.
                </p>
            </div>
        </div>
    );
}

