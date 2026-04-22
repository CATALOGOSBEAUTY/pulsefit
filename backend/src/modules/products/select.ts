export function productSelect() {
  return '*, category:categories!products_category_id_fkey(id,name,slug,parent_id), subcategory:categories!products_subcategory_id_fkey(id,name,slug,parent_id), product_images(id,url,name,sort_order)';
}
