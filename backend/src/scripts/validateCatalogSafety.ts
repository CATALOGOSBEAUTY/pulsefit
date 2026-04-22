import { catalogCategorySeeds, masterCatalogProducts } from '../catalog/masterCatalog.js';
import { assertUnique } from './catalogCli.js';

function assert(condition: unknown, message: string, errors: string[]) {
  if (!condition) errors.push(message);
}

async function main() {
  const errors: string[] = [];
  const categorySlugs = new Set(catalogCategorySeeds.map((category) => category.slug));

  try {
    assertUnique(catalogCategorySeeds.map((category) => category.slug), 'Categoria');
    assertUnique(masterCatalogProducts.map((product) => product.slug), 'Produto');
  } catch (error: any) {
    errors.push(error.message);
  }

  for (const category of catalogCategorySeeds) {
    if (category.parentSlug) {
      assert(categorySlugs.has(category.parentSlug), `Categoria pai ausente para ${category.slug}: ${category.parentSlug}`, errors);
    }
  }

  for (const product of masterCatalogProducts) {
    assert(categorySlugs.has(product.categorySlug), `Produto ${product.slug} aponta para categoria inexistente: ${product.categorySlug}`, errors);
    assert(categorySlugs.has(product.subcategorySlug), `Produto ${product.slug} aponta para subcategoria inexistente: ${product.subcategorySlug}`, errors);
    assert(product.title.trim().length > 2, `Produto ${product.slug} sem titulo valido`, errors);
    assert(product.description.trim().length > 10, `Produto ${product.slug} sem descricao suficiente`, errors);
    assert(product.imagePrompt.trim().length > 40, `Produto ${product.slug} sem prompt de imagem suficiente`, errors);
    assert(product.catalogStatus === 'draft', `Seed ${product.slug} deve iniciar como draft`, errors);
    assert(product.isActive === false, `Seed ${product.slug} deve iniciar como inativo`, errors);
    assert(product.price === 0, `Seed ${product.slug} deve iniciar sem preco real`, errors);
  }

  if (errors.length > 0) {
    process.stderr.write(`Catalogo inseguro:\n- ${errors.join('\n- ')}\n`);
    process.exit(1);
  }

  const counts = masterCatalogProducts.reduce<Record<string, number>>((acc, product) => {
    acc[product.audience] = (acc[product.audience] ?? 0) + 1;
    return acc;
  }, {});

  process.stdout.write([
    'Catalogo validado com travas seguras.',
    `Categorias: ${catalogCategorySeeds.length}`,
    `Produtos: ${masterCatalogProducts.length}`,
    `Feminino: ${counts.feminino ?? 0}`,
    `Masculino: ${counts.masculino ?? 0}`,
    `Suplementos: ${counts.suplemento ?? 0}`,
  ].join('\n'));
  process.stdout.write('\n');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
