import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, RotateCcw, ArrowRight, ArrowLeft, Terminal, Info } from 'lucide-react';

interface Step {
    line: number;
    vars: Record<string, string | number>;
    note: string;
    output?: string;
    scope?: string;
}

interface Snippet {
    id: string;
    title: string;
    code: string[];
    steps: Step[];
}

const SNIPPETS: Snippet[] = [
    {
        id: 'loop',
        title: 'For-løkke',
        code: [
            'total = 0',
            'for i in range(5):',
            '    total = total + i',
            '',
            'print(total)'
        ],
        steps: [
            { line: 0, vars: { total: 0 }, note: 'total settes til 0.' },
            { line: 1, vars: { total: 0, i: 0 }, note: 'Løkken starter, i = 0.' },
            { line: 2, vars: { total: 0, i: 0 }, note: 'total = total + i → 0 + 0 = 0.' },
            { line: 1, vars: { total: 0, i: 1 }, note: 'Neste runde, i = 1.' },
            { line: 2, vars: { total: 1, i: 1 }, note: 'total = 0 + 1 = 1.' },
            { line: 1, vars: { total: 1, i: 2 }, note: 'Neste runde, i = 2.' },
            { line: 2, vars: { total: 3, i: 2 }, note: 'total = 1 + 2 = 3.' },
            { line: 1, vars: { total: 3, i: 3 }, note: 'Neste runde, i = 3.' },
            { line: 2, vars: { total: 6, i: 3 }, note: 'total = 3 + 3 = 6.' },
            { line: 1, vars: { total: 6, i: 4 }, note: 'Neste runde, i = 4.' },
            { line: 2, vars: { total: 10, i: 4 }, note: 'total = 6 + 4 = 10.' },
            { line: 1, vars: { total: 10, i: 4 }, note: 'range(5) er tom, løkken avsluttes.' },
            { line: 4, vars: { total: 10, i: 4 }, note: 'print(total) skriver ut resultatet.', output: '10' }
        ]
    },
    {
        id: 'if',
        title: 'If-setning',
        code: [
            'alder = 17',
            'if alder >= 18:',
            '    status = "voksen"',
            'else:',
            '    status = "mindreårig"',
            '',
            'print(status)'
        ],
        steps: [
            { line: 0, vars: { alder: 17 }, note: 'alder settes til 17.' },
            { line: 1, vars: { alder: 17 }, note: 'Sjekker: er 17 >= 18? Nei, betingelsen er False.' },
            { line: 4, vars: { alder: 17, status: '"mindreårig"' }, note: 'Går til else-grenen: status = "mindreårig".' },
            { line: 6, vars: { alder: 17, status: '"mindreårig"' }, note: 'print(status) skriver ut resultatet.', output: 'mindreårig' }
        ]
    },
    {
        id: 'function',
        title: 'Funksjonskall',
        code: [
            'def kvadrat(x):',
            '    return x * x',
            '',
            'tall = 5',
            'resultat = kvadrat(tall)',
            'print(resultat)'
        ],
        steps: [
            { line: 3, vars: { tall: 5 }, note: 'tall settes til 5 (i det globale scopet).', scope: 'global' },
            { line: 4, vars: { tall: 5 }, note: 'Vi kaller kvadrat(tall), altså kvadrat(5).', scope: 'global' },
            { line: 0, vars: { x: 5 }, note: 'Inne i funksjonen: x = 5 (eget scope, ser ikke "tall" direkte).', scope: 'kvadrat()' },
            { line: 1, vars: { x: 5 }, note: 'return x * x → returnerer 5 * 5 = 25.', scope: 'kvadrat()' },
            { line: 4, vars: { tall: 5, resultat: 25 }, note: 'Tilbake i det globale scopet: resultat = 25.', scope: 'global' },
            { line: 5, vars: { tall: 5, resultat: 25 }, note: 'print(resultat) skriver ut resultatet.', output: '25', scope: 'global' }
        ]
    }
];

