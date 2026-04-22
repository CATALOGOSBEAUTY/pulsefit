export type Audience = 'feminino' | 'masculino' | 'suplemento';
export type CatalogStatus = 'draft' | 'ready' | 'live';

export interface CatalogCategorySeed {
  slug: string;
  name: string;
  parentSlug: string | null;
  sortOrder: number;
}

export interface CatalogProductSeed {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string;
  audience: Audience;
  productType: string;
  variation: string | null;
  features: string[];
  imagePrompt: string;
  price: number;
  stockQuantity: number;
  catalogStatus: CatalogStatus;
  isActive: boolean;
  isFeatured: boolean;
  isPromo: boolean;
  isNew: boolean;
}

const IMAGE_BASE =
  'catalogo profissional de e-commerce, fundo totalmente branco, iluminacao de estudio, produto centralizado, alta definicao, aparencia realista e comercial, sem texto, sem marca d agua, sem elementos extras, sem marcas famosas copiadas';

function apparelPrompt(title: string, audience: Exclude<Audience, 'suplemento'>, details: string[]) {
  return [
    `Foto de produto realista de moda fitness ${audience} do item ${title}`,
    details.join(', '),
    'tecido com aparencia premium, caimento comercial de loja, peca isolada',
    IMAGE_BASE,
  ].join(', ');
}

function footwearPrompt(title: string, audience: Exclude<Audience, 'suplemento'>, details: string[]) {
  return [
    `Foto de catalogo realista do calcado ${title} para publico ${audience}`,
    'par de tenis centralizado, visual esportivo comercial, materiais nítidos',
    details.join(', '),
    IMAGE_BASE,
  ].join(', ');
}

function accessoryPrompt(title: string, audience: Exclude<Audience, 'suplemento'> | 'unissex', details: string[]) {
  return [
    `Foto de produto realista do acessorio fitness ${title} para publico ${audience}`,
    'detalhes claramente visiveis, produto isolado, recorte limpo',
    details.join(', '),
    IMAGE_BASE,
  ].join(', ');
}

function supplementPrompt(title: string, pack: string, details: string[]) {
  return [
    `Foto de produto realista do suplemento ${title}`,
    `embalagem ${pack} com rotulo generico premium e limpo`,
    details.join(', '),
    'aparencia comercial profissional de suplemento',
    IMAGE_BASE,
  ].join(', ');
}

function baseProduct(input: Omit<CatalogProductSeed, 'price' | 'stockQuantity' | 'catalogStatus' | 'isActive' | 'isFeatured' | 'isPromo' | 'isNew'>): CatalogProductSeed {
  return {
    ...input,
    price: 0,
    stockQuantity: 0,
    catalogStatus: 'draft',
    isActive: false,
    isFeatured: false,
    isPromo: false,
    isNew: false,
  };
}

function apparelProduct(input: {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string;
  audience: 'feminino' | 'masculino';
  productType: string;
  variation?: string | null;
  features: string[];
}) {
  return baseProduct({
    ...input,
    variation: input.variation ?? null,
    imagePrompt: apparelPrompt(input.title, input.audience, input.features),
  });
}

function footwearProduct(input: {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string;
  audience: 'feminino' | 'masculino';
  productType: string;
  variation?: string | null;
  features: string[];
}) {
  return baseProduct({
    ...input,
    variation: input.variation ?? null,
    imagePrompt: footwearPrompt(input.title, input.audience, input.features),
  });
}

function accessoryProduct(input: {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string;
  audience: 'feminino' | 'masculino' | 'suplemento';
  productType: string;
  variation?: string | null;
  features: string[];
}) {
  return baseProduct({
    ...input,
    variation: input.variation ?? null,
    imagePrompt: accessoryPrompt(input.title, input.audience === 'suplemento' ? 'unissex' : input.audience, input.features),
  });
}

function supplementProduct(input: {
  slug: string;
  title: string;
  description: string;
  subcategorySlug: string;
  productType: string;
  variation?: string | null;
  features: string[];
  pack: string;
}) {
  return baseProduct({
    slug: input.slug,
    title: input.title,
    description: input.description,
    categorySlug: 'suplementos',
    subcategorySlug: input.subcategorySlug,
    audience: 'suplemento',
    productType: input.productType,
    variation: input.variation ?? null,
    features: input.features,
    imagePrompt: supplementPrompt(input.title, input.pack, input.features),
  });
}

export const catalogCategorySeeds: CatalogCategorySeed[] = [
  { slug: 'feminina', name: 'Feminina', parentSlug: null, sortOrder: 10 },
  { slug: 'masculina', name: 'Masculina', parentSlug: null, sortOrder: 20 },
  { slug: 'suplementos', name: 'Suplementos', parentSlug: null, sortOrder: 30 },

  { slug: 'feminina-tops-esportivos', name: 'Tops Esportivos', parentSlug: 'feminina', sortOrder: 10 },
  { slug: 'feminina-camisetas-regatas-croppeds', name: 'Camisetas, Regatas e Croppeds', parentSlug: 'feminina', sortOrder: 20 },
  { slug: 'feminina-leggings-calcas', name: 'Leggings e Calcas', parentSlug: 'feminina', sortOrder: 30 },
  { slug: 'feminina-shorts-bermudas', name: 'Shorts e Bermudas', parentSlug: 'feminina', sortOrder: 40 },
  { slug: 'feminina-pecas-unicas-conjuntos', name: 'Pecas Unicas e Conjuntos', parentSlug: 'feminina', sortOrder: 50 },
  { slug: 'feminina-casacos-esportivos', name: 'Casacos Esportivos', parentSlug: 'feminina', sortOrder: 60 },
  { slug: 'feminina-calcados', name: 'Calcados Femininos', parentSlug: 'feminina', sortOrder: 70 },
  { slug: 'feminina-acessorios', name: 'Acessorios Femininos', parentSlug: 'feminina', sortOrder: 80 },

  { slug: 'masculina-camisetas-regatas', name: 'Camisetas e Regatas', parentSlug: 'masculina', sortOrder: 10 },
  { slug: 'masculina-bermudas-shorts', name: 'Bermudas e Shorts', parentSlug: 'masculina', sortOrder: 20 },
  { slug: 'masculina-calcas-esportivas', name: 'Calcas Esportivas', parentSlug: 'masculina', sortOrder: 30 },
  { slug: 'masculina-casacos-esportivos', name: 'Casacos Esportivos', parentSlug: 'masculina', sortOrder: 40 },
  { slug: 'masculina-calcados', name: 'Calcados Masculinos', parentSlug: 'masculina', sortOrder: 50 },
  { slug: 'masculina-acessorios', name: 'Acessorios Masculinos', parentSlug: 'masculina', sortOrder: 60 },

  { slug: 'suplementos-proteinas', name: 'Proteinas', parentSlug: 'suplementos', sortOrder: 10 },
  { slug: 'suplementos-aminoacidos', name: 'Aminoacidos', parentSlug: 'suplementos', sortOrder: 20 },
  { slug: 'suplementos-pre-treinos-energia', name: 'Pre-treinos e Energia', parentSlug: 'suplementos', sortOrder: 30 },
  { slug: 'suplementos-termogenicos-emagrecimento', name: 'Emagrecedores e Termogenicos', parentSlug: 'suplementos', sortOrder: 40 },
  { slug: 'suplementos-carboidratos-hipercaloricos', name: 'Carboidratos e Hipercaloricos', parentSlug: 'suplementos', sortOrder: 50 },
  { slug: 'suplementos-vitaminas-minerais-bem-estar', name: 'Vitaminas, Minerais e Bem-estar', parentSlug: 'suplementos', sortOrder: 60 },
  { slug: 'suplementos-alimentos-snacks-fit', name: 'Alimentos e Snacks Fit', parentSlug: 'suplementos', sortOrder: 70 },
];

