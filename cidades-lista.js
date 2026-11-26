/* ==========================================================
   cidades-lista.js — as cidades da comunidade e os países da Terra.
   Usado por comunidade-dados.js (para criar as cidades no Firestore) e pela
   faixa da home (faixa-terra.js), que não carrega o Firebase.
   ========================================================== */
/* Cidades: a capital de cada região e as cidades grandes (Portugal, Espanha, França, Itália) e as
   27 capitais do Brasil. A latitude e a longitude vivem só aqui, para a Terra: não vão para o Firestore. */
const CIDADE = (id, nome, pais, regiao, lat, lon) => ({ id, nome, pais, regiao: regiao || "", lat, lon });
export const CIDADES_INICIAIS = [
  // Portugal
  CIDADE("lisboa", "Lisboa", "PT", "", 38.72, -9.14), CIDADE("porto", "Porto", "PT", "", 41.15, -8.61),
  CIDADE("braga", "Braga", "PT", "", 41.55, -8.42), CIDADE("coimbra", "Coimbra", "PT", "", 40.21, -8.43),
  CIDADE("aveiro", "Aveiro", "PT", "", 40.64, -8.65), CIDADE("faro", "Faro", "PT", "", 37.02, -7.93),
  CIDADE("funchal", "Funchal", "PT", "Madeira", 32.65, -16.91), CIDADE("ponta-delgada", "Ponta Delgada", "PT", "Açores", 37.74, -25.67),
  // Espanha, por comunidade autónoma
  CIDADE("madrid", "Madrid", "ES", "Comunidade de Madrid", 40.42, -3.70),
  CIDADE("barcelona", "Barcelona", "ES", "Catalunha", 41.39, 2.17),
  CIDADE("valencia", "Valência", "ES", "Comunidade Valenciana", 39.47, -0.38), CIDADE("alicante", "Alicante", "ES", "Comunidade Valenciana", 38.35, -0.48),
  CIDADE("sevilha", "Sevilha", "ES", "Andaluzia", 37.39, -5.98), CIDADE("malaga", "Málaga", "ES", "Andaluzia", 36.72, -4.42), CIDADE("granada", "Granada", "ES", "Andaluzia", 37.18, -3.60),
  CIDADE("saragoca", "Saragoça", "ES", "Aragão", 41.65, -0.89),
  CIDADE("bilbao", "Bilbao", "ES", "País Basco", 43.26, -2.93),
  CIDADE("palma", "Palma", "ES", "Ilhas Baleares", 39.57, 2.65),
  CIDADE("las-palmas", "Las Palmas", "ES", "Canárias", 28.12, -15.43),
  CIDADE("murcia", "Múrcia", "ES", "Região de Múrcia", 37.99, -1.13),
  CIDADE("valladolid", "Valladolid", "ES", "Castela e Leão", 41.65, -4.72),
  CIDADE("vigo", "Vigo", "ES", "Galícia", 42.24, -8.72), CIDADE("santiago-de-compostela", "Santiago de Compostela", "ES", "Galícia", 42.88, -8.54),
  CIDADE("oviedo", "Oviedo", "ES", "Astúrias", 43.36, -5.85),
  CIDADE("pamplona", "Pamplona", "ES", "Navarra", 42.81, -1.65),
  CIDADE("santander", "Santander", "ES", "Cantábria", 43.46, -3.81),
  // França, por região
  CIDADE("paris", "Paris", "FR", "Île-de-France", 48.86, 2.35),
  CIDADE("marselha", "Marselha", "FR", "Provença-Alpes-Costa Azul", 43.30, 5.37), CIDADE("nice", "Nice", "FR", "Provença-Alpes-Costa Azul", 43.70, 7.27),
  CIDADE("lyon", "Lyon", "FR", "Auvérnia-Ródano-Alpes", 45.76, 4.84),
  CIDADE("toulouse", "Toulouse", "FR", "Occitânia", 43.60, 1.44), CIDADE("montpellier", "Montpellier", "FR", "Occitânia", 43.61, 3.88),
  CIDADE("nantes", "Nantes", "FR", "País do Loire", 47.22, -1.55),
  CIDADE("bordeaux", "Bordeaux", "FR", "Nova Aquitânia", 44.84, -0.58),
  CIDADE("estrasburgo", "Estrasburgo", "FR", "Grande Leste", 48.57, 7.75),
  CIDADE("lille", "Lille", "FR", "Altos da França", 50.63, 3.06),
  // Itália, por região
  CIDADE("roma", "Roma", "IT", "Lácio", 41.90, 12.50),
  CIDADE("milao", "Milão", "IT", "Lombardia", 45.46, 9.19),
  CIDADE("napoles", "Nápoles", "IT", "Campânia", 40.85, 14.27),
  CIDADE("turim", "Turim", "IT", "Piemonte", 45.07, 7.69),
  CIDADE("palermo", "Palermo", "IT", "Sicília", 38.12, 13.36), CIDADE("catania", "Catânia", "IT", "Sicília", 37.50, 15.09),
  CIDADE("genova", "Gênova", "IT", "Ligúria", 44.41, 8.93),
  CIDADE("bolonha", "Bolonha", "IT", "Emília-Romanha", 44.49, 11.34),
  CIDADE("florenca", "Florença", "IT", "Toscana", 43.77, 11.26),
  CIDADE("bari", "Bari", "IT", "Apúlia", 41.12, 16.87),
  CIDADE("veneza", "Veneza", "IT", "Vêneto", 45.44, 12.32),
  // Brasil, as capitais (sigla do estado)
  CIDADE("rio-branco", "Rio Branco", "BR", "AC", -9.97, -67.81), CIDADE("maceio", "Maceió", "BR", "AL", -9.67, -35.74),
  CIDADE("macapa", "Macapá", "BR", "AP", 0.03, -51.07), CIDADE("manaus", "Manaus", "BR", "AM", -3.12, -60.02),
  CIDADE("salvador", "Salvador", "BR", "BA", -12.97, -38.50), CIDADE("fortaleza", "Fortaleza", "BR", "CE", -3.73, -38.52),
  CIDADE("brasilia", "Brasília", "BR", "DF", -15.79, -47.88), CIDADE("vitoria", "Vitória", "BR", "ES", -20.32, -40.34),
  CIDADE("goiania", "Goiânia", "BR", "GO", -16.69, -49.26), CIDADE("sao-luis", "São Luís", "BR", "MA", -2.53, -44.30),
  CIDADE("cuiaba", "Cuiabá", "BR", "MT", -15.60, -56.10), CIDADE("campo-grande", "Campo Grande", "BR", "MS", -20.47, -54.62),
  CIDADE("belo-horizonte", "Belo Horizonte", "BR", "MG", -19.92, -43.94), CIDADE("belem", "Belém", "BR", "PA", -1.46, -48.49),
  CIDADE("joao-pessoa", "João Pessoa", "BR", "PB", -7.12, -34.86), CIDADE("curitiba", "Curitiba", "BR", "PR", -25.43, -49.27),
  CIDADE("recife", "Recife", "BR", "PE", -8.05, -34.88), CIDADE("teresina", "Teresina", "BR", "PI", -5.09, -42.80),
  CIDADE("rio-de-janeiro", "Rio de Janeiro", "BR", "RJ", -22.91, -43.17), CIDADE("natal", "Natal", "BR", "RN", -5.79, -35.21),
  CIDADE("porto-alegre", "Porto Alegre", "BR", "RS", -30.03, -51.23), CIDADE("porto-velho", "Porto Velho", "BR", "RO", -8.76, -63.90),
  CIDADE("boa-vista", "Boa Vista", "BR", "RR", 2.82, -60.67), CIDADE("florianopolis", "Florianópolis", "BR", "SC", -27.60, -48.55),
  CIDADE("sao-paulo", "São Paulo", "BR", "SP", -23.55, -46.63), CIDADE("aracaju", "Aracaju", "BR", "SE", -10.91, -37.07),
  CIDADE("palmas", "Palmas", "BR", "TO", -10.18, -48.33)
];
/* Os países da Terra: o centro e o zoom do voo até cada um. */
export const PAISES_GLOBO = [
  { id: "PT", lat: 39.6, lon: -8.0, zoom: 5 },
  { id: "ES", lat: 40.0, lon: -3.7, zoom: 3.8 },
  { id: "FR", lat: 46.5, lon: 2.4, zoom: 3.6 },
  { id: "IT", lat: 42.3, lon: 12.6, zoom: 3.8 },
  { id: "BR", lat: -13.0, lon: -51.0, zoom: 1.7 }
];