export function VariableTracer() {
    const [snippetId, setSnippetId] = useState('loop');
    const [stepIndex, setStepIndex] = useState(0);

    const snippet = useMemo(() => SNIPPETS.find(s => s.id === snippetId)!, [snippetId]);
    const step = snippet.steps[stepIndex];
    const outputs = snippet.steps.slice(0, stepIndex + 1).map(s => s.output).filter(Boolean) as string[];

    const selectSnippet = (id: string) => {
        setSnippetId(id);
        setStepIndex(0);
    };

    const next = () => setStepIndex(i => Math.min(i + 1, snippet.steps.length - 1));
    const prev = () => setStepIndex(i => Math.max(i - 1, 0));
    const reset = () => setStepIndex(0);

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Code2 className="text-primary w-8 h-8" />
                            Variabel-tracker
                        </h2>
                        <p className="text-gray-400">Se hvordan variabler endrer seg linje for linje i Python-kode (IN1000).</p>
                    </div>

                    <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl p-1">
                        {SNIPPETS.map(s => (
                            <button
                                key={s.id}
                                onClick={() => selectSnippet(s.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${snippetId === s.id ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {s.title}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Kode med highlight */}
                    <div className="bg-black/30 rounded-2xl p-4 font-mono text-sm overflow-x-auto border border-white/5">
                        {snippet.code.map((line, idx) => (
                            <div
                                key={idx}
                                className={`px-3 py-1 rounded-lg transition-colors whitespace-pre ${idx === step.line ? 'bg-primary/20 text-white border border-primary/40' : 'text-gray-400'
                                    }`}
                            >
                                <span className="text-gray-600 select-none mr-3">{idx + 1}</span>
                                {line || ' '}
                            </div>
                        ))}
                    </div>

                    {/* Variabeltabell + output */}
                    <div className="space-y-4">
                        <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Variabler</h4>
                                {step.scope && (
                                    <span className="text-[10px] px-2 py-1 rounded-md bg-secondary/20 text-secondary font-mono">
                                        scope: {step.scope}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <AnimatePresence mode="popLayout">
                                    {Object.entries(step.vars).map(([name, value]) => (
                                        <motion.div
                                            layout
                                            key={name}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center justify-between bg-surface-light/50 rounded-lg px-3 py-2"
                                        >
                                            <span className="text-primary font-mono font-bold">{name}</span>
                                            <span className="text-white font-mono">{String(value)}</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                                <Terminal className="w-3.5 h-3.5" /> Konsoll
                            </h4>
                            <div className="font-mono text-sm text-green-400 min-h-[24px] space-y-1">
                                {outputs.length === 0 && <span className="text-gray-600">// ingen output ennå</span>}
                                {outputs.map((o, i) => <div key={i}>{o}</div>)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forklaring for gjeldende steg */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-primary font-medium flex items-center gap-3">
                    <Info className="w-5 h-5 flex-shrink-0" />
                    {step.note}
                </div>

                {/* Kontroller */}
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-gray-500 font-mono">
                        Steg {stepIndex + 1} / {snippet.steps.length}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={prev}
                            disabled={stepIndex === 0}
                            className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Forrige
                        </button>
                        <button
                            onClick={reset}
                            className="bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-2 rounded-xl transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={next}
                            disabled={stepIndex === snippet.steps.length - 1}
                            className="bg-primary hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                        >
                            Neste <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-surface/30 border border-white/10 rounded-2xl p-6 space-y-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Hvorfor spore variabler?
                </h3>
                <p className="text-gray-400 leading-relaxed">
                    En av de vanligste feilkildene i IN1000 er å miste oversikten over hva en variabel faktisk inneholder
                    på et gitt tidspunkt i koden. Ved å gå steg for steg gjennom løkker, betingelser og funksjonskall
                    bygger du en mental modell av hvordan Python faktisk kjører koden din — det samme du ville gjort
                    med en debugger.
                </p>
            </div>
        </div>
    );
}

