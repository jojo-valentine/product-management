const ProductSkeleton = () => {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {Array.from({ length: 4 }).map((_, i) => (
            <th key={i} className="px-4 py-2 text-left">
              <div className="h-4 w-24 bg-neutral-200 animate-pulse rounded" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <td key={colIndex} className="px-4 py-2">
                <div className="h-4 w-full bg-neutral-200 animate-pulse rounded" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
ProductSkeleton.displayName = "ProductSkeleton";

export { ProductSkeleton };
