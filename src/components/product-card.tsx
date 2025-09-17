import { Product } from "@prisma/client";
import { getBrandColorClass, formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  brandColor?: string;
}

export function ProductCard({ product, brandColor }: ProductCardProps) {
  return (
    <div className="flex flex-col gap-3 cursor-pointer" key={product.id}>
      <div className="aspect-square overflow-hidden rounded-lg">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`h-full w-full ${getBrandColorClass(
              brandColor
            )} flex items-center justify-center`}
          >
            <span className="text-white font-medium text-lg">
              {product.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground line-clamp-2">
          {product.name}
        </h3>
        <p className="text-lg font-semibold text-foreground">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}
