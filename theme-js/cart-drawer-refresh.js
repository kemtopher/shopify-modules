export async function refreshCartSections(sectionIds = ['cart-drawer', 'cart-icon-bubble']) {
  const params = new URLSearchParams({
    sections: sectionIds.join(','),
    sections_url: window.location.pathname,
  });

  const response = await fetch(`/?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to refresh cart sections.');
  }

  const sections = await response.json();

  sectionIds.forEach((id) => {
    const el = document.getElementById(`shopify-section-${id}`);
    if (el && sections[id]) {
      el.innerHTML = sections[id];
    }
  });

  return sections;
}
