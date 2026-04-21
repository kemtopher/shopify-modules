export async function addToCart({ variantId, quantity = 1, properties = {} }) {
  const response = await fetch(`${window.Shopify?.routes?.root || '/'}cart/add.js`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      items: [
        {
          id: variantId,
          quantity,
          properties,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.description || data?.message || 'Unable to add item to cart.';
    throw new Error(message);
  }

  return data;
}