const femaleProducts: CatalogProductSeed[] = [
  apparelProduct({ slug: 'top-esportivo-alta-sustentacao', title: 'Top esportivo alta sustentacao', description: 'Top fitness feminino com sustentacao reforcada para treinos de impacto e performance.', categorySlug: 'feminina', subcategorySlug: 'feminina-tops-esportivos', audience: 'feminino', productType: 'top esportivo', variation: 'Alta sustentacao', features: ['sustentacao reforcada', 'tecido firme de alta compressao', 'base larga para maior estabilidade'] }),
  apparelProduct({ slug: 'top-esportivo-media-sustentacao', title: 'Top esportivo media sustentacao', description: 'Top fitness feminino de media sustentacao para treinos funcionais e uso diario.', categorySlug: 'feminina', subcategorySlug: 'feminina-tops-esportivos', audience: 'feminino', productType: 'top esportivo', variation: 'Media sustentacao', features: ['suporte equilibrado', 'elasticidade confortavel', 'acabamento anatomico'] }),
  apparelProduct({ slug: 'top-esportivo-baixa-sustentacao', title: 'Top esportivo baixa sustentacao', description: 'Top fitness feminino leve para yoga, pilates e rotinas de baixo impacto.', categorySlug: 'feminina', subcategorySlug: 'feminina-tops-esportivos', audience: 'feminino', productType: 'top esportivo', variation: 'Baixa sustentacao', features: ['toque macio', 'estrutura leve', 'uso em treinos suaves'] }),
  apparelProduct({ slug: 'top-esportivo-com-bojo', title: 'Top esportivo com bojo', description: 'Top fitness feminino com bojo removivel e visual limpo de academia premium.', categorySlug: 'feminina', subcategorySlug: 'feminina-tops-esportivos', audience: 'feminino', productType: 'top esportivo', variation: 'Com bojo', features: ['bojo removivel', 'acabamento estruturado', 'modelagem firme'] }),
  apparelProduct({ slug: 'top-esportivo-sem-bojo', title: 'Top esportivo sem bojo', description: 'Top fitness feminino sem bojo para quem busca leveza e caimento natural.', categorySlug: 'feminina', subcategorySlug: 'feminina-tops-esportivos', audience: 'feminino', productType: 'top esportivo', variation: 'Sem bojo', features: ['caimento natural', 'forro leve', 'conforto para uso prolongado'] }),
  apparelProduct({ slug: 'top-esportivo-costas-nadador', title: 'Top esportivo costas nadador', description: 'Top fitness feminino com costas nadador para liberdade de movimento no treino.', categorySlug: 'feminina', subcategorySlug: 'feminina-tops-esportivos', audience: 'feminino', productType: 'top esportivo', variation: 'Costas nadador', features: ['costas estilo nadador', 'mobilidade ampla', 'visual esportivo tecnico'] }),
  apparelProduct({ slug: 'top-esportivo-tiras-cruzadas', title: 'Top esportivo tiras cruzadas', description: 'Top fitness feminino com tiras cruzadas e design premium para vitrine de catalogo.', categorySlug: 'feminina', subcategorySlug: 'feminina-tops-esportivos', audience: 'feminino', productType: 'top esportivo', variation: 'Tiras cruzadas', features: ['alcas cruzadas', 'detalhe visual sofisticado', 'sustentacao com estilo'] }),
  apparelProduct({ slug: 'top-esportivo-assimetrico', title: 'Top esportivo assimetrico', description: 'Top fitness feminino assimetrico com recorte moderno e apelo fashion esportivo.', categorySlug: 'feminina', subcategorySlug: 'feminina-tops-esportivos', audience: 'feminino', productType: 'top esportivo', variation: 'Assimetrico', features: ['recorte moderno', 'design fashion fitness', 'acabamento minimalista'] }),

  apparelProduct({ slug: 'camiseta-dry-fit-poliamida-feminina', title: 'Camiseta dry-fit poliamida feminina', description: 'Camiseta feminina de treino em tecido dry-fit com toque leve e secagem rapida.', categorySlug: 'feminina', subcategorySlug: 'feminina-camisetas-regatas-croppeds', audience: 'feminino', productType: 'camiseta esportiva', variation: 'Dry-fit / Poliamida', features: ['tecido dry-fit', 'toque macio', 'respirabilidade para treino'] }),
  apparelProduct({ slug: 'cropped-manga-curta-feminino', title: 'Cropped manga curta feminino', description: 'Cropped feminino esportivo de manga curta com visual contemporaneo de academia.', categorySlug: 'feminina', subcategorySlug: 'feminina-camisetas-regatas-croppeds', audience: 'feminino', productType: 'cropped esportivo', variation: 'Manga curta', features: ['comprimento cropped', 'manga curta', 'caimento esportivo atual'] }),
  apparelProduct({ slug: 'cropped-manga-longa-feminino', title: 'Cropped manga longa feminino', description: 'Cropped feminino esportivo de manga longa para treinos com cobertura extra.', categorySlug: 'feminina', subcategorySlug: 'feminina-camisetas-regatas-croppeds', audience: 'feminino', productType: 'cropped esportivo', variation: 'Manga longa', features: ['manga longa', 'silhueta ajustada', 'uso em dias amenos'] }),
  apparelProduct({ slug: 'cropped-regata-feminino', title: 'Cropped regata feminino', description: 'Cropped regata feminino com proposta leve e visual de moda fitness comercial.', categorySlug: 'feminina', subcategorySlug: 'feminina-camisetas-regatas-croppeds', audience: 'feminino', productType: 'cropped regata', variation: 'Regata', features: ['regata cropped', 'leveza para treinar', 'visual moderno'] }),
  apparelProduct({ slug: 'regata-cavada-feminina', title: 'Regata cavada feminina', description: 'Regata feminina cavada com cava ampla e estilo de treino respiravel.', categorySlug: 'feminina', subcategorySlug: 'feminina-camisetas-regatas-croppeds', audience: 'feminino', productType: 'regata esportiva', variation: 'Cavada', features: ['cava ampla', 'caimento soltinho', 'ideal para musculacao'] }),
  apparelProduct({ slug: 'regata-nadador-feminina', title: 'Regata nadador feminina', description: 'Regata feminina com costas nadador e modelagem esportiva versatil.', categorySlug: 'feminina', subcategorySlug: 'feminina-camisetas-regatas-croppeds', audience: 'feminino', productType: 'regata esportiva', variation: 'Costas nadador', features: ['costas nadador', 'mobilidade total', 'tecido leve'] }),
  apparelProduct({ slug: 'regata-respiravel-feminina', title: 'Regata respiravel feminina', description: 'Regata feminina em tela respiravel para treinos quentes e alta ventilacao.', categorySlug: 'feminina', subcategorySlug: 'feminina-camisetas-regatas-croppeds', audience: 'feminino', productType: 'regata esportiva', variation: 'Tela respiravel', features: ['painel respiravel', 'ventilacao elevada', 'leveza no uso'] }),
  apparelProduct({ slug: 'camiseta-compressao-termica-feminina', title: 'Camiseta compressao termica feminina', description: 'Camiseta feminina de compressao termica para performance e base layer de treino.', categorySlug: 'feminina', subcategorySlug: 'feminina-camisetas-regatas-croppeds', audience: 'feminino', productType: 'camiseta de compressao', variation: 'Compressao / Termica', features: ['compressao suave', 'manga ajustada', 'efeito termico leve'] }),

  apparelProduct({ slug: 'legging-cintura-alta-feminina', title: 'Legging cintura alta feminina', description: 'Legging feminina cintura alta com visual limpo e seguranca para treino.', categorySlug: 'feminina', subcategorySlug: 'feminina-leggings-calcas', audience: 'feminino', productType: 'legging', variation: 'Cintura alta', features: ['cintura alta', 'compressao moderada', 'caimento anatomico'] }),
  apparelProduct({ slug: 'legging-cos-v-feminina', title: 'Legging cos em V feminina', description: 'Legging feminina com cos em V para valorizar a silhueta na linha fitness.', categorySlug: 'feminina', subcategorySlug: 'feminina-leggings-calcas', audience: 'feminino', productType: 'legging', variation: 'Cos em V', features: ['cos em V', 'modelagem valorizadora', 'acabamento premium'] }),
  apparelProduct({ slug: 'legging-scrunch-feminina', title: 'Legging scrunch feminina', description: 'Legging feminina com detalhe scrunch para efeito empina bumbum comercial.', categorySlug: 'feminina', subcategorySlug: 'feminina-leggings-calcas', audience: 'feminino', productType: 'legging', variation: 'Scrunch', features: ['efeito scrunch traseiro', 'cintura firme', 'tecido flexivel'] }),
  apparelProduct({ slug: 'legging-sem-costura-feminina', title: 'Legging sem costura feminina', description: 'Legging feminina seamless com visual moderno e conforto elevado.', categorySlug: 'feminina', subcategorySlug: 'feminina-leggings-calcas', audience: 'feminino', productType: 'legging', variation: 'Sem costura', features: ['construcao seamless', 'elasticidade elevada', 'acabamento limpo'] }),
  apparelProduct({ slug: 'legging-com-bolso-lateral-feminina', title: 'Legging com bolso lateral feminina', description: 'Legging feminina com bolso lateral funcional para treino e rotina.', categorySlug: 'feminina', subcategorySlug: 'feminina-leggings-calcas', audience: 'feminino', productType: 'legging', variation: 'Bolso lateral', features: ['bolso lateral util', 'cintura alta', 'tecido firme'] }),
  apparelProduct({ slug: 'calca-jogger-feminina', title: 'Calca jogger feminina', description: 'Calca jogger feminina esportiva com punho e visual casual de academia.', categorySlug: 'feminina', subcategorySlug: 'feminina-leggings-calcas', audience: 'feminino', productType: 'calca jogger', variation: null, features: ['modelagem jogger', 'punho ajustado', 'estilo athleisure'] }),
  apparelProduct({ slug: 'calca-moletom-feminina', title: 'Calca de moletom feminina', description: 'Calca feminina de moletom para deslocamento, aquecimento e lifestyle fitness.', categorySlug: 'feminina', subcategorySlug: 'feminina-leggings-calcas', audience: 'feminino', productType: 'calca de moletom', variation: null, features: ['malha de moletom', 'conforto casual', 'cintura elastica'] }),

  apparelProduct({ slug: 'short-ciclista-feminino', title: 'Short ciclista feminino', description: 'Short ciclista feminino com ajuste firme e proposta classica de treino.', categorySlug: 'feminina', subcategorySlug: 'feminina-shorts-bermudas', audience: 'feminino', productType: 'short ciclista', variation: null, features: ['comprimento ciclista', 'compressao moderada', 'cintura alta'] }),
  apparelProduct({ slug: 'short-duplo-feminino', title: 'Short duplo feminino', description: 'Short feminino com camada externa leve e compressao interna para performance.', categorySlug: 'feminina', subcategorySlug: 'feminina-shorts-bermudas', audience: 'feminino', productType: 'short duplo', variation: 'Compressao interna', features: ['duas camadas', 'forro compressivo', 'mobilidade para corrida'] }),
  apparelProduct({ slug: 'short-saia-esportivo-feminino', title: 'Short saia esportivo feminino', description: 'Short saia feminino esportivo com visual premium para treino e lifestyle.', categorySlug: 'feminina', subcategorySlug: 'feminina-shorts-bermudas', audience: 'feminino', productType: 'short saia', variation: null, features: ['saia com short interno', 'estetica feminina esportiva', 'movimento livre'] }),
  apparelProduct({ slug: 'short-microcurto-feminino', title: 'Short microcurto feminino', description: 'Short feminino microcurto com modelagem ajustada para treinos intensos.', categorySlug: 'feminina', subcategorySlug: 'feminina-shorts-bermudas', audience: 'feminino', productType: 'short esportivo', variation: 'Microcurto', features: ['comprimento reduzido', 'visual de performance', 'tecido elastico'] }),

  apparelProduct({ slug: 'macacao-longo-feminino', title: 'Macacao longo fitness feminino', description: 'Macacao longo feminino com visual de moda fitness premium e silhueta ajustada.', categorySlug: 'feminina', subcategorySlug: 'feminina-pecas-unicas-conjuntos', audience: 'feminino', productType: 'macacao fitness', variation: 'Longo', features: ['peca unica longa', 'ajuste ao corpo', 'visual sofisticado'] }),
  apparelProduct({ slug: 'macaquinho-curto-feminino', title: 'Macaquinho curto fitness feminino', description: 'Macaquinho curto feminino com proposta moderna para treino e vitrine.', categorySlug: 'feminina', subcategorySlug: 'feminina-pecas-unicas-conjuntos', audience: 'feminino', productType: 'macaquinho fitness', variation: 'Curto', features: ['peca unica curta', 'caimento ajustado', 'design funcional'] }),
  apparelProduct({ slug: 'conjunto-top-legging-feminino', title: 'Conjunto top e legging feminino', description: 'Conjunto fitness feminino completo com top e legging para vitrine coordenada.', categorySlug: 'feminina', subcategorySlug: 'feminina-pecas-unicas-conjuntos', audience: 'feminino', productType: 'conjunto fitness', variation: 'Top + Legging', features: ['look coordenado', 'top e legging combinando', 'estilo premium'] }),
  apparelProduct({ slug: 'conjunto-top-short-feminino', title: 'Conjunto top e short feminino', description: 'Conjunto fitness feminino com top e short para proposta leve de treino.', categorySlug: 'feminina', subcategorySlug: 'feminina-pecas-unicas-conjuntos', audience: 'feminino', productType: 'conjunto fitness', variation: 'Top + Short', features: ['look coordenado', 'top e short combinando', 'visual versatil'] }),
  apparelProduct({ slug: 'body-esportivo-feminino', title: 'Body esportivo feminino', description: 'Body fitness feminino com visual limpo e estrutura para composicao premium.', categorySlug: 'feminina', subcategorySlug: 'feminina-pecas-unicas-conjuntos', audience: 'feminino', productType: 'body esportivo', variation: null, features: ['peca unica ajustada', 'visual minimalista', 'base para treino e lifestyle'] }),

  apparelProduct({ slug: 'corta-vento-feminino', title: 'Corta-vento feminino', description: 'Jaqueta corta-vento feminina leve para aquecimento e deslocamento esportivo.', categorySlug: 'feminina', subcategorySlug: 'feminina-casacos-esportivos', audience: 'feminino', productType: 'corta-vento', variation: null, features: ['tecido leve', 'protege do vento', 'visual esportivo'] }),
  apparelProduct({ slug: 'jaqueta-esportiva-feminina', title: 'Jaqueta esportiva feminina', description: 'Jaqueta feminina esportiva leve para compor a linha de casacos fitness.', categorySlug: 'feminina', subcategorySlug: 'feminina-casacos-esportivos', audience: 'feminino', productType: 'jaqueta esportiva', variation: null, features: ['acabamento premium', 'estrutura leve', 'uso sobreposto'] }),
  apparelProduct({ slug: 'casaco-com-ziper-feminino', title: 'Casaco com ziper feminino', description: 'Casaco feminino com ziper frontal para academia e lifestyle esportivo.', categorySlug: 'feminina', subcategorySlug: 'feminina-casacos-esportivos', audience: 'feminino', productType: 'casaco esportivo', variation: 'Com ziper', features: ['ziper frontal', 'caimento confortavel', 'versatilidade no uso'] }),

  footwearProduct({ slug: 'tenis-treino-forca-feminino', title: 'Tenis de treino de forca feminino', description: 'Tenis feminino para treino de forca e musculacao com base estavel.', categorySlug: 'feminina', subcategorySlug: 'feminina-calcados', audience: 'feminino', productType: 'tenis de treino', variation: 'Forca / Musculacao', features: ['base estavel', 'cabedal esportivo', 'foco em apoio'] }),
  footwearProduct({ slug: 'tenis-corrida-feminino', title: 'Tenis de corrida feminino', description: 'Tenis feminino para corrida e esteira com visual leve e comercial.', categorySlug: 'feminina', subcategorySlug: 'feminina-calcados', audience: 'feminino', productType: 'tenis de corrida', variation: 'Corrida / Esteira', features: ['perfil mais leve', 'visual dinamico', 'solado esportivo'] }),

  accessoryProduct({ slug: 'bolsa-esportiva-feminina', title: 'Bolsa esportiva feminina', description: 'Bolsa feminina esportiva com capacidade pratica para academia.', categorySlug: 'feminina', subcategorySlug: 'feminina-acessorios', audience: 'feminino', productType: 'bolsa esportiva', features: ['alcas resistentes', 'espaco interno funcional', 'visual fitness premium'] }),
  accessoryProduct({ slug: 'mochila-fitness-feminina', title: 'Mochila fitness feminina', description: 'Mochila feminina esportiva para treino, rotina e deslocamento.', categorySlug: 'feminina', subcategorySlug: 'feminina-acessorios', audience: 'feminino', productType: 'mochila', features: ['compartimentos funcionais', 'alcas confortaveis', 'estilo esportivo'] }),
  accessoryProduct({ slug: 'luva-treino-feminina', title: 'Luva de treino feminina', description: 'Luva feminina para treino com pegada segura e visual de academia.', categorySlug: 'feminina', subcategorySlug: 'feminina-acessorios', audience: 'feminino', productType: 'luva de treino', features: ['palma reforcada', 'melhor pegada', 'acabamento esportivo'] }),
  accessoryProduct({ slug: 'grip-feminino', title: 'Grip feminino para treino', description: 'Grip feminino para treinos de barra e puxada com protecao da palma.', categorySlug: 'feminina', subcategorySlug: 'feminina-acessorios', audience: 'feminino', productType: 'grip', features: ['protecao da palma', 'uso em barra', 'design funcional'] }),
  accessoryProduct({ slug: 'meia-esportiva-feminina', title: 'Meia esportiva feminina', description: 'Meia feminina esportiva com ajuste confortavel para treino e rotina.', categorySlug: 'feminina', subcategorySlug: 'feminina-acessorios', audience: 'feminino', productType: 'meia esportiva', features: ['cano esportivo', 'toque confortavel', 'uso versatil'] }),
  accessoryProduct({ slug: 'munhequeira-feminina', title: 'Munhequeira feminina', description: 'Munhequeira feminina para suporte leve durante exercicios e treino funcional.', categorySlug: 'feminina', subcategorySlug: 'feminina-acessorios', audience: 'feminino', productType: 'munhequeira', features: ['suporte leve', 'ajuste com firmeza', 'uso fitness'] }),
  accessoryProduct({ slug: 'faixa-cabelo-feminina', title: 'Faixa de cabelo esportiva feminina', description: 'Faixa de cabelo feminina para treino com visual clean e funcional.', categorySlug: 'feminina', subcategorySlug: 'feminina-acessorios', audience: 'feminino', productType: 'faixa de cabelo', features: ['fixacao confortavel', 'visual minimalista', 'uso esportivo'] }),
  accessoryProduct({ slug: 'elastico-feminino', title: 'Elastico esportivo feminino', description: 'Elastico funcional feminino para treino e composicao de acessorios fitness.', categorySlug: 'feminina', subcategorySlug: 'feminina-acessorios', audience: 'feminino', productType: 'elastico', features: ['uso funcional', 'material elastico', 'acessorio de treino'] }),
  accessoryProduct({ slug: 'garrafa-feminina', title: 'Garrafa esportiva feminina', description: 'Garrafa feminina esportiva para hidratacao com visual premium.', categorySlug: 'feminina', subcategorySlug: 'feminina-acessorios', audience: 'feminino', productType: 'garrafa esportiva', features: ['corpo rigido', 'tampa pratica', 'uso em academia'] }),
  accessoryProduct({ slug: 'fortalecedor-pegada-feminino', title: 'Fortalecedor de pegada feminino', description: 'Fortalecedor de pegada feminino para treino de antebraco e forca manual.', categorySlug: 'feminina', subcategorySlug: 'feminina-acessorios', audience: 'feminino', productType: 'fortalecedor de pegada', features: ['resistencia manual', 'uso em pegada', 'tamanho compacto'] }),
];

