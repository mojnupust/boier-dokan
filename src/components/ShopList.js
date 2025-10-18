import Link from 'next/link';

const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length > 1) {
        return (words[0][0] + (words[words.length - 1][0] || '')).toUpperCase();
    }
    if (words[0]) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return '?';
};

export default function ShopList({ shop }) {
    const s = shop; // using 's' to match the provided snippet

    return (
        <Link
            key={s.id ?? s.slug}
            href={`/shop/${s.slug}`}
            className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 rounded-2xl"
        >
            <div className="relative h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5">
                {/* official badge */}
                {s.is_official ? (
                    <span className="absolute right-3 top-3 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold px-2 py-0.5 border border-amber-200">Official</span>
                ) : null}

                {/* header */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold shadow-sm">
                        {getInitials(s.name)}
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-gray-800">
                            {s.name ?? 'Shop'}
                        </h3>
                        {s.slug ? (
                            <p className="text-xs text-gray-500">/{s.slug}</p>
                        ) : null}
                    </div>
                </div>

                {/* body */}
                {s.description ? (
                    <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                        {s.description}
                    </p>
                ) : (
                    <p className="mt-3 text-sm text-gray-500">দোকানে ক্লিক করে বই দেখুন</p>
                )}

                {/* footer */}
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400">আরও দেখুন</span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors group-hover:bg-blue-700">
                        দোকানে যান
                        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10H3a1 1 0 110-2h10.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </span>
                </div>
            </div>
        </Link>
    );
}