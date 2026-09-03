import { useMemo, useState } from 'react';
import { Binary, Info, RefreshCw } from 'lucide-react';

function clampInt(value: number, bits: number) {
    const max = 2 ** bits;
    return ((value % max) + max) % max;
}

function toBinary(value: number, bits: number) {
    return clampInt(value, bits).toString(2).padStart(bits, '0');
}

function twosComplementValue(bits: string) {
    const n = bits.length;
    const unsigned = parseInt(bits, 2);
    const signBit = bits[0];
    return signBit === '1' ? unsigned - 2 ** n : unsigned;
}

export function NumberSystemLab() {
    const [decimal, setDecimal] = useState<string>('42');
    const [bitWidth, setBitWidth] = useState<8 | 16>(8);

    const parsed = useMemo(() => {
        const n = parseInt(decimal, 10);
        return Number.isFinite(n) ? n : 0;
    }, [decimal]);

    const unsignedBits = toBinary(parsed, bitWidth);
    const hex = clampInt(parsed, bitWidth).toString(16).toUpperCase().padStart(bitWidth / 4, '0');

    const isNegativeInput = parsed < 0;
    const twosComplementBits = toBinary(parsed, bitWidth);
    const decodedFromTwos = twosComplementValue(twosComplementBits);

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Binary className="text-primary w-8 h-8" />
                        Tallrepresentasjon
                    </h2>
                    <p className="text-gray-400">Konverter mellom desimal, binær og heksadesimal, og se hvordan totallskomplement fungerer (IN1020).</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Desimaltall</label>
                        <input
                            type="number"
                            value={decimal}
                            onChange={(e) => setDecimal(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-mono outline-none focus:border-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Bit-bredde</label>
                        <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl p-1">
                            {[8, 16].map((w) => (
                                <button
                                    key={w}
                                    onClick={() => setBitWidth(w as 8 | 16)}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${bitWidth === w ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {w}-bit
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Gyldig område ({bitWidth}-bit signert)</label>
                        <div className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-400 font-mono text-sm">
                            {-(2 ** (bitWidth - 1))} … {2 ** (bitWidth - 1) - 1}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Binær (usignert bitmønster)</div>
                        <div className="font-mono text-lg text-primary break-all">
                            {unsignedBits.match(/.{1,4}/g)?.join(' ')}
                        </div>
                    </div>
                    <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Heksadesimal</div>
                        <div className="font-mono text-lg text-secondary">0x{hex}</div>
                    </div>
                    <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Tolket som totallskomplement</div>
                        <div className="font-mono text-lg text-accent">{decodedFromTwos}</div>
                    </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-primary text-sm leading-relaxed flex items-start gap-3">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                        {isNegativeInput
                            ? `${parsed} er negativt, så bitmønsteret over er allerede totallskomplement-representasjonen for ${bitWidth}-bit — det starter derfor med et 1-tall (fortegnsbiten).`
                            : `${parsed} er positivt, så usignert og totallskomplement-tolkning gir samme verdi så lenge tallet passer innenfor ${bitWidth - 1} biter.`}
                    </span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-surface/30 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-primary" />
                        Hvordan lages totallskomplement?
                    </h3>
                    <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
                        <li>Skriv tallet i vanlig binær (positiv versjon).</li>
                        <li>Inverter alle bitene (0 → 1, 1 → 0).</li>
                        <li>Legg til 1.</li>
                    </ol>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Fordelen med totallskomplement er at addisjon og subtraksjon fungerer med samme kretslogikk
                        (samme adderer) uansett fortegn — CPU-en trenger ikke en egen krets for negative tall.
                    </p>
                </div>

                <div className="bg-surface/30 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Info className="w-5 h-5 text-secondary" />
                        Hvorfor er dette pensum i IN1020?
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        IN1020 handler om hva som faktisk skjer "under panseret" i en datamaskin. Alt en CPU jobber med
                        er til syvende og sist bitmønstre — tallrepresentasjon, boolsk logikk og digitale kretser
                        henger direkte sammen med hvordan en prosessor er bygget opp.
                    </p>
                </div>
            </div>
        </div>
    );
}

