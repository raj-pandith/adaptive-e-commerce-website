import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
    return (
        <Link
            to={`/product/${product.id}`}
            className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
        >
            {/* Image placeholder */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {/* <span className="text-gray-400 text-lg">Image</span> */}
                <img src={product.image} alt="" />
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 line-clamp-2">
                    {product.name}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="text-xl font-bold text-green-600">
                        ₹{product.suggestedPrice?.toFixed(2) || product.originalPrice?.toFixed(2)}
                    </span>

                    {product.discountPercent > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 line-through">
                                ₹{product.originalPrice.toFixed(2)}
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {product.discountPercent}% off
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}