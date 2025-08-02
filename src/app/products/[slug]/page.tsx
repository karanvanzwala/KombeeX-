import { GET_PRODUCT_DETAILS } from "../../../../graphql/GET_PRODUCT_DETAILS";
import client from "../../../../lib/apollo-client";
import ProductDetailsClient from "./ProductDetailsClient";

interface ProductDetailsPageProps {
  params: {
    slug: string;
  };
}

async function getProductDetails(slug: string) {
  try {
    const { data } = await client.query({
      query: GET_PRODUCT_DETAILS,
      variables: {
        slug: "2-ctw-emerald-lab-grown-diamond-eternity-band-3mm-width",
        channel: "online-inr",
      },
    });
    return data.product;
  } catch (error) {
    console.error("Error fetching product details:", error);
    return null;
  }
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const product = await getProductDetails(params.slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-600">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return <ProductDetailsClient product={product} />;
}
