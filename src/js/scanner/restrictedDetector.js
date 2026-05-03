function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function detect(product, { categories, keywords }) {
  const tags = [
    ...(product.categoryTags ?? []),
    ...(product.labelTags ?? [])
  ]
  for (const tag of tags) {
    if (categories[tag]) {
      return { restricted: true, reason: categories[tag] }
    }
  }

  const name = (product.name ?? '').toLowerCase()
  for (const keyword of keywords) {
    const re = new RegExp(`\\b${escapeRegex(keyword.toLowerCase())}\\b`, 'i')
    if (re.test(name)) {
      return { restricted: true, reason: `Matched keyword: ${keyword}` }
    }
  }

  return { restricted: false, reason: null }
}
