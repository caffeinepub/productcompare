# ProductCompare

## Current State
New project. No existing backend or frontend code.

## Requested Changes (Diff)

### Add
- Product catalog with multiple products, each having a name, description, price, and a list of features
- Product variants per product (e.g. different tiers, sizes, or editions) with their own pricing and feature sets
- Product detail view showing full feature list for a selected product
- Side-by-side comparison view to compare variants of a product across features
- Admin-style ability to add/edit/delete products and their variants

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend (Motoko):
   - Data model: Product (id, name, description, category, imageUrl), Variant (id, productId, name, price, features: [Feature]), Feature (name, value, included: Bool)
   - CRUD operations for products and variants
   - Query to get all variants for a product
   - Seed sample data with 2-3 products and multiple variants each

2. Frontend:
   - Home/catalog page: grid of product cards with name, description, and a "Compare" CTA
   - Product detail page: shows product info and lists all variants with their features
   - Comparison page/modal: side-by-side table of selected variants, rows = features, columns = variants with checkmarks or values
   - Navigation between catalog, detail, and comparison views
   - Responsive layout
