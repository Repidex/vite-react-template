import { Link } from "react-router-dom";

const products = [
  { id: 1, name: "Gold Necklace" },
  { id: 2, name: "Diamond Ring" },
  { id: 3, name: "Bridal Bangles" },
];

const Shop = () => {
  return (
    <div>
      <h1>Shop Jewellery</h1>

      <div className="product-grid">
        {products.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="product-card">
            {p.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Shop;