const maleProducts: CatalogProductSeed[] = [
  apparelProduct({ slug: 'camiseta-dry-fit-poliamida-masculina', title: 'Camiseta dry-fit poliamida masculina', description: 'Camiseta masculina em tecido dry-fit para treino com visual esportivo premium.', categorySlug: 'masculina', subcategorySlug: 'masculina-camisetas-regatas', audience: 'masculino', productType: 'camiseta esportiva', variation: 'Dry-fit / Poliamida', features: ['tecido dry-fit', 'secagem rapida', 'caimento esportivo'] }),
  apparelProduct({ slug: 'camiseta-oversized-treino-masculina', title: 'Camiseta oversized de treino masculina', description: 'Camiseta masculina oversized para treino com visual forte de academia.', categorySlug: 'masculina', subcategorySlug: 'masculina-camisetas-regatas', audience: 'masculino', productType: 'camiseta oversized', variation: null, features: ['modelagem ampla', 'estilo contemporaneo', 'tecido leve'] }),
  apparelProduct({ slug: 'regata-machao-masculina', title: 'Regata machao masculina', description: 'Regata masculina cavada para treino com proposta classica de musculacao.', categorySlug: 'masculina', subcategorySlug: 'masculina-camisetas-regatas', audience: 'masculino', productType: 'regata esportiva', variation: 'Machao', features: ['cava ampla', 'mobilidade nos bracos', 'visual de academia'] }),
  apparelProduct({ slug: 'regata-super-cavada-masculina', title: 'Regata super cavada masculina', description: 'Regata masculina super cavada para vitrine de fisiculturismo e treino pesado.', categorySlug: 'masculina', subcategorySlug: 'masculina-camisetas-regatas', audience: 'masculino', productType: 'regata esportiva', variation: 'Super cavada', features: ['cava extrema', 'visual fisiculturismo', 'tecido leve'] }),
  apparelProduct({ slug: 'camiseta-compressao-segunda-pele-masculina', title: 'Camiseta de compressao segunda pele masculina', description: 'Camiseta masculina de compressao para treino, base layer e performance.', categorySlug: 'masculina', subcategorySlug: 'masculina-camisetas-regatas', audience: 'masculino', productType: 'camiseta de compressao', variation: 'Segunda pele', features: ['compressao ajustada', 'silhueta rente ao corpo', 'efeito tecnico'] }),

  apparelProduct({ slug: 'bermuda-tactel-masculina', title: 'Bermuda de tactel masculina', description: 'Bermuda masculina de tactel leve para treino e rotina esportiva.', categorySlug: 'masculina', subcategorySlug: 'masculina-bermudas-shorts', audience: 'masculino', productType: 'bermuda esportiva', variation: 'Tactel / Tecido leve', features: ['tecido leve', 'secagem rapida', 'caimento confortavel'] }),
  apparelProduct({ slug: 'short-runner-fenda-lateral-masculino', title: 'Short runner com fenda lateral masculino', description: 'Short masculino de corrida com fenda lateral e visual dinamico.', categorySlug: 'masculina', subcategorySlug: 'masculina-bermudas-shorts', audience: 'masculino', productType: 'short runner', variation: 'Fenda lateral', features: ['fenda lateral', 'perfil de corrida', 'mobilidade ampla'] }),
  apparelProduct({ slug: 'short-duplo-masculino', title: 'Short duplo masculino', description: 'Short masculino com compressao interna e tecido externo leve.', categorySlug: 'masculina', subcategorySlug: 'masculina-bermudas-shorts', audience: 'masculino', productType: 'short duplo', variation: 'Compressao interna', features: ['duas camadas', 'forro compressivo', 'leveza para correr'] }),
  apparelProduct({ slug: 'bermuda-moletinho-masculina', title: 'Bermuda de moletinho masculina', description: 'Bermuda masculina de moletinho com apelo casual esportivo.', categorySlug: 'masculina', subcategorySlug: 'masculina-bermudas-shorts', audience: 'masculino', productType: 'bermuda de moletinho', variation: null, features: ['tecido macio', 'cintura elastica', 'estilo athleisure'] }),

  apparelProduct({ slug: 'calca-jogger-tactel-masculina', title: 'Calca jogger esportiva tactel masculina', description: 'Calca jogger masculina em tactel com visual tecnico e leve.', categorySlug: 'masculina', subcategorySlug: 'masculina-calcas-esportivas', audience: 'masculino', productType: 'calca jogger esportiva', variation: 'Tactel / Elastano', features: ['tecido leve', 'punho jogger', 'visual tecnico'] }),
  apparelProduct({ slug: 'calca-jogger-moletom-masculina', title: 'Calca jogger de moletom masculina', description: 'Calca jogger masculina de moletom para rotina esportiva e deslocamento.', categorySlug: 'masculina', subcategorySlug: 'masculina-calcas-esportivas', audience: 'masculino', productType: 'calca jogger', variation: 'Moletom', features: ['moletom confortavel', 'punho ajustado', 'uso casual esportivo'] }),
  apparelProduct({ slug: 'calca-compressao-termica-masculina', title: 'Calca de compressao termica masculina', description: 'Calca masculina de compressao termica para base layer e treino.', categorySlug: 'masculina', subcategorySlug: 'masculina-calcas-esportivas', audience: 'masculino', productType: 'calca de compressao', variation: 'Termica', features: ['compressao ajustada', 'efeito termico leve', 'visual tecnico'] }),

  apparelProduct({ slug: 'jaqueta-corta-vento-masculina', title: 'Jaqueta corta-vento masculina', description: 'Jaqueta masculina corta-vento leve para aquecimento e deslocamento.', categorySlug: 'masculina', subcategorySlug: 'masculina-casacos-esportivos', audience: 'masculino', productType: 'jaqueta corta-vento', variation: null, features: ['protege do vento', 'tecido leve', 'estilo esportivo'] }),
  apparelProduct({ slug: 'moletom-fechado-masculino', title: 'Moletom fechado masculino', description: 'Moletom masculino fechado com visual esportivo e uso casual.', categorySlug: 'masculina', subcategorySlug: 'masculina-casacos-esportivos', audience: 'masculino', productType: 'moletom fechado', variation: null, features: ['estrutura encorpada', 'conforto termico', 'visual de academia'] }),
  apparelProduct({ slug: 'moletom-com-ziper-masculino', title: 'Moletom com ziper masculino', description: 'Moletom masculino com ziper frontal para sobreposicao esportiva.', categorySlug: 'masculina', subcategorySlug: 'masculina-casacos-esportivos', audience: 'masculino', productType: 'moletom com ziper', variation: null, features: ['ziper frontal', 'uso sobreposto', 'estilo casual fitness'] }),
  apparelProduct({ slug: 'colete-esportivo-masculino', title: 'Colete esportivo masculino', description: 'Colete masculino esportivo para compor look de treino e aquecimento.', categorySlug: 'masculina', subcategorySlug: 'masculina-casacos-esportivos', audience: 'masculino', productType: 'colete esportivo', variation: null, features: ['sem mangas', 'sobreposicao leve', 'visual esportivo'] }),

  footwearProduct({ slug: 'tenis-treino-forca-masculino', title: 'Tenis de treino de forca masculino', description: 'Tenis masculino para treino de forca com sola reta e base estavel.', categorySlug: 'masculina', subcategorySlug: 'masculina-calcados', audience: 'masculino', productType: 'tenis de treino', variation: 'Sola reta', features: ['sola reta', 'estabilidade no apoio', 'visual de musculacao'] }),
  footwearProduct({ slug: 'tenis-corrida-masculino', title: 'Tenis de corrida masculino', description: 'Tenis masculino para corrida e esteira com visual comercial esportivo.', categorySlug: 'masculina', subcategorySlug: 'masculina-calcados', audience: 'masculino', productType: 'tenis de corrida', variation: 'Corrida / Esteira', features: ['perfil leve', 'visual dinamico', 'solado esportivo'] }),

  accessoryProduct({ slug: 'mochila-ginastica-masculina', title: 'Mochila de ginastica masculina', description: 'Mochila masculina para academia com compartimentos funcionais.', categorySlug: 'masculina', subcategorySlug: 'masculina-acessorios', audience: 'masculino', productType: 'mochila', features: ['compartimentos internos', 'alcas reforcadas', 'uso esportivo'] }),
  accessoryProduct({ slug: 'bolsa-ginastica-masculina', title: 'Bolsa de ginastica masculina', description: 'Bolsa masculina de academia com visual premium e espaco pratico.', categorySlug: 'masculina', subcategorySlug: 'masculina-acessorios', audience: 'masculino', productType: 'bolsa esportiva', features: ['alca de mao e ombro', 'volume para treino', 'estilo comercial'] }),
  accessoryProduct({ slug: 'luva-treino-masculina', title: 'Luva de treino masculina', description: 'Luva masculina para treino com protecao e melhor pegada.', categorySlug: 'masculina', subcategorySlug: 'masculina-acessorios', audience: 'masculino', productType: 'luva de treino', features: ['palma reforcada', 'maior aderencia', 'visual esportivo'] }),
  accessoryProduct({ slug: 'grip-masculino', title: 'Grip masculino para treino', description: 'Grip masculino para exercicios de puxada com protecao da palma.', categorySlug: 'masculina', subcategorySlug: 'masculina-acessorios', audience: 'masculino', productType: 'grip', features: ['protecao da palma', 'uso em barras', 'acabamento funcional'] }),
  accessoryProduct({ slug: 'cinto-levantamento-peso-masculino', title: 'Cinto de levantamento de peso', description: 'Cinto de treino para levantamento de peso e suporte lombar.', categorySlug: 'masculina', subcategorySlug: 'masculina-acessorios', audience: 'masculino', productType: 'cinto de treino', features: ['suporte lombar', 'fechamento firme', 'uso em cargas altas'] }),
  accessoryProduct({ slug: 'meia-esportiva-masculina', title: 'Meia esportiva masculina', description: 'Meia masculina esportiva para rotina de treino e uso diario.', categorySlug: 'masculina', subcategorySlug: 'masculina-acessorios', audience: 'masculino', productType: 'meia esportiva', features: ['cano esportivo', 'conforto prolongado', 'visual clean'] }),
  accessoryProduct({ slug: 'munhequeira-masculina', title: 'Munhequeira masculina', description: 'Munhequeira masculina para suporte leve durante o treino.', categorySlug: 'masculina', subcategorySlug: 'masculina-acessorios', audience: 'masculino', productType: 'munhequeira', features: ['suporte articular', 'ajuste firme', 'uso funcional'] }),
  accessoryProduct({ slug: 'joelheira-masculina', title: 'Joelheira masculina', description: 'Joelheira esportiva masculina para suporte em agachamento e treino.', categorySlug: 'masculina', subcategorySlug: 'masculina-acessorios', audience: 'masculino', productType: 'joelheira', features: ['suporte de joelho', 'compressao leve', 'uso em treino'] }),
  accessoryProduct({ slug: 'garrafa-masculina', title: 'Garrafa esportiva masculina', description: 'Garrafa masculina esportiva para hidratacao em academia.', categorySlug: 'masculina', subcategorySlug: 'masculina-acessorios', audience: 'masculino', productType: 'garrafa esportiva', features: ['corpo rigido', 'tampa pratica', 'uso em treino'] }),
  accessoryProduct({ slug: 'fortalecedor-pegada-masculino', title: 'Fortalecedor de pegada masculino', description: 'Fortalecedor de pegada masculino para treino de maos e antebracos.', categorySlug: 'masculina', subcategorySlug: 'masculina-acessorios', audience: 'masculino', productType: 'fortalecedor de pegada', features: ['resistencia manual', 'formato compacto', 'uso de forca de pegada'] }),
  accessoryProduct({ slug: 'galao-agua-masculino', title: 'Galao de agua esportivo', description: 'Galao esportivo de alta capacidade para rotina de treino intensa.', categorySlug: 'masculina', subcategorySlug: 'masculina-acessorios', audience: 'masculino', productType: 'galao de agua', features: ['alta capacidade', 'alca robusta', 'uso em academia'] }),
];

