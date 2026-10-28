/*
  Laís de Lima: cardápio, preços e prazos.
  ---------------------------------------------------------------
  Este é o ÚNICO arquivo que precisa ser editado para mudar sabores, preços, tamanhos e prazos.
  O layout (index.html, CSS) não muda. Depois de editar, salve e publique de novo.

  Regras para editar:
  - Valores em reais, sem "R$" (ex.: 98, 115). Use ponto para decimais (ex.: 1.2 kg).
  - "min" e "max" formam a faixa mostrada no site ("R$ 98 a R$ 115"). Se o preço for um só, repita o número.
  - Para dar um preço exato a um sabor, preencha "precoKg" (bolos e tortas) ou "precoFatia" (slice cake)
    dentro do sabor. Enquanto estiver null, vale a faixa geral do tipo.
  - Para o sabor aparecer só em alguns tipos, use "tipos": ["bolo", "torta"]. null = aparece em todos.
  - Depoimentos: preencha a lista "depoimentos" (veja o modelo no fim). Vazia, o site mostra um convite.

  PENDENTE com a cliente (ver clientes/lais-de-lima/pendencias.md):
  preço exato por sabor, lista completa de sabores, quais sabores existem em slice cake,
  se tortas usam os mesmos tamanhos e o mesmo preço por kg, bairros e valor da taxa de entrega.
*/
window.CARDAPIO = {
  negocio: {
    nome: "Laís de Lima",
    cidade: "Lages, SC",
    whatsapp: "5549998073537",          // só números, com 55 e DDD
    whatsappExibicao: "(49) 99807-3537",
    instagram: "laisdlima_"
  },

  // Prazo mínimo (em dias) para bolos e tortas sob encomenda. Slice cake é pronta entrega.
  prazoEncomendaDias: 5,

  pagamento: "Pix ou dinheiro, na entrega do pedido.",
  avisoEntrega: "A taxa de entrega é combinada com a Laís pelo WhatsApp.",

  tipos: [
    {
      id: "slice",
      nome: "Slice cake",
      venda: "fatia",
      prontaEntrega: true,
      precoFatia: { min: 15, max: 25 },
      descricao: "Fatia individual, de pronta entrega."
    },
    {
      id: "bolo",
      nome: "Bolo recheado",
      venda: "inteiro",
      precoKg: { min: 98, max: 115 },
      descricao: "Sob encomenda, em três tamanhos e com decoração simples. O valor do quilo muda com o recheio."
    },
    {
      id: "torta",
      nome: "Torta",
      venda: "inteiro",
      precoKg: { min: 98, max: 115 },   // A CONFIRMAR: preço das tortas
      descricao: "Sob encomenda, em três tamanhos e com decoração simples. O valor do quilo muda com o recheio."
    }
  ],

  // Tamanhos de bolos e tortas inteiros. O peso varia com a massa e o recheio.
  tamanhos: [
    { id: "15", diametro: 15, fatias: [10, 12], pesoKg: [1.2, 1.5] },
    { id: "20", diametro: 20, fatias: [20, 25], pesoKg: [1.8, 2.8] },
    { id: "25", diametro: 25, fatias: [35, 45], pesoKg: [3.5, 4.5] }
  ],

  // Sabores. destaque: true = aparece em "Os mais pedidos".
  // Para mostrar a foto real de um sabor, acrescente: foto: "assets/img/fotos/nome.webp", fotoAlt: "descrição da foto".
  // Sem foto, aparece o espaço "Foto em breve".
  sabores: [
    { id: "matilda", nome: "Torta Matilda", destaque: true, descricao: null, foto: "assets/img/fotos/torta-matilda.webp", fotoAlt: "Torta Matilda cortada, com camadas de bolo e recheio de chocolate e cobertura de chocolate", tipos: null, precoKg: null, precoFatia: null },
    { id: "doce-de-leite-nozes", nome: "Doce de Leite com Nozes", destaque: true, descricao: null, foto: "assets/img/fotos/doce-de-leite-nozes.webp", fotoAlt: "Bolo de doce de leite com nozes cortado, mostrando as camadas de bolo e doce de leite, com nozes por cima", tipos: null, precoKg: null, precoFatia: null },
    { id: "cha-da-tarde", nome: "Chá da Tarde", destaque: true,
      descricao: "Pão de ló, creme mousseline e geleia de frutas vermelhas.", tipos: null, precoKg: null, precoFatia: null }
  ],

  // Modelo: { texto: "…", nome: "Maria", detalhe: "cliente em Lages", imagem: "assets/img/depoimento-1.webp" }
  // Use "texto" para o texto exato do depoimento OU "imagem" para o print da mensagem (com "alt" descrevendo).
  depoimentos: []
};
