import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const containerRef = useRef(null);

    // 🔥 Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowResults(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 🔍 Search API
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }

        const timer = setTimeout(() => {
            setLoading(true);
            axios
                .get("http://localhost:8080/api/search", {
                    params: {
                        query: query.trim(),
                        limit: 6,
                        userId: 1,
                    },
                })
                .then((res) => {
                    setResults(res.data);
                    setShowResults(true);
                })
                .catch(() => setResults([]))
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
            {/* Search Input */}
            <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm overflow-hidden">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowResults(true)}
                    placeholder="Search products (e.g. backpack, earbuds...)"
                    className="flex-grow px-5 py-3 outline-none text-gray-800"
                />
                <button className="p-3 text-gray-500">
                    <Search size={20} />
                </button>
            </div>

            {/* Results */}
            {showResults && (
                <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                    {loading ? (
                        <div className="p-6 text-center text-gray-500">Searching...</div>
                    ) : results.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No products found for "{query}"
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {results.map((p) => (
                                <Link
                                    key={p.id}
                                    to={`/product/${p.id}`}
                                    className="flex items-center gap-4 p-4 hover:bg-gray-50"
                                    onClick={() => {
                                        setQuery("");
                                        setShowResults(false);
                                    }}
                                >
                                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                        <span className="text-xs text-gray-400">Img</span>
                                    </div>

                                    {/* <div>
                                        <h4 className="font-medium text-black">{p.name}</h4>
                                        <span className="text-green-600 font-bold">
                                            ₹{Number(p.suggestedPrice).toFixed(2)}
                                        </span>
                                    </div> */}
                                    {/* Small image placeholder */}
                                    {/* <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs text-gray-400">Img</span>
                                    </div> */}

                                    <div className="flex-grow">
                                        <h4 className="font-medium text-gray-900">{p.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-lg font-bold text-green-600">
                                                ₹{p.suggestedPrice?.toFixed(2)}
                                            </span>
                                            {p.discountPercent > 0 && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                    {p.discountPercent}% off
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