const supplementProducts: CatalogProductSeed[] = [
  supplementProduct({ slug: 'whey-protein-concentrado', title: 'Whey Protein Concentrado', description: 'Proteina em po concentrada para rotina de suplementacao esportiva.', subcategorySlug: 'suplementos-proteinas', productType: 'whey protein', variation: 'Concentrado', features: ['alto teor proteico', 'uso pos-treino', 'mistura em po'], pack: 'pote premium' }),
  supplementProduct({ slug: 'whey-protein-isolado', title: 'Whey Protein Isolado', description: 'Proteina isolada em po com perfil limpo para suplementacao diaria.', subcategorySlug: 'suplementos-proteinas', productType: 'whey protein', variation: 'Isolado', features: ['perfil mais puro', 'rapida dissolucao', 'uso esportivo'], pack: 'pote premium' }),
  supplementProduct({ slug: 'whey-protein-hidrolisado', title: 'Whey Protein Hidrolisado', description: 'Proteina hidrolisada em po para linha premium de performance.', subcategorySlug: 'suplementos-proteinas', productType: 'whey protein', variation: 'Hidrolisado', features: ['hidrolisado premium', 'rotina de alta performance', 'mistura fina'], pack: 'pote premium' }),
  supplementProduct({ slug: 'proteina-vegetal-ervilha', title: 'Proteina Vegetal de Ervilha', description: 'Proteina vegetal em po de ervilha para rotina vegana esportiva.', subcategorySlug: 'suplementos-proteinas', productType: 'proteina vegetal', variation: 'Ervilha', features: ['origem vegetal', 'linha vegana', 'mistura em po'], pack: 'pouch fosco premium' }),
  supplementProduct({ slug: 'proteina-vegetal-arroz', title: 'Proteina Vegetal de Arroz', description: 'Proteina vegetal em po de arroz para catalogo de suplementacao clean.', subcategorySlug: 'suplementos-proteinas', productType: 'proteina vegetal', variation: 'Arroz', features: ['origem vegetal', 'perfil leve', 'uso diario'], pack: 'pouch fosco premium' }),
  supplementProduct({ slug: 'proteina-vegetal-soja', title: 'Proteina Vegetal de Soja', description: 'Proteina vegetal de soja para linha de suplementacao de origem vegetal.', subcategorySlug: 'suplementos-proteinas', productType: 'proteina vegetal', variation: 'Soja', features: ['origem vegetal', 'alto teor proteico', 'mistura em po'], pack: 'pouch fosco premium' }),
  supplementProduct({ slug: 'albumina', title: 'Albumina', description: 'Albumina em po para estrategia proteica esportiva e rotina de ganho.', subcategorySlug: 'suplementos-proteinas', productType: 'albumina', features: ['proteina em po', 'perfil tradicional', 'uso esportivo'], pack: 'pote premium' }),
  supplementProduct({ slug: 'caseina', title: 'Caseina', description: 'Caseina em po para linha proteica de absorcao gradual.', subcategorySlug: 'suplementos-proteinas', productType: 'caseina', features: ['proteina de absorcao gradual', 'linha premium', 'mistura cremosa'], pack: 'pote premium' }),
  supplementProduct({ slug: 'colageno', title: 'Colageno', description: 'Colageno em po para bem-estar e composicao da linha wellness esportiva.', subcategorySlug: 'suplementos-proteinas', productType: 'colageno', features: ['uso wellness', 'mistura em po', 'rotulo clean'], pack: 'pote premium' }),

  supplementProduct({ slug: 'creatina', title: 'Creatina', description: 'Creatina monohidratada para rotina de performance e forca.', subcategorySlug: 'suplementos-aminoacidos', productType: 'creatina', features: ['po ultrafino', 'linha de performance', 'uso diario'], pack: 'pote premium' }),
  supplementProduct({ slug: 'bcaa', title: 'BCAA', description: 'BCAA em po para suplementacao esportiva na linha de aminoacidos.', subcategorySlug: 'suplementos-aminoacidos', productType: 'bcaa', features: ['aminoacidos ramificados', 'uso intra ou pos treino', 'po saborizado'], pack: 'pote premium' }),
  supplementProduct({ slug: 'glutamina', title: 'Glutamina', description: 'Glutamina em po para rotina esportiva e recuperacao.', subcategorySlug: 'suplementos-aminoacidos', productType: 'glutamina', features: ['po fino', 'rotina esportiva', 'embalagem clean'], pack: 'pote premium' }),
  supplementProduct({ slug: 'eaa', title: 'EAA', description: 'EAA em po para linha de aminoacidos essenciais de alta performance.', subcategorySlug: 'suplementos-aminoacidos', productType: 'eaa', features: ['aminoacidos essenciais', 'uso esportivo', 'rotulo premium'], pack: 'pote premium' }),

  supplementProduct({ slug: 'pre-treino-em-po', title: 'Pre-treino em Po', description: 'Pre-treino em po com visual premium e proposta energizante.', subcategorySlug: 'suplementos-pre-treinos-energia', productType: 'pre-treino', features: ['formula energizante', 'po saborizado', 'embalagem de alto impacto visual'], pack: 'pote premium' }),
  supplementProduct({ slug: 'cafeina-capsulas', title: 'Cafeina em Capsulas', description: 'Cafeina em capsulas para linha de energia e foco.', subcategorySlug: 'suplementos-pre-treinos-energia', productType: 'cafeina', features: ['capsulas', 'linha energia', 'frasco premium'], pack: 'frasco de capsulas' }),
  supplementProduct({ slug: 'gel-carboidrato', title: 'Gel de Carboidrato', description: 'Gel de carboidrato para praticidade em provas, corrida e endurance.', subcategorySlug: 'suplementos-pre-treinos-energia', productType: 'gel de carboidrato', features: ['sache individual', 'energia rapida', 'visual esportivo'], pack: 'sache ou cartucho slim' }),
  supplementProduct({ slug: 'goma-energetica', title: 'Goma Energetica', description: 'Goma energetica para linha de energia portatil e consumo pratico.', subcategorySlug: 'suplementos-pre-treinos-energia', productType: 'goma energetica', features: ['gummies esportivas', 'embalagem portatil', 'visual limpo'], pack: 'pouch premium' }),

  supplementProduct({ slug: 'termogenico', title: 'Termogenico', description: 'Termogenico em capsulas para linha de definicao e energia.', subcategorySlug: 'suplementos-termogenicos-emagrecimento', productType: 'termogenico', features: ['capsulas', 'linha de definicao', 'frasco premium'], pack: 'frasco de capsulas' }),
  supplementProduct({ slug: 'l-carnitina', title: 'L-Carnitina', description: 'L-Carnitina para linha de suporte a rotina de definicao.', subcategorySlug: 'suplementos-termogenicos-emagrecimento', productType: 'l-carnitina', features: ['suplemento liquido ou capsulas', 'linha de definicao', 'rotulo clean'], pack: 'frasco premium' }),
  supplementProduct({ slug: 'diuretico-natural', title: 'Diuretico Natural', description: 'Suplemento de diuretico natural para linha wellness e definicao.', subcategorySlug: 'suplementos-termogenicos-emagrecimento', productType: 'diuretico natural', features: ['perfil natural', 'frasco clean', 'linha de bem-estar'], pack: 'frasco de capsulas' }),

  supplementProduct({ slug: 'hipercalorico', title: 'Hipercalorico', description: 'Hipercalorico em po para estrategia de ganho e aporte calorico.', subcategorySlug: 'suplementos-carboidratos-hipercaloricos', productType: 'hipercalorico', variation: 'Mass gainer', features: ['alto aporte calorico', 'mistura em po', 'pote de grande volume'], pack: 'pote grande premium' }),
  supplementProduct({ slug: 'maltodextrina', title: 'Maltodextrina', description: 'Carboidrato em po para reposicao energetica esportiva.', subcategorySlug: 'suplementos-carboidratos-hipercaloricos', productType: 'maltodextrina', features: ['carboidrato em po', 'uso pre e pos treino', 'embalagem clean'], pack: 'pouch premium' }),
  supplementProduct({ slug: 'dextrose', title: 'Dextrose', description: 'Carboidrato em po para linha de energia e reposicao rapida.', subcategorySlug: 'suplementos-carboidratos-hipercaloricos', productType: 'dextrose', features: ['po fino', 'energia rapida', 'embalagem clean'], pack: 'pouch premium' }),
  supplementProduct({ slug: 'palatinose', title: 'Palatinose', description: 'Carboidrato premium em po para energia gradativa e performance.', subcategorySlug: 'suplementos-carboidratos-hipercaloricos', productType: 'palatinose', features: ['energia gradual', 'linha premium', 'mistura em po'], pack: 'pouch premium' }),
  supplementProduct({ slug: 'milho-ceroso', title: 'Milho Ceroso', description: 'Carboidrato em po de milho ceroso para linha esportiva.', subcategorySlug: 'suplementos-carboidratos-hipercaloricos', productType: 'milho ceroso', features: ['carboidrato em po', 'uso esportivo', 'embalagem premium'], pack: 'pouch premium' }),

  supplementProduct({ slug: 'multivitaminico', title: 'Multivitaminico', description: 'Multivitaminico para rotina de bem-estar e suplementacao diaria.', subcategorySlug: 'suplementos-vitaminas-minerais-bem-estar', productType: 'multivitaminico', features: ['capsulas ou comprimidos', 'uso diario', 'frasco premium'], pack: 'frasco premium' }),
  supplementProduct({ slug: 'omega-3', title: 'Omega 3', description: 'Omega 3 para linha de bem-estar com visual limpo e profissional.', subcategorySlug: 'suplementos-vitaminas-minerais-bem-estar', productType: 'omega 3', features: ['softgels', 'bem-estar diario', 'frasco clean'], pack: 'frasco premium' }),
  supplementProduct({ slug: 'zma', title: 'ZMA', description: 'ZMA para suporte de recuperacao e rotina esportiva.', subcategorySlug: 'suplementos-vitaminas-minerais-bem-estar', productType: 'zma', features: ['capsulas', 'linha recovery', 'frasco premium'], pack: 'frasco premium' }),
  supplementProduct({ slug: 'melatonina', title: 'Melatonina', description: 'Melatonina para linha de bem-estar e sono na vitrine de suplementos.', subcategorySlug: 'suplementos-vitaminas-minerais-bem-estar', productType: 'melatonina', features: ['capsulas ou gotas', 'linha wellness', 'rotulo clean'], pack: 'frasco premium' }),
  supplementProduct({ slug: 'fitoterapico', title: 'Fitoterapico', description: 'Fitoterapico para composicao da linha wellness e natural.', subcategorySlug: 'suplementos-vitaminas-minerais-bem-estar', productType: 'fitoterapico', features: ['perfil natural', 'frasco clean', 'linha de bem-estar'], pack: 'frasco premium' }),

  supplementProduct({ slug: 'barra-proteina', title: 'Barra de Proteina', description: 'Barra proteica para snack fit de consumo pratico.', subcategorySlug: 'suplementos-alimentos-snacks-fit', productType: 'barra de proteina', features: ['snack proteico', 'embalagem individual', 'visual comercial'], pack: 'barra embalada individualmente' }),
  supplementProduct({ slug: 'pasta-amendoim', title: 'Pasta de Amendoim', description: 'Pasta de amendoim com visual premium para linha de alimentos fit.', subcategorySlug: 'suplementos-alimentos-snacks-fit', productType: 'pasta de amendoim', features: ['creme alimentar', 'frasco premium', 'rotulo clean'], pack: 'pote de vidro ou plastico premium' }),
  supplementProduct({ slug: 'bebida-proteica-rtd', title: 'Bebida Proteica RTD', description: 'Bebida proteica pronta para beber da linha de snacks fit.', subcategorySlug: 'suplementos-alimentos-snacks-fit', productType: 'bebida proteica', variation: 'RTD', features: ['pronta para beber', 'embalagem pratica', 'visual premium'], pack: 'garrafa ou carton premium' }),
  supplementProduct({ slug: 'calda-zero', title: 'Calda Zero', description: 'Calda zero para linha de alimentos fit com embalagem de uso pratico.', subcategorySlug: 'suplementos-alimentos-snacks-fit', productType: 'calda zero', features: ['squeeze bottle', 'rotulo clean', 'linha fit'], pack: 'frasco squeeze premium' }),
  supplementProduct({ slug: 'molho-zero', title: 'Molho Zero', description: 'Molho zero para linha fit com visual comercial limpo.', subcategorySlug: 'suplementos-alimentos-snacks-fit', productType: 'molho zero', features: ['frasco squeeze', 'rotulo clean', 'linha fit'], pack: 'frasco squeeze premium' }),
];

export const masterCatalogProducts: CatalogProductSeed[] = [
  ...femaleProducts,
  ...maleProducts,
  ...supplementProducts,
];
