/* ============================================================
   i18n do portfólio de Lucas Nunes
   Padrão estrutural copiado do sistema de idiomas do NeuroMedit
   (translations.js + i18n.css), adaptado para os tokens de cor
   e a arquitetura estática (arquivos self-contained) do portfólio.
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "lucasnunes-portfolio-lang";
  var DEFAULT_LANGUAGE = "pt";
  var SUPPORTED_LANGUAGES = ["pt", "en", "es", "it"];

  window.PortfolioTranslations = window.PortfolioTranslations || {};

  /* ---------- PT (idioma de origem) ---------- */
  window.PortfolioTranslations.pt = Object.assign({}, window.PortfolioTranslations.pt, {
    common_skip: "Pular para o conteúdo",
    common_nav_casos: "Casos",
    common_nav_sobre: "Sobre",
    common_nav_contato: "Contato",
    common_lang_aria: "Selecionar idioma",
    common_h_pesquisa: "Pesquisa",
    common_h_abordagem: "Abordagem",
    common_h_papel: "Meu papel",
    common_h_contexto: "Contexto",
    common_footer: "© 2026 Lucas Nunes · Lisboa, Portugal.",

    idx_hero_eyebrow: "UX Design · NeuroMedit · Hospitalidade",
    idx_hero_h1_pre: "UX Design, meditação e",
    idx_hero_h1_em: "cuidado humano",
    idx_hero_text: "Sou o Lucas Nunes — estudante de UX Design e criador do NeuroMedit. Desenho interfaces, sessões e atendimentos com o mesmo princípio: reduzir ruído para devolver presença.",
    idx_hero_cta_casos: "Ver casos",
    idx_hero_cta_contato: "Falar comigo",
    idx_open_chip: "Aberto a colaborar em UX/UI, front-end e produtos centrados em pessoas",
    idx_hero_photo_cap: "Lisboa, Portugal",
    idx_hero_photo_alt: "Retrato de Lucas Nunes",
    idx_photo_placeholder: "Sua foto aqui — salve como lucas-foto.jpg nesta mesma pasta",

    idx_case1_tag: "Produto próprio · 2025–2026",
    idx_case2_title: "Hospitalidade como pesquisa de usuário",
    idx_case2_tag: "Lisboa & Brasil · 2019–2024",
    idx_case3_title: "Design com baixa carga cognitiva",
    idx_case3_tag: "Em formação · 2024–2026",
    idx_case4_title: "Tendências de UX em 2026",
    idx_case4_tag: "Estudo próprio · 2026",

    idx_c1_h2: "Reduzir ruído para devolver presença",
    idx_c1_tag: "Caso 01 · NeuroMedit",
    idx_c1_intro: "A maioria dos apps de meditação pede pra você relaxar — e te sobrecarrega de escolhas antes disso. Bibliotecas de conteúdo exigem decisão, sistemas visuais competem por atenção, e a primeira tarefa nunca é meditar: é escolher, filtrar, comparar. Para quem chega esgotado, isso é o oposto de alívio.",
    idx_c1_pesquisa_p: "Comparei a entrada de apps como Calm e Headspace: mesmo com ótimo acabamento visual, ainda pedem navegação e decisão antes da primeira respiração guiada.",
    idx_c1_abordagem_p: "Tratei o momento antes da meditação como parte da meditação. A respiração virou transição de interface, não decoração — uma \"eclusa\" (airlock) entre o modo de navegar e o modo de praticar.",
    idx_c1_papel_p: "Pesquisa, roteiro, sistema visual (o símbolo da onda respiratória) e front-end — sozinho, da primeira gravação no telemóvel ao produto no ar.",
    idx_c1_flow_title: "O fluxo, em sete passos",
    idx_flow_1: "Sobrecarregado",
    idx_flow_2: "Chegada",
    idx_flow_3: "Respiração",
    idx_flow_4: "Airlock",
    idx_flow_5: "Meditação",
    idx_flow_6: "Reflexão",
    idx_flow_7: "Calma",
    idx_c1_learn_1: "Calma pode ser desenhada estruturalmente, não só visualmente.",
    idx_c1_learn_2: "Sobrecarga cognitiva aumenta resistência, mesmo quando a intenção é boa.",
    idx_c1_learn_3: "Simplicidade não é vazio — é clareza.",
    idx_c1_result: "Resultado: um produto <strong>ao vivo</strong>, com sessões guiadas reais e sistema visual próprio.",
    idx_c1_link_visit: "Visitar o NeuroMedit ↗",
    idx_c1_link_case: "Ver o case study completo →",
    idx_audio_play_label: "Reproduzir amostra de meditação",
    idx_audio_pause_label: "Pausar amostra de meditação",
    idx_audio_title: "Meditação de amostra",
    idx_audio_status_default: "A respiração de entrada do NeuroMedit · 4:25",
    idx_c1_link_poema: "A origem: o poema da árvore →",

    idx_c2_tag: "Caso 02 · Hospitalidade",
    idx_c2_context_p: "Anos de balcão em Lisboa e no Brasil, ao lado de colegas de Cabo Verde, Moçambique e Angola. Clientes de passagem, poucos segundos para criar confiança.",
    idx_c2_approach_p: "Aprendi a ler sinais rápido: tom de voz, postura, o que a pessoa não disse. Cada atendimento virou um pequeno estudo de comportamento — o mesmo instinto que hoje aplico em pesquisa de usuário.",
    idx_c2_role_p: "Atendimento direto ao cliente, em dois idiomas, em ambientes de alto volume e pouca margem de erro.",
    idx_c2_result: "Resultado: visitantes que <strong>viravam regulares</strong> — e a base do meu olhar como designer.",

    idx_c3_tag: "Caso 03 · UX Design",
    idx_c3_context_p: "Entrei na faculdade de UX Design depois de anos de programação e atendimento. Queria unir as duas coisas: lógica de sistema e leitura humana.",
    idx_c3_approach_p: "Uma decisão por tela, hierarquia clara, texto que não exige esforço. Este princípio guiou o roteiro do NeuroMedit e guia esta própria página que você está lendo agora.",
    idx_c3_role_p: "Pesquisa, wireframe, prototipagem e design de interface — sozinho, do zero ao produto publicado.",
    idx_c3_result: "Resultado: um <strong>método</strong> aplicado em tudo o que construo, não só um princípio teórico.",
    idx_c3_link: "Ver esta página como exemplo ↑",

    idx_c4_h2: "Para onde a experiência do usuário vai em 2026",
    idx_c4_tag: "Caso 04 · Pesquisa própria",
    idx_c4_intro: "Antes de continuar desenhando, parei para pesquisar a fundo: onde o dedo alcança melhor no mobile, para onde o olho vai primeiro no desktop, que forma de botão converte mais, e o que realmente muda para quem navega com leitor de tela. Depois apliquei cada achado nesta própria página — e auditei o NeuroMedit com a mesma régua.",
    idx_c4_pesquisa_p: "Zona de alcance do polegar em mobile, padrões de leitura em F e Z no desktop, forma de botão e conversão, e as regras de acessibilidade da WCAG 2.2 / European Accessibility Act.",
    idx_c4_abordagem_p: "Nada de opinião solta: medi o contraste real das cores do meu portfólio e do NeuroMedit pela fórmula oficial do WCAG antes de mudar qualquer coisa — e encontrei falhas reais nos dois.",
    idx_c4_papel_p: "Pesquisa, cálculo de contraste, escrita do estudo e implementação das correções — nos dois produtos, com aprovação antes de tocar o NeuroMedit em produção.",
    idx_c4_result: "Resultado: <strong>12 correções de contraste</strong> aplicadas em produção, mais CTA de polegar, skip-link e alvos de toque no meu portfólio.",
    idx_c4_link: "Ler o estudo completo →",

    idx_about_eyebrow: "Sobre mim",
    idx_about_h2: "Do Rio São Francisco a Lisboa",
    idx_about_p1: "Nasci em Paulo Afonso, Bahia, à beira do rio. Aos 16, pagava minha própria escola de espanhol trabalhando numa biblioteca — e já meditava todas as manhãs.",
    idx_about_p2: "Em 2022 atravessei o Brasil de ônibus e depois o Atlântico, e recomecei em Lisboa com 800€. Hoje sou estudante de UX Design, voluntário num centro de yoga, e sigo guiando meditações — agora para muito mais gente do que imaginava.",

    idx_tl_2002_title: "Paulo Afonso, Bahia",
    idx_tl_2002_desc: "Nasço à beira do Rio São Francisco.",
    idx_tl_2016_title: "A biblioteca",
    idx_tl_2016_desc: "Pago minha escola de espanhol com o próprio salário.",
    idx_tl_2022_title: "A travessia",
    idx_tl_2022_desc: "Brasil de ônibus, depois o Atlântico. Chego a Lisboa.",
    idx_tl_2023_title: "Os balcões",
    idx_tl_2023_desc: "Hospitalidade em Lisboa, gente vira especialidade.",
    idx_tl_2024_title: "Formação",
    idx_tl_2024_desc: "Faculdade de UX Design e trabalho, lado a lado.",
    idx_tl_2025_title: "NeuroMedit",
    idx_tl_2025_desc: "O projeto nasce, num período sabático.",
    idx_tl_2026_title: "Hoje",
    idx_tl_2026_desc: "UX Design, yoga e meditação, lado a lado.",

    idx_contact_eyebrow: "Vamos conversar",
    idx_contact_h2: "Se o meu caminho fez sentido pra você, escreva.",
    idx_contact_p: "Respondo pessoalmente — sobre um projeto, uma vaga, uma meditação ou só para trocar uma ideia.",
    idx_contact_cta_email: "Escrever para mim",
    idx_contact_cta_linkedin: "Conectar no LinkedIn",
    idx_social_email: "E-mail",

    cs_back: "← Voltar ao portfólio",
    cs_eyebrow_hero: "Estudo de caso de UX",
    cs_subtitle: "Desenhando uma experiência de meditação com baixa carga cognitiva.",
    cs_hero_body: "A maioria dos apps de meditação pede para você relaxar — e te sobrecarrega de escolhas antes disso. Este é o processo por trás de um app que trata o momento antes da meditação como parte da própria meditação.",
    cs_tag_ux: "UX Design",
    cs_tag_emotional: "Design Emocional",
    cs_tag_cognitive: "Carga Cognitiva",
    cs_tag_frontend: "Front-End",
    cs_cta_explore: "Explorar o processo ↓",
    cs_cta_live: "Ver projeto no ar ↗",

    cs_eyebrow_01: "01 · Pesquisa e Enquadramento",
    cs_h2_01: "Começando pela pergunta errada",
    cs_01_p1: "Apps de meditação costumam ser julgados pela biblioteca de conteúdo — quantas sessões, quantas vozes, quantos temas. Eu também comecei por aí, e era o lugar errado para começar.",
    cs_01_p2: "O atrito real não era o conteúdo. Era tudo o que uma pessoa estressada precisa fazer antes de chegar até ele: abrir o app, ler um menu, comparar categorias, tomar uma decisão. Para quem abriu o app já sobrecarregado, essa sequência é uma segunda fonte de sobrecarga.",
    cs_01_p3: "Então reformulei o problema. Em vez de perguntar \"que conteúdo esse app deveria ter\", perguntei \"o que alguém em estado de desregulação precisa de uma interface nos primeiros dez segundos\". Essa pergunta moldou tudo o que veio depois.",

    cs_eyebrow_02: "02 · Síntese da Pesquisa",
    cs_h2_02: "Calma é um problema estrutural, não visual",
    cs_02_p1: "Cores suaves e animações lentas podem sugerir calma, mas não a produzem se a pessoa ainda precisa pensar, escolher e navegar antes da primeira respiração. Calma visual e calma cognitiva são coisas diferentes, e a maioria dos produtos de meditação desenha só para a primeira.",
    cs_quote: "Calma não é uma paleta de cores. É a ausência de decisões desnecessárias.",
    cs_02_p2: "Esse insight virou a tese de design do NeuroMedit: reduzir o número de decisões entre \"abri o app\" e \"estou respirando\", e tratar cada tela intermediária como transição, não como destino.",
    cs_02_p3: "Isso significou olhar além da estética e mapear o estado emocional e cognitivo de quem está do outro lado da tela — antes de desenhar um único componente.",

    cs_eyebrow_states: "Estados do Usuário",
    cs_h2_states: "Quem realmente abre esse app",
    cs_states_intro: "Quatro estados recorrentes surgiram na pesquisa — cada um com um ponto de entrada emocional diferente, uma dor cognitiva diferente, e uma oportunidade diferente para a interface ajudar em vez de gerar mais atrito.",
    cs_label_emotional: "Estado emocional",
    cs_label_cognitive: "Dor cognitiva",
    cs_label_opportunity: "Oportunidade de UX",
    cs_state1_title: "Sobrecarregado",
    cs_state1_emotional: "Ansioso, disperso, mentalmente \"barulhento\".",
    cs_state1_cognitive: "Qualquer menu parece mais uma exigência.",
    cs_state1_opportunity: "Remover a escolha completamente na entrada — oferecer um único próximo passo óbvio.",
    cs_state2_title: "Esgotado",
    cs_state2_emotional: "Cansado, com pouca energia, pouca paciência.",
    cs_state2_cognitive: "Ler e comparar opções custa um esforço que ele não tem.",
    cs_state2_opportunity: "Interações curtas e de baixo esforço, com bastante espaço em branco.",
    cs_state3_title: "Cético",
    cs_state3_emotional: "Curioso, mas cauteloso, sem certeza de que vai ajudar.",
    cs_state3_cognitive: "Linguagem excessivamente clínica ou mística quebra a confiança.",
    cs_state3_opportunity: "Linguagem simples e concreta, com transparência visível sobre o método.",
    cs_state4_title: "Recorrente",
    cs_state4_emotional: "Já familiarizado com o app, buscando rotina.",
    cs_state4_cognitive: "Atrito para voltar ao que já funcionou antes.",
    cs_state4_opportunity: "Reentrada rápida às sessões recentes ou favoritas.",

    cs_eyebrow_03: "03 · Benchmark",
    cs_h2_03: "Olhando para Calm e Headspace com olhar crítico",
    cs_03_intro: "Os dois são produtos bem construídos, com sistemas visuais sólidos. A lacuna que encontrei não estava no acabamento — estava no que acontece antes da primeira respiração.",
    cs_bench_calm_h: "Calm",
    cs_bench_calm_p: "Uma tela inicial rica e editorial, com várias trilhas de conteúdo. Bonita, mas exige uma decisão antes de qualquer prática começar — a entrada é uma biblioteca, não uma respiração.",
    cs_bench_headspace_h: "Headspace",
    cs_bench_headspace_p: "Mais amigável e guiado que o Calm, com onboarding que empurra para uma primeira sessão. Ainda assim, a navegação principal mostra categorias e cursos antes de qualquer ação de acalmar.",
    cs_bench_insight_h: "Percepção",
    cs_bench_insight_p: "Nenhum dos dois produtos trata o momento pré-sessão como parte do arco emocional. Os dois otimizam a biblioteca. O NeuroMedit otimiza o limiar.",
    cs_carousel_alt_calm: "Tela inicial do app Calm, mostrando várias trilhas de conteúdo e categorias",
    cs_carousel_alt_headspace: "Tela inicial do app Headspace, mostrando onboarding e categorias de cursos",
    cs_carousel_prev_label: "Imagem anterior",
    cs_carousel_next_label: "Próxima imagem",
    cs_carousel_cap_calm: "Calm — tela de entrada",
    cs_carousel_cap_headspace: "Headspace — tela de entrada",

    cs_eyebrow_04: "04 · Princípios de Design",
    cs_h2_04: "Cinco regras que moldaram cada tela",
    cs_p1_title: "Uma decisão por tela",
    cs_p1_desc: "Nunca peça duas escolhas quando uma basta.",
    cs_p2_title: "Divulgação progressiva",
    cs_p2_desc: "Revele complexidade só quando o usuário estiver pronto para ela.",
    cs_p3_title: "Respiração como transição",
    cs_p3_desc: "Momentos de carregamento e navegação também funcionam como sinais de regulação.",
    cs_p4_title: "Espaço em branco generoso",
    cs_p4_desc: "Espaço é um recurso para um sistema nervoso esgotado, não decoração.",
    cs_p5_title: "Linguagem honesta",
    cs_p5_desc: "Nada de jargão clínico, nada de exagero místico — só palavras simples e concretas.",

    cs_eyebrow_05: "05 · Exploração",
    cs_h2_05: "De wireframes densos a um único limiar",
    cs_wf1_alt: "Wireframe inicial com uma grade densa de categorias e filtros",
    cs_wf1_title: "Antes",
    cs_wf1_desc: "A primeira versão espelhava o padrão de categorias em primeiro lugar do Calm e do Headspace — familiar, mas ainda carregado de decisões logo de início.",
    cs_wf2_alt: "Wireframe da tela de entrada simplificada, com uma única ação principal",
    cs_wf2_title: "Entrada",
    cs_wf2_desc: "Reduzida a uma única ação: começar. As categorias foram para uma camada mais profunda, acessíveis mas não obrigatórias.",
    cs_wf3_alt: "Wireframe da tela de transição respiratória do airlock",
    cs_wf3_title: "Airlock",
    cs_wf3_desc: "Um novo tipo de tela: uma transição respiratória entre \"chegar\" e \"praticar\", em vez de um menu.",
    cs_decision_h: "Notas de decisão",
    cs_decision_p: "A maior mudança não foi visual — foi estrutural. Removi uma camada inteira de navegação e a substituí por um único passo guiado. Os primeiros testadores descreveram consistentemente a tela do airlock como \"o momento em que eu realmente comecei a relaxar\", o que confirmou que a própria transição precisava ser desenhada, não pulada.",

    cs_eyebrow_06: "06 · Fluxo do Usuário",
    cs_h2_06: "Sete passos, um único arco contínuo",
    cs_06_intro: "Cada passo foi desenhado como parte da mesma curva emocional — de sobrecarregado a calmo — em vez de como funcionalidades separadas.",
    cs_flowd1_desc: "O estado em que a pessoa chega — antes de abrir o app.",
    cs_flowd2_desc: "Uma superfície clara, um único próximo passo óbvio. Sem menu.",
    cs_flowd3_desc: "Uma respiração guiada começa imediatamente, antes de qualquer escolha de conteúdo.",
    cs_flowd4_desc: "A tela de transição — administrando o ritmo entre navegar e praticar.",
    cs_flowd5_desc: "A sessão guiada em si, livre de ruído de interface.",
    cs_flowd6_desc: "Um momento breve e opcional para notar o que mudou.",
    cs_flowd7_desc: "O estado final pretendido — e a única métrica de sucesso real do app.",

    cs_eyebrow_07: "07 · Processamento Estético",
    cs_h2_07: "Transformando um princípio em símbolo",
    cs_concept_k: "Conceito",
    cs_concept_h3: "Retorno à calma",
    cs_process_h4: "Exploração do símbolo",
    cs_process_p: "A identidade visual partiu da mesma curva respiratória usada na transição do airlock — uma única linha contínua que se alarga e se assenta, ecoando uma inspiração e uma expiração.",
    cs_eq_term1: "Curva respiratória",
    cs_eq_term2: "Calma circular",
    cs_eq_term3: "Espaço negativo",
    cs_eq_result: "Símbolo NeuroMedit",
    cs_rule1_h: "Sem cantos afiados",
    cs_rule1_p: "Toda forma se resolve numa curva — nada no sistema soa abrupto.",
    cs_rule2_h: "Um único destaque por tela",
    cs_rule2_p: "A cor é usada para guiar a atenção, nunca para decorar.",
    cs_rule3_h: "Movimento lento por padrão",
    cs_rule3_p: "As transições duram o suficiente para serem sentidas, não só vistas.",
    cs_rule4_h: "A tipografia respira",
    cs_rule4_p: "Altura de linha generosa em todo lugar — o texto nunca é denso.",
    cs_rule5_h: "O silêncio é permitido",
    cs_rule5_p: "Espaço vazio é um estado válido e intencional — não um vão a preencher.",
    cs_rule6_h: "Consistência acima de novidade",
    cs_rule6_p: "Padrões familiares reduzem o custo cognitivo de voltar.",
    cs_logo_alt: "Símbolo do NeuroMedit — uma curva respiratória contínua",
    cs_logo_p: "Identidade final: uma marca construída a partir do mesmo princípio do produto — uma única linha contínua e sem pressa.",

    cs_eyebrow_shift: "O Que Mudou Durante o Processo",
    cs_h2_shift: "De lista de funcionalidades a arco emocional",
    cs_shift_p1: "O projeto começou como um briefing bem convencional de app de conteúdo: construir uma biblioteca, adicionar um player, lançar categorias. A virada aconteceu quando parei de desenhar telas e comecei a desenhar uma sequência — tratando toda a primeira experiência como um único arco emocional contínuo, em vez de um conjunto de funcionalidades independentes.",
    cs_shift_p2: "Essa reformulação cortou escopo em alguns pontos (um sistema completo de descoberta de conteúdo foi adiado) e acrescentou escopo em outros (a transição do airlock não existia no plano original). As duas decisões vieram diretamente de observar onde as pessoas realmente precisavam de ajuda.",
    cs_shift_p3: "No fim, a interface tinha menos telas que o primeiro rascunho, não mais — e os testadores chegaram à primeira respiração guiada em cerca de um terço dos toques.",

    cs_eyebrow_learnings: "Principais Aprendizados",
    cs_h2_learnings: "O que esse projeto me ensinou",
    cs_learn1: "Calma pode ser desenhada estruturalmente, não só visualmente — a sequência de passos importa tanto quanto qualquer cor.",
    cs_learn2: "Sobrecarga cognitiva aumenta a resistência mesmo quando a intenção por trás é boa.",
    cs_learn3: "Simplicidade não é vazio — é clareza alcançada removendo o que não serve ao momento.",
    cs_learn4: "Uma tela de transição pode fazer mais trabalho emocional do que uma tela de funcionalidade, se for desenhada com o mesmo cuidado.",
    cs_learn5: "Testar com pessoas em um estado real de estresse revela atritos que um teste de usabilidade em humor neutro nunca revelaria.",

    cs_eyebrow_thanks: "Obrigado",
    cs_h2_thanks: "Por ter lido até aqui",
    cs_thanks_p1: "Este estudo de caso é tanto sobre um processo de design quanto sobre um processo pessoal — aprender a tratar a contenção como uma decisão de design, não como uma limitação.",
    cs_thanks_p2: "O NeuroMedit está no ar hoje, construído e lançado sozinho: pesquisa, sistema visual e front-end. Ainda está crescendo, e cada sessão que ele guia é um pequeno teste de se a tese original se sustenta.",
    cs_opportunity_p: "Se você está construindo um produto em que os primeiros segundos importam — onboarding, bem-estar, ou qualquer coisa em que alguém chega sobrecarregado — eu adoraria ouvir sobre isso.",
    cs_cta_talk: "Vamos conversar",
    cs_cta_contact: "Contato pelo portfólio",
    cs_sign: "Com gratidão,<br>Lucas Nunes",

    cs_footer: "© 2026 Lucas Nunes · Estudo de caso de UX, adaptado da documentação original de design do NeuroMedit.",

    tend_eyebrow: "Caso 04 · Estudo próprio",
    tend_h1: "Para onde a experiência do usuário vai em 2026",
    tend_lede: "Onde o dedo alcança melhor no mobile. Para onde o olho vai primeiro no desktop. Que forma de botão converte mais. O que muda de verdade para quem navega com leitor de tela. Pesquisei tudo isso antes de continuar desenhando — e apliquei cada achado nesta página e no NeuroMedit.",
    tend_meta_link: "Ver resumo no portfólio",

    tend_h2_1: "1. Tendências gerais de UX em 2026",
    tend_1_p1: "Design calmo continua sendo a direção dominante: redução de carga cognitiva, fluxos gentis, uma decisão por tela. IA já está em praticamente todas as ferramentas de design (93% dos designers a usam), mas o próprio mercado alerta contra aplicá-la sem propósito — o uso que compensa é em personalização e acessibilidade, não como enfeite.",
    tend_1_p2: "O vidro fosco (glassmorphism) voltou com força — inclusive adotado pela Apple e Microsoft para 2026 — mas com uma ressalva séria: texto sobre vidro perde contraste com facilidade. A prática recomendada é manter uma camada de texto sempre legível e desligar a transparência quando o sistema do usuário pede mais contraste.",

    tend_h2_2: "2. A zona do polegar (mobile)",
    tend_2_p1: "Cerca de 75% dos toques em smartphones são feitos com o polegar, sem usar a outra mão. O mapa de alcance divide a tela em três zonas: verde (fácil, centro-inferior), amarela (exige esticar) e vermelha (cantos superiores, difícil). Em aparelhos grandes, ações importantes devem ficar no terço inferior da tela.",
    tend_2_quote: "\"O botão de câmera do iOS fica centralizado embaixo porque essa é a posição mais fácil de acertar, não importa como você segura o telefone.\"",
    tend_h3_applied: "Aplicado nesta página",
    tend_2_f1: "<strong>CTA flutuante:</strong> um botão \"Falar comigo\" fixo na zona verde, que só aparece depois que o visitante rola além do hero — sem competir com o botão principal.",
    tend_2_f2: "<strong>Alvos de toque:</strong> todos os links pequenos (menu, redes sociais) passaram a ter no mínimo 44px de altura de toque.",

    tend_h2_3: "3. Para onde o olho vai primeiro (desktop)",
    tend_3_p1: "Estudos de eye-tracking mostram dois padrões dominantes. O padrão em <strong style=\"color:var(--ink)\">F</strong> aparece em páginas com muito texto: o olhar corre o topo e desce escaneando a lateral esquerda. O padrão em <strong style=\"color:var(--ink)\">Z</strong> aparece em páginas simples, tipo landing pages: do canto superior esquerdo até a chamada para ação no canto inferior direito.",
    tend_3_f1: "<strong>Hero em Z:</strong> poucos elementos — título à esquerda, foto à direita, botões embaixo — guiando o olhar até a ação.",
    tend_3_f2: "<strong>Casos em F:</strong> cada bloco de caso começa com rótulo e título alinhados à esquerda, ancorando o olhar no mesmo ponto de partida a cada seção.",

    tend_h2_4: "4. Forma de botões e alvos de toque",
    tend_4_p1: "Retângulos arredondados (8–12px) e formatos em pílula dominam 2026. Botões com cantos arredondados recebem entre 17% e 55% mais cliques que os de cantos retos. O alvo mínimo de toque recomendado é 44×44px — e desde 28 de junho de 2025 o <em>European Accessibility Act</em> exige, por lei na União Europeia, no mínimo 24×24px (WCAG 2.5.8).",
    tend_4_f1: "<strong>Botões:</strong> raio aumentado de 2px para 10px em toda a página — mais próximo da tendência que mais converte.",
    tend_4_f2: "<strong>Cabeçalho:</strong> a cápsula do menu é 100% arredondada, seguindo a mesma linguagem do NeuroMedit.",

    tend_h2_5: "5. Acessibilidade para pessoas cegas",
    tend_5_p1: "A WCAG 2.2 se apoia em quatro princípios: Perceptível, Operável, Compreensível e Robusto. Para quem usa leitor de tela, o que mais importa é: texto alternativo em imagens, navegação inteira por teclado, rótulos claros e contraste adequado. Desde junho de 2025, o European Accessibility Act tornou a WCAG 2.2 nível AA obrigatória por lei na UE — incluindo, pela primeira vez, tamanho mínimo de alvo de toque.",
    tend_5_f1: "<strong>\"Pular para o conteúdo\":</strong> primeiro elemento focável, permite pular o menu sem precisar ouvir/tabular por ele toda vez.",
    tend_5_f2: "<strong>Landmark &lt;main&gt;:</strong> todo o conteúdo principal está dentro de uma região navegável por leitores de tela.",
    tend_5_f3: "<strong>Ícones decorativos silenciados:</strong> setas e pontos puramente visuais receberam <code>aria-hidden=\"true\"</code>.",
    tend_5_f4: "<strong>Contraste corrigido:</strong> as cores de texto mais claras da paleta foram escurecidas — ver tabela abaixo.",

    tend_h2_6: "6. Auditoria de contraste — calculado, não estimado",
    tend_6_p1: "Antes de mudar qualquer cor, calculei o contraste real pela fórmula oficial de luminância relativa do WCAG. O mínimo exigido é 4.5:1 para texto normal e 3:1 para texto grande (24px+) ou elementos de interface.",
    tend_th_combo: "Combinação",
    tend_th_contrast: "Contraste",
    tend_th_result: "Resultado",
    tend_row1: "Portfólio — cinza claro antigo (#948D7C)",
    tend_row2: "Portfólio — cinza claro corrigido (#726A56)",
    tend_row3: "Portfólio — terracota antigo (#B4633A)",
    tend_row4: "Portfólio — terracota corrigido (#8A4726)",
    tend_row5: "NeuroMedit — sage escuro antigo (#708f89)",
    tend_row6: "NeuroMedit — sage escuro corrigido (#517067)",
    tend_row7: "NeuroMedit — âmbar antigo (#9e7042)",
    tend_row8: "NeuroMedit — âmbar corrigido (#8a5d34)",
    tend_status_fail: "Falhava",
    tend_status_pass: "Aprovado",
    tend_status_fail_normal: "Falhava em texto normal",
    tend_table_note: "12 correções foram aplicadas em 10 arquivos CSS do NeuroMedit em produção — os temas escuros (sunset, night) já passavam com folga e não foram alterados.",

    tend_h2_7: "7. Referências",
    tend_7_intro: "As fontes consultadas nesta pesquisa, por tema:",
    tend_topic_general: "Tendências gerais de UX",
    tend_topic_thumb: "Zona do polegar",
    tend_topic_reading: "Padrões de leitura visual",
    tend_topic_buttons: "Design de botões",
    tend_topic_a11y: "Acessibilidade",
    tend_topic_a11y_target: "Acessibilidade / alvo de toque",
    tend_topic_glass: "Vidro fosco e acessibilidade",

    tend_cta_eyebrow: "Gostou do processo?",
    tend_cta_h2: "É assim que eu penso cada projeto — pesquisa antes, opinião depois.",
    tend_cta_p: "Se você quer esse tipo de rigor no seu produto, escreva.",
    tend_cta_back: "Voltar ao portfólio",

    poema_eyebrow: "Antes do NeuroMedit",
    poema_h1: "Uma árvore, uma casa, uma meditação",
    poema_lede: "Antes de qualquer método, houve uma árvore no quintal. Este é o poema que guarda a raiz do NeuroMedit.",
    poema_scroll_hint: "Role devagar",
    poema_beat1: "Tudo começou numa árvore, em frente no quintal da casa onde eu morava.",
    poema_beat2: "Eu encontrei a minha casa, nela tinha uma cama, uma cozinha, e muita paz,",
    poema_beat3: "a meditação era estar ali presente, ouvindo o vento entrar em casa pelas folhas,",
    poema_beat4: "o movimento da árvore era natural, eu sentia — me movia junto com a árvore, eu e ela éramos apenas um.",
    poema_beat5: "A meditação sempre existiu, nesta casa que eu encontrei ela,",
    poema_beat6: "a música dos galhos, o conforto com a natureza, o movimento, o ar fresco,",
    poema_beat7: "dentro dela, abrigado do sol, fui crescendo, eu ela, cada galho era uma parte de mim,",
    poema_beat8: "quando chovia, eu ficava escorregadio, galhos molhados, abrigo úmido, eu tinha que me ver por fora.",
    poema_beat9: "Verde musgo, os insetos que habitavam em mim picavam sem saber onde ir, eu estava numa estação diferente, folhas molhadas,",
    poema_beat10: "quando eu me balançava, uma outra chuva caía sobre o chão e molhava a terra,",
    poema_beat11: "alimentando cada vez mais as minhas raízes, mais por fora do que por dentro,",
    poema_beat12: "a chuva era outra parte de mim regressando e me ajudando a crescer.",
    poema_quote: "Isso é o que tento devolver com o NeuroMedit — presença.",
    poema_quote_note: "A árvore virou casa, a casa virou método. O resto do caminho está no meu portfólio."
  });

  /* ---------- EN ---------- */
  window.PortfolioTranslations.en = Object.assign({}, window.PortfolioTranslations.en, {
    common_skip: "Skip to content",
    common_nav_casos: "Work",
    common_nav_sobre: "About",
    common_nav_contato: "Contact",
    common_lang_aria: "Choose language",
    common_h_pesquisa: "Research",
    common_h_abordagem: "Approach",
    common_h_papel: "My role",
    common_h_contexto: "Context",
    common_footer: "© 2026 Lucas Nunes · Lisbon, Portugal.",

    idx_hero_eyebrow: "UX Design · NeuroMedit · Hospitality",
    idx_hero_h1_pre: "UX design, meditation, and",
    idx_hero_h1_em: "human care",
    idx_hero_text: "I'm Lucas Nunes — a UX design student and the creator of NeuroMedit. I design interfaces, sessions, and service the same way: cut the noise, bring back presence.",
    idx_hero_cta_casos: "See the work",
    idx_hero_cta_contato: "Let's talk",
    idx_open_chip: "Open to UX/UI, front-end, and human-centered product work",
    idx_hero_photo_cap: "Lisbon, Portugal",
    idx_hero_photo_alt: "Portrait of Lucas Nunes",
    idx_photo_placeholder: "Your photo here — save it as lucas-foto.jpg in this folder",

    idx_case1_tag: "Own product · 2025–2026",
    idx_case2_title: "Hospitality as user research",
    idx_case2_tag: "Lisbon & Brazil · 2019–2024",
    idx_case3_title: "Designing for low cognitive load",
    idx_case3_tag: "In progress · 2024–2026",
    idx_case4_title: "UX trends for 2026",
    idx_case4_tag: "Original research · 2026",

    idx_c1_h2: "Cut the noise, bring back presence",
    idx_c1_tag: "Case 01 · NeuroMedit",
    idx_c1_intro: "Most meditation apps tell you to relax — then bury you in choices first. Content libraries demand decisions, visual systems compete for attention, and the first task is never meditating: it's choosing, filtering, comparing. For someone arriving exhausted, that's the opposite of relief.",
    idx_c1_pesquisa_p: "I compared the onboarding of apps like Calm and Headspace: even with great visual polish, they still demand navigation and decisions before the first guided breath.",
    idx_c1_abordagem_p: "I treated the moment before meditation as part of the meditation. Breathing became an interface transition, not decoration — an \"airlock\" between browsing mode and practice mode.",
    idx_c1_papel_p: "Research, script, visual system (the breath-wave symbol), and front-end — solo, from the first phone recording to the live product.",
    idx_c1_flow_title: "The flow, in seven steps",
    idx_flow_1: "Overwhelmed",
    idx_flow_2: "Arrival",
    idx_flow_3: "Breath",
    idx_flow_4: "Airlock",
    idx_flow_5: "Meditation",
    idx_flow_6: "Reflection",
    idx_flow_7: "Calm",
    idx_c1_learn_1: "Calm can be designed structurally, not just visually.",
    idx_c1_learn_2: "Cognitive overload increases resistance, even with good intentions.",
    idx_c1_learn_3: "Simplicity isn't emptiness — it's clarity.",
    idx_c1_result: "Result: a <strong>live</strong> product, with real guided sessions and its own visual system.",
    idx_c1_link_visit: "Visit NeuroMedit ↗",
    idx_c1_link_case: "Read the full case study →",
    idx_audio_play_label: "Play meditation sample",
    idx_audio_pause_label: "Pause meditation sample",
    idx_audio_title: "Meditation sample",
    idx_audio_status_default: "NeuroMedit's opening breath · 4:25",
    idx_c1_link_poema: "The origin: the tree poem →",

    idx_c2_tag: "Case 02 · Hospitality",
    idx_c2_context_p: "Years behind the counter in Lisbon and Brazil, alongside colleagues from Cape Verde, Mozambique, and Angola. Customers passing through, seconds to build trust.",
    idx_c2_approach_p: "I learned to read signals fast: tone of voice, posture, what someone didn't say. Every interaction became a small behavioral study — the same instinct I now bring to user research.",
    idx_c2_role_p: "Direct customer service, in two languages, in high-volume settings with little room for error.",
    idx_c2_result: "Result: visitors who <strong>became regulars</strong> — and the foundation of how I see as a designer.",

    idx_c3_tag: "Case 03 · UX Design",
    idx_c3_context_p: "I started UX design school after years of coding and customer service. I wanted to combine both: system logic and reading people.",
    idx_c3_approach_p: "One decision per screen, clear hierarchy, text that asks nothing of you. This principle shaped NeuroMedit's script — and shapes the very page you're reading now.",
    idx_c3_role_p: "Research, wireframes, prototyping, and interface design — solo, from zero to a published product.",
    idx_c3_result: "Result: a <strong>method</strong> I apply to everything I build, not just a theory.",
    idx_c3_link: "See this page as the example ↑",

    idx_c4_h2: "Where user experience is headed in 2026",
    idx_c4_tag: "Case 04 · Original research",
    idx_c4_intro: "Before designing further, I stopped to research properly: where the thumb reaches best on mobile, where the eye goes first on desktop, which button shape converts more, and what actually changes for screen-reader users. Then I applied every finding to this very page — and audited NeuroMedit by the same standard.",
    idx_c4_pesquisa_p: "Thumb reach zones on mobile, F- and Z-pattern reading on desktop, button shape and conversion, and the accessibility rules of WCAG 2.2 / the European Accessibility Act.",
    idx_c4_abordagem_p: "No loose opinions: I measured the real contrast of my portfolio's and NeuroMedit's colors against the official WCAG formula before changing anything — and found real failures in both.",
    idx_c4_papel_p: "Research, contrast calculations, writing the study, and implementing the fixes — on both products, with approval before touching NeuroMedit in production.",
    idx_c4_result: "Result: <strong>12 contrast fixes</strong> shipped to production, plus a thumb-zone CTA, skip link, and touch targets on my own portfolio.",
    idx_c4_link: "Read the full study →",

    idx_about_eyebrow: "About me",
    idx_about_h2: "From the São Francisco River to Lisbon",
    idx_about_p1: "I was born in Paulo Afonso, Bahia, on the river's edge. At 16, I paid for my own Spanish classes working at a library — and I already meditated every morning.",
    idx_about_p2: "In 2022 I crossed Brazil by bus, then the Atlantic, and started over in Lisbon with €800. Today I'm a UX design student, I volunteer at a yoga center, and I still guide meditations — now for far more people than I imagined.",

    idx_tl_2002_title: "Paulo Afonso, Bahia",
    idx_tl_2002_desc: "Born on the banks of the São Francisco River.",
    idx_tl_2016_title: "The library",
    idx_tl_2016_desc: "Paying for Spanish school with my own wages.",
    idx_tl_2022_title: "The crossing",
    idx_tl_2022_desc: "Brazil by bus, then the Atlantic. I arrive in Lisbon.",
    idx_tl_2023_title: "Behind the counter",
    idx_tl_2023_desc: "Hospitality in Lisbon; people become a specialty.",
    idx_tl_2024_title: "Training",
    idx_tl_2024_desc: "UX design school and work, side by side.",
    idx_tl_2025_title: "NeuroMedit",
    idx_tl_2025_desc: "The project is born, during a sabbatical.",
    idx_tl_2026_title: "Today",
    idx_tl_2026_desc: "UX design, yoga, and meditation, side by side.",

    idx_contact_eyebrow: "Let's talk",
    idx_contact_h2: "If my path resonates with you, write to me.",
    idx_contact_p: "I answer personally — about a project, a role, a meditation, or just to talk.",
    idx_contact_cta_email: "Write to me",
    idx_contact_cta_linkedin: "Connect on LinkedIn",
    idx_social_email: "Email",

    cs_back: "← Back to portfolio",
    cs_eyebrow_hero: "UX Case Study",
    cs_subtitle: "Designing a low cognitive-load meditation experience.",
    cs_hero_body: "Most meditation apps ask you to relax — and overload you with choices before you get there. This is the process behind an app that treats the moment before meditation as part of the meditation itself.",
    cs_tag_ux: "UX Design",
    cs_tag_emotional: "Emotional Design",
    cs_tag_cognitive: "Cognitive Load",
    cs_tag_frontend: "Front-End",
    cs_cta_explore: "Explore the process ↓",
    cs_cta_live: "View live project ↗",

    cs_eyebrow_01: "01 · Research & Framing",
    cs_h2_01: "Starting with the wrong question",
    cs_01_p1: "Meditation apps are usually judged by their content library — how many sessions, how many voices, how many themes. I started there too, and it was the wrong place to start.",
    cs_01_p2: "The real friction wasn't the content. It was everything a stressed person has to do before reaching it: open the app, read a menu, compare categories, make a decision. For someone who opened the app because they were already overwhelmed, that sequence is a second source of overwhelm.",
    cs_01_p3: "So I reframed the problem. Instead of asking \"what content should this app have,\" I asked \"what does someone in a dysregulated state need from an interface in the first ten seconds.\" That question shaped everything that followed.",

    cs_eyebrow_02: "02 · Research Synthesis",
    cs_h2_02: "Calm is a structural problem, not a visual one",
    cs_02_p1: "Soft colors and slow animations can suggest calm, but they don't produce it if the person still has to think, choose, and navigate before their first breath. Visual calm and cognitive calm are different things, and most meditation products only design for the first one.",
    cs_quote: "Calm isn't a color palette. It's the absence of unnecessary decisions.",
    cs_02_p2: "That insight became the design thesis for NeuroMedit: reduce the number of decisions between \"I opened the app\" and \"I am breathing,\" and treat every screen in between as a transition, not a destination.",
    cs_02_p3: "This meant looking past aesthetics and mapping the emotional and cognitive state of the person on the other side of the screen — before designing a single component.",

    cs_eyebrow_states: "User States",
    cs_h2_states: "Who is actually opening this app",
    cs_states_intro: "Four recurring states kept surfacing in research — each with a different emotional entry point, a different cognitive pain point, and a different opportunity for the interface to help rather than add friction.",
    cs_label_emotional: "Emotional state",
    cs_label_cognitive: "Cognitive pain point",
    cs_label_opportunity: "UX opportunity",
    cs_state1_title: "Overwhelmed",
    cs_state1_emotional: "Anxious, scattered, mentally \"loud.\"",
    cs_state1_cognitive: "Any menu feels like one more demand.",
    cs_state1_opportunity: "Remove choice entirely at entry — offer one obvious next step.",
    cs_state2_title: "Depleted",
    cs_state2_emotional: "Tired, low energy, little patience.",
    cs_state2_cognitive: "Reading and comparing options costs effort they don't have.",
    cs_state2_opportunity: "Short, low-effort interactions with generous whitespace.",
    cs_state3_title: "Skeptical",
    cs_state3_emotional: "Curious but guarded, unsure it will help.",
    cs_state3_cognitive: "Overly clinical or overly mystical language breaks trust.",
    cs_state3_opportunity: "Plain, grounded language and visible transparency about the method.",
    cs_state4_title: "Returning",
    cs_state4_emotional: "Familiar with the app, seeking routine.",
    cs_state4_cognitive: "Friction in getting back to what worked before.",
    cs_state4_opportunity: "Fast re-entry to recent or favorite sessions.",

    cs_eyebrow_03: "03 · Benchmark",
    cs_h2_03: "Looking at Calm and Headspace with a critical eye",
    cs_03_intro: "Both are well-crafted products with strong visual systems. The gap I found wasn't in polish — it was in what happens before the first breath.",
    cs_bench_calm_h: "Calm",
    cs_bench_calm_p: "A rich, editorial home screen with multiple content rails. Beautiful, but it asks for a decision before any practice begins — the entry point is a library, not a breath.",
    cs_bench_headspace_h: "Headspace",
    cs_bench_headspace_p: "Friendlier and more guided than Calm, with onboarding that nudges toward a first session. Still, the main navigation surfaces categories and courses before any calming action.",
    cs_bench_insight_h: "Insight",
    cs_bench_insight_p: "Neither product treats the pre-session moment as part of the emotional arc. Both optimize the library. NeuroMedit optimizes the threshold.",
    cs_carousel_alt_calm: "Calm app home screen, showing multiple content rails and categories",
    cs_carousel_alt_headspace: "Headspace app home screen, showing onboarding and course categories",
    cs_carousel_prev_label: "Previous image",
    cs_carousel_next_label: "Next image",
    cs_carousel_cap_calm: "Calm — entry screen",
    cs_carousel_cap_headspace: "Headspace — entry screen",

    cs_eyebrow_04: "04 · Design Principles",
    cs_h2_04: "Five rules that shaped every screen",
    cs_p1_title: "One decision per screen",
    cs_p1_desc: "Never ask for two choices when one will do.",
    cs_p2_title: "Progressive disclosure",
    cs_p2_desc: "Reveal complexity only when the user is ready for it.",
    cs_p3_title: "Breath as transition",
    cs_p3_desc: "Loading and navigation moments double as regulation cues.",
    cs_p4_title: "Generous whitespace",
    cs_p4_desc: "Space is a feature for a depleted nervous system, not decoration.",
    cs_p5_title: "Honest language",
    cs_p5_desc: "No clinical jargon, no mystical overreach — just plain, grounded words.",

    cs_eyebrow_05: "05 · Exploration",
    cs_h2_05: "From dense wireframes to a single threshold",
    cs_wf1_alt: "Early wireframe with a dense grid of categories and filters",
    cs_wf1_title: "Before",
    cs_wf1_desc: "The first pass mirrored the category-first pattern of Calm and Headspace — familiar, but still frontloaded with decisions.",
    cs_wf2_alt: "Simplified entry screen wireframe with a single primary action",
    cs_wf2_title: "Entry",
    cs_wf2_desc: "Stripped down to one action: begin. Categories moved a layer deeper, reachable but not mandatory.",
    cs_wf3_alt: "Wireframe of the airlock breathing transition screen",
    cs_wf3_title: "Airlock",
    cs_wf3_desc: "A new screen type: a breathing transition between \"arriving\" and \"practicing,\" instead of a menu.",
    cs_decision_h: "Decision Notes",
    cs_decision_p: "The biggest shift wasn't visual — it was structural. I removed an entire navigation layer and replaced it with a single guided step. Early testers consistently described the airlock screen as \"the moment I actually started to relax,\" which confirmed the transition itself needed to be designed, not skipped.",

    cs_eyebrow_06: "06 · User Flow",
    cs_h2_06: "Seven steps, one continuous arc",
    cs_06_intro: "Every step was designed as part of the same emotional curve — from overwhelmed to calm — rather than as separate features.",
    cs_flowd1_desc: "The state the person arrives in — before opening the app.",
    cs_flowd2_desc: "One clear surface, one obvious next step. No menu.",
    cs_flowd3_desc: "A guided breath begins immediately, before any content choice.",
    cs_flowd4_desc: "The transition screen — pacing the shift from navigating to practicing.",
    cs_flowd5_desc: "The guided session itself, free of interface noise.",
    cs_flowd6_desc: "A brief, optional moment to notice what shifted.",
    cs_flowd7_desc: "The intended end state — and the app's only real success metric.",

    cs_eyebrow_07: "07 · Aesthetic Processing",
    cs_h2_07: "Turning a principle into a symbol",
    cs_concept_k: "Concept",
    cs_concept_h3: "Return to calm",
    cs_process_h4: "Symbol exploration",
    cs_process_p: "The visual identity started from the same breathing curve used in the airlock transition — a single continuous line that widens and settles, echoing an inhale and exhale.",
    cs_eq_term1: "Breath curve",
    cs_eq_term2: "Circular calm",
    cs_eq_term3: "Negative space",
    cs_eq_result: "NeuroMedit Symbol",
    cs_rule1_h: "No sharp corners",
    cs_rule1_p: "Every shape resolves into a curve — nothing in the system reads as abrupt.",
    cs_rule2_h: "Single accent per screen",
    cs_rule2_p: "Color is used to guide attention, never to decorate.",
    cs_rule3_h: "Motion is slow by default",
    cs_rule3_p: "Transitions run long enough to be felt, not just seen.",
    cs_rule4_h: "Typography breathes",
    cs_rule4_p: "Generous line-height throughout — text is never dense.",
    cs_rule5_h: "Silence is allowed",
    cs_rule5_p: "Empty space is a valid, intentional state — not a gap to fill.",
    cs_rule6_h: "Consistency over novelty",
    cs_rule6_p: "Familiar patterns reduce the cognitive cost of returning.",
    cs_logo_alt: "NeuroMedit symbol — a continuous breathing curve",
    cs_logo_p: "Final identity: a mark built from the same principle as the product — one continuous, unhurried line.",

    cs_eyebrow_shift: "What Changed During the Process",
    cs_h2_shift: "From feature list to emotional arc",
    cs_shift_p1: "The project started as a fairly conventional content-app brief: build a library, add a player, ship categories. The shift happened when I stopped designing screens and started designing a sequence — treating the whole first-time experience as one continuous emotional arc rather than a set of independent features.",
    cs_shift_p2: "That reframing cut scope in places (a full content-discovery system was postponed) and added scope in others (the airlock transition didn't exist in the original plan at all). Both decisions came directly from watching where people actually needed help.",
    cs_shift_p3: "By the end, the interface had fewer screens than the first draft, not more — and testers reached their first guided breath in roughly a third of the taps.",

    cs_eyebrow_learnings: "Key Learnings",
    cs_h2_learnings: "What this project taught me",
    cs_learn1: "Calm can be designed structurally, not just visually — the sequence of steps matters as much as any color.",
    cs_learn2: "Cognitive overload increases resistance even when the underlying intention is good.",
    cs_learn3: "Simplicity isn't emptiness — it's clarity achieved by removing what doesn't serve the moment.",
    cs_learn4: "A transition screen can do more emotional work than a feature screen, if it's designed with the same care.",
    cs_learn5: "Testing with people in an actual stressed state reveals friction that usability testing in a neutral mood never will.",

    cs_eyebrow_thanks: "Thank You",
    cs_h2_thanks: "For reading this far",
    cs_thanks_p1: "This case study is as much about a design process as it is about a personal one — learning to treat restraint as a design decision, not a limitation.",
    cs_thanks_p2: "NeuroMedit is live today, built and shipped solo: research, visual system, and front-end. It's still growing, and every session it guides is a small test of whether the original thesis holds.",
    cs_opportunity_p: "If you're building a product where the first few seconds matter — onboarding, wellness, or anything where someone arrives overwhelmed — I'd like to hear about it.",
    cs_cta_talk: "Let's talk",
    cs_cta_contact: "Contact via portfolio",
    cs_sign: "With gratitude,<br>Lucas Nunes",

    cs_footer: "© 2026 Lucas Nunes · UX case study, adapted from the original NeuroMedit design documentation.",

    tend_eyebrow: "Case 04 · Original research",
    tend_h1: "Where user experience is headed in 2026",
    tend_lede: "Where the thumb reaches best on mobile. Where the eye goes first on desktop. Which button shape converts more. What actually changes for screen-reader users. I researched all of this before designing further — and applied every finding to this page and to NeuroMedit.",
    tend_meta_link: "See the summary on the portfolio",

    tend_h2_1: "1. General UX trends in 2026",
    tend_1_p1: "Calm design remains the dominant direction: reduced cognitive load, gentle flows, one decision per screen. AI is already in nearly every design tool (93% of designers use it), but the market itself warns against applying it without purpose — the use that pays off is personalization and accessibility, not decoration.",
    tend_1_p2: "Frosted glass (glassmorphism) is back in force — even adopted by Apple and Microsoft for 2026 — but with a serious caveat: text over glass loses contrast easily. Best practice is to keep a text layer that's always legible and turn off transparency when the user's system asks for more contrast.",

    tend_h2_2: "2. The thumb zone (mobile)",
    tend_2_p1: "About 75% of smartphone taps are made with the thumb, without using the other hand. The reach map divides the screen into three zones: green (easy, bottom-center), yellow (requires a stretch), and red (top corners, hard to reach). On large devices, important actions should sit in the bottom third of the screen.",
    tend_2_quote: "\"iOS's camera button sits centered at the bottom because that's the easiest spot to hit, no matter how you hold the phone.\"",
    tend_h3_applied: "Applied on this page",
    tend_2_f1: "<strong>Floating CTA:</strong> a \"Let's talk\" button fixed in the green zone, which only appears once the visitor scrolls past the hero — without competing with the main button.",
    tend_2_f2: "<strong>Touch targets:</strong> every small link (menu, social) now has a minimum tap height of 44px.",

    tend_h2_3: "3. Where the eye goes first (desktop)",
    tend_3_p1: "Eye-tracking studies show two dominant patterns. The <strong style=\"color:var(--ink)\">F</strong> pattern shows up on text-heavy pages: the gaze runs across the top and down the left edge, scanning. The <strong style=\"color:var(--ink)\">Z</strong> pattern shows up on simple pages, like landing pages: from the top-left corner to the call to action in the bottom-right.",
    tend_3_f1: "<strong>Z-shaped hero:</strong> few elements — headline on the left, photo on the right, buttons below — guiding the gaze to the action.",
    tend_3_f2: "<strong>F-shaped cases:</strong> each case block opens with a label and title aligned left, anchoring the gaze at the same starting point every section.",

    tend_h2_4: "4. Button shape and touch targets",
    tend_4_p1: "Rounded rectangles (8–12px) and pill shapes dominate in 2026. Buttons with rounded corners get 17% to 55% more clicks than sharp-cornered ones. The recommended minimum touch target is 44×44px — and since June 28, 2025, the <em>European Accessibility Act</em> legally requires at least 24×24px across the EU (WCAG 2.5.8).",
    tend_4_f1: "<strong>Buttons:</strong> radius increased from 2px to 10px sitewide — closer to the trend that converts best.",
    tend_4_f2: "<strong>Header:</strong> the menu capsule is fully rounded, following the same language as NeuroMedit.",

    tend_h2_5: "5. Accessibility for blind users",
    tend_5_p1: "WCAG 2.2 rests on four principles: Perceivable, Operable, Understandable, and Robust. For screen-reader users, what matters most is: alt text on images, full keyboard navigation, clear labels, and adequate contrast. Since June 2025, the European Accessibility Act has made WCAG 2.2 level AA legally mandatory across the EU — including, for the first time, a minimum touch target size.",
    tend_5_f1: "<strong>\"Skip to content\":</strong> the first focusable element, letting you skip the menu without hearing or tabbing through it every time.",
    tend_5_f2: "<strong>&lt;main&gt; landmark:</strong> all main content sits inside a region navigable by screen readers.",
    tend_5_f3: "<strong>Silenced decorative icons:</strong> purely visual arrows and dots received <code>aria-hidden=\"true\"</code>.",
    tend_5_f4: "<strong>Contrast fixed:</strong> the lightest text colors in the palette were darkened — see the table below.",

    tend_h2_6: "6. Contrast audit — calculated, not estimated",
    tend_6_p1: "Before changing any color, I calculated the real contrast using WCAG's official relative luminance formula. The minimum required is 4.5:1 for normal text and 3:1 for large text (24px+) or interface elements.",
    tend_th_combo: "Combination",
    tend_th_contrast: "Contrast",
    tend_th_result: "Result",
    tend_row1: "Portfolio — old light gray (#948D7C)",
    tend_row2: "Portfolio — fixed light gray (#726A56)",
    tend_row3: "Portfolio — old terracotta (#B4633A)",
    tend_row4: "Portfolio — fixed terracotta (#8A4726)",
    tend_row5: "NeuroMedit — old dark sage (#708f89)",
    tend_row6: "NeuroMedit — fixed dark sage (#517067)",
    tend_row7: "NeuroMedit — old amber (#9e7042)",
    tend_row8: "NeuroMedit — fixed amber (#8a5d34)",
    tend_status_fail: "Failed",
    tend_status_pass: "Passed",
    tend_status_fail_normal: "Failed for normal text",
    tend_table_note: "12 fixes were applied across 10 CSS files in NeuroMedit's production code — the dark themes (sunset, night) already passed comfortably and weren't changed.",

    tend_h2_7: "7. References",
    tend_7_intro: "The sources consulted for this research, by topic:",
    tend_topic_general: "General UX trends",
    tend_topic_thumb: "Thumb zone",
    tend_topic_reading: "Visual reading patterns",
    tend_topic_buttons: "Button design",
    tend_topic_a11y: "Accessibility",
    tend_topic_a11y_target: "Accessibility / touch target",
    tend_topic_glass: "Frosted glass and accessibility",

    tend_cta_eyebrow: "Liked the process?",
    tend_cta_h2: "This is how I approach every project — research first, opinions after.",
    tend_cta_p: "If you want this kind of rigor in your product, write to me.",
    tend_cta_back: "Back to portfolio",

    poema_eyebrow: "Before NeuroMedit",
    poema_h1: "A tree, a house, a meditation",
    poema_lede: "Before any method, there was a tree in the yard. This is the poem that holds NeuroMedit's root.",
    poema_scroll_hint: "Scroll slowly",
    poema_beat1: "It all began with a tree, standing in the yard of the house where I lived.",
    poema_beat2: "I found my home there — a bed, a kitchen, and so much peace,",
    poema_beat3: "meditation was simply being present, listening to the wind slip in through the leaves,",
    poema_beat4: "the tree's sway felt natural to me — I moved with it, until the tree and I were only one.",
    poema_beat5: "Meditation had always lived in this house before I ever found it,",
    poema_beat6: "the music of the branches, the comfort of nature, the motion, the cool air,",
    poema_beat7: "sheltered inside her, safe from the sun, I grew — she and I, every branch a piece of me,",
    poema_beat8: "when it rained I turned slippery, branches soaked, the shelter damp, and I had to see myself from outside.",
    poema_beat9: "Moss green, the insects living inside me stung without knowing where to go, I was in a different season, leaves wet through,",
    poema_beat10: "when I swayed, another rain fell over the ground and soaked the earth,",
    poema_beat11: "feeding my roots more and more, more from without than within,",
    poema_beat12: "the rain was another part of me, returning, helping me grow.",
    poema_quote: "That's what I try to give back with NeuroMedit — presence.",
    poema_quote_note: "The tree became a house, the house became a method. The rest of the path is in my portfolio."
  });

  /* ---------- ES ---------- */
  window.PortfolioTranslations.es = Object.assign({}, window.PortfolioTranslations.es, {
    common_skip: "Saltar al contenido",
    common_nav_casos: "Casos",
    common_nav_sobre: "Sobre mí",
    common_nav_contato: "Contacto",
    common_lang_aria: "Elegir idioma",
    common_h_pesquisa: "Investigación",
    common_h_abordagem: "Enfoque",
    common_h_papel: "Mi rol",
    common_h_contexto: "Contexto",
    common_footer: "© 2026 Lucas Nunes · Lisboa, Portugal.",

    idx_hero_eyebrow: "UX Design · NeuroMedit · Hospitalidad",
    idx_hero_h1_pre: "UX design, meditación y",
    idx_hero_h1_em: "cuidado humano",
    idx_hero_text: "Soy Lucas Nunes — estudiante de UX Design y creador de NeuroMedit. Diseño interfaces, sesiones y atención al cliente bajo el mismo principio: reducir el ruido para devolver presencia.",
    idx_hero_cta_casos: "Ver proyectos",
    idx_hero_cta_contato: "Hablemos",
    idx_open_chip: "Abierto a colaborar en UX/UI, front-end y productos centrados en las personas",
    idx_hero_photo_cap: "Lisboa, Portugal",
    idx_hero_photo_alt: "Retrato de Lucas Nunes",
    idx_photo_placeholder: "Tu foto aquí — guárdala como lucas-foto.jpg en esta misma carpeta",

    idx_case1_tag: "Producto propio · 2025–2026",
    idx_case2_title: "Hospitalidad como investigación de usuarios",
    idx_case2_tag: "Lisboa y Brasil · 2019–2024",
    idx_case3_title: "Diseño con baja carga cognitiva",
    idx_case3_tag: "En formación · 2024–2026",
    idx_case4_title: "Tendencias de UX en 2026",
    idx_case4_tag: "Estudio propio · 2026",

    idx_c1_h2: "Reducir el ruido para devolver presencia",
    idx_c1_tag: "Caso 01 · NeuroMedit",
    idx_c1_intro: "La mayoría de las apps de meditación te piden relajarte — y antes te abruman con decisiones. Las bibliotecas de contenido exigen elegir, los sistemas visuales compiten por tu atención, y la primera tarea nunca es meditar: es elegir, filtrar, comparar. Para quien llega agotado, eso es lo contrario del alivio.",
    idx_c1_pesquisa_p: "Comparé el onboarding de apps como Calm y Headspace: incluso con gran acabado visual, siguen pidiendo navegación y decisiones antes de la primera respiración guiada.",
    idx_c1_abordagem_p: "Traté el momento previo a la meditación como parte de la meditación. La respiración se convirtió en una transición de interfaz, no en decoración — una \"esclusa\" entre el modo de navegar y el modo de practicar.",
    idx_c1_papel_p: "Investigación, guion, sistema visual (el símbolo de la onda respiratoria) y front-end — en solitario, desde la primera grabación en el móvil hasta el producto en vivo.",
    idx_c1_flow_title: "El flujo, en siete pasos",
    idx_flow_1: "Sobrecargado",
    idx_flow_2: "Llegada",
    idx_flow_3: "Respiración",
    idx_flow_4: "Esclusa",
    idx_flow_5: "Meditación",
    idx_flow_6: "Reflexión",
    idx_flow_7: "Calma",
    idx_c1_learn_1: "La calma se puede diseñar de forma estructural, no solo visual.",
    idx_c1_learn_2: "La sobrecarga cognitiva aumenta la resistencia, incluso con buenas intenciones.",
    idx_c1_learn_3: "La simplicidad no es vacío — es claridad.",
    idx_c1_result: "Resultado: un producto <strong>en vivo</strong>, con sesiones guiadas reales y sistema visual propio.",
    idx_c1_link_visit: "Visitar NeuroMedit ↗",
    idx_c1_link_case: "Ver el case study completo →",
    idx_audio_play_label: "Reproducir muestra de meditación",
    idx_audio_pause_label: "Pausar muestra de meditación",
    idx_audio_title: "Muestra de meditación",
    idx_audio_status_default: "La respiración de entrada de NeuroMedit · 4:25",
    idx_c1_link_poema: "El origen: el poema del árbol →",

    idx_c2_tag: "Caso 02 · Hospitalidad",
    idx_c2_context_p: "Años detrás de la barra en Lisboa y Brasil, junto a colegas de Cabo Verde, Mozambique y Angola. Clientes de paso, segundos para generar confianza.",
    idx_c2_approach_p: "Aprendí a leer señales rápido: tono de voz, postura, lo que la persona no dijo. Cada atención se volvió un pequeño estudio de comportamiento — el mismo instinto que hoy aplico en investigación de usuarios.",
    idx_c2_role_p: "Atención directa al cliente, en dos idiomas, en entornos de alto volumen y poco margen de error.",
    idx_c2_result: "Resultado: visitantes que <strong>se volvían habituales</strong> — y la base de mi mirada como diseñador.",

    idx_c3_tag: "Caso 03 · UX Design",
    idx_c3_context_p: "Entré a la facultad de UX Design después de años de programación y atención al cliente. Quería unir ambas cosas: lógica de sistema y lectura de personas.",
    idx_c3_approach_p: "Una decisión por pantalla, jerarquía clara, texto que no exige esfuerzo. Este principio guio el guion de NeuroMedit — y guía esta misma página que estás leyendo.",
    idx_c3_role_p: "Investigación, wireframes, prototipado y diseño de interfaz — en solitario, de cero al producto publicado.",
    idx_c3_result: "Resultado: un <strong>método</strong> que aplico en todo lo que construyo, no solo un principio teórico.",
    idx_c3_link: "Ver esta página como ejemplo ↑",

    idx_c4_h2: "Hacia dónde va la experiencia de usuario en 2026",
    idx_c4_tag: "Caso 04 · Estudio propio",
    idx_c4_intro: "Antes de seguir diseñando, me detuve a investigar a fondo: dónde alcanza mejor el pulgar en móvil, hacia dónde va el ojo primero en escritorio, qué forma de botón convierte más, y qué cambia realmente para quien navega con lector de pantalla. Después apliqué cada hallazgo en esta misma página — y auditué NeuroMedit con la misma regla.",
    idx_c4_pesquisa_p: "Zona de alcance del pulgar en móvil, patrones de lectura en F y Z en escritorio, forma de botón y conversión, y las reglas de accesibilidad de WCAG 2.2 / la Ley Europea de Accesibilidad.",
    idx_c4_abordagem_p: "Nada de opiniones sueltas: medí el contraste real de los colores de mi portafolio y de NeuroMedit con la fórmula oficial de WCAG antes de cambiar nada — y encontré fallos reales en ambos.",
    idx_c4_papel_p: "Investigación, cálculo de contraste, redacción del estudio e implementación de las correcciones — en ambos productos, con aprobación antes de tocar NeuroMedit en producción.",
    idx_c4_result: "Resultado: <strong>12 correcciones de contraste</strong> aplicadas en producción, más un CTA al alcance del pulgar, skip-link y objetivos táctiles en mi portafolio.",
    idx_c4_link: "Leer el estudio completo →",

    idx_about_eyebrow: "Sobre mí",
    idx_about_h2: "Del Río São Francisco a Lisboa",
    idx_about_p1: "Nací en Paulo Afonso, Bahía, a orillas del río. A los 16 años, pagaba mi propia escuela de español trabajando en una biblioteca — y ya meditaba todas las mañanas.",
    idx_about_p2: "En 2022 crucé Brasil en autobús y después el Atlántico, y volví a empezar en Lisboa con 800€. Hoy soy estudiante de UX Design, voluntario en un centro de yoga, y sigo guiando meditaciones — ahora para mucha más gente de la que imaginaba.",

    idx_tl_2002_title: "Paulo Afonso, Bahía",
    idx_tl_2002_desc: "Nazco a orillas del Río São Francisco.",
    idx_tl_2016_title: "La biblioteca",
    idx_tl_2016_desc: "Pago mi escuela de español con mi propio sueldo.",
    idx_tl_2022_title: "La travesía",
    idx_tl_2022_desc: "Brasil en autobús, después el Atlántico. Llego a Lisboa.",
    idx_tl_2023_title: "Detrás de la barra",
    idx_tl_2023_desc: "Hospitalidad en Lisboa; las personas se vuelven mi especialidad.",
    idx_tl_2024_title: "Formación",
    idx_tl_2024_desc: "Facultad de UX Design y trabajo, lado a lado.",
    idx_tl_2025_title: "NeuroMedit",
    idx_tl_2025_desc: "El proyecto nace, durante un año sabático.",
    idx_tl_2026_title: "Hoy",
    idx_tl_2026_desc: "UX Design, yoga y meditación, lado a lado.",

    idx_contact_eyebrow: "Hablemos",
    idx_contact_h2: "Si mi camino tiene sentido para ti, escríbeme.",
    idx_contact_p: "Respondo personalmente — sobre un proyecto, una vacante, una meditación, o solo para conversar.",
    idx_contact_cta_email: "Escríbeme",
    idx_contact_cta_linkedin: "Conectar en LinkedIn",
    idx_social_email: "Correo",

    cs_back: "← Volver al portafolio",
    cs_eyebrow_hero: "Caso de estudio de UX",
    cs_subtitle: "Diseñando una experiencia de meditación con baja carga cognitiva.",
    cs_hero_body: "La mayoría de las apps de meditación te piden relajarte — y antes te abruman con decisiones. Este es el proceso detrás de una app que trata el momento previo a la meditación como parte de la meditación misma.",
    cs_tag_ux: "UX Design",
    cs_tag_emotional: "Diseño Emocional",
    cs_tag_cognitive: "Carga Cognitiva",
    cs_tag_frontend: "Front-End",
    cs_cta_explore: "Explorar el proceso ↓",
    cs_cta_live: "Ver proyecto en vivo ↗",

    cs_eyebrow_01: "01 · Investigación y enfoque",
    cs_h2_01: "Empezando por la pregunta equivocada",
    cs_01_p1: "Las apps de meditación suelen juzgarse por su biblioteca de contenido — cuántas sesiones, cuántas voces, cuántos temas. Yo también empecé por ahí, y era el lugar equivocado para empezar.",
    cs_01_p2: "La fricción real no era el contenido. Era todo lo que una persona estresada tiene que hacer antes de llegar a él: abrir la app, leer un menú, comparar categorías, tomar una decisión. Para alguien que abrió la app porque ya estaba abrumado, esa secuencia es una segunda fuente de agobio.",
    cs_01_p3: "Así que replanteé el problema. En lugar de preguntar \"qué contenido debería tener esta app\", pregunté \"qué necesita alguien en un estado de desregulación de una interfaz en los primeros diez segundos\". Esa pregunta moldeó todo lo que vino después.",

    cs_eyebrow_02: "02 · Síntesis de la investigación",
    cs_h2_02: "La calma es un problema estructural, no visual",
    cs_02_p1: "Los colores suaves y las animaciones lentas pueden sugerir calma, pero no la producen si la persona todavía tiene que pensar, elegir y navegar antes de su primera respiración. La calma visual y la calma cognitiva son cosas distintas, y la mayoría de los productos de meditación solo diseñan para la primera.",
    cs_quote: "La calma no es una paleta de colores. Es la ausencia de decisiones innecesarias.",
    cs_02_p2: "Esa idea se convirtió en la tesis de diseño de NeuroMedit: reducir el número de decisiones entre \"abrí la app\" y \"estoy respirando\", y tratar cada pantalla intermedia como una transición, no como un destino.",
    cs_02_p3: "Esto significó mirar más allá de la estética y mapear el estado emocional y cognitivo de la persona al otro lado de la pantalla — antes de diseñar un solo componente.",

    cs_eyebrow_states: "Estados del usuario",
    cs_h2_states: "Quién abre realmente esta app",
    cs_states_intro: "Cuatro estados recurrentes surgieron en la investigación — cada uno con un punto de entrada emocional distinto, una dificultad cognitiva distinta, y una oportunidad distinta para que la interfaz ayude en lugar de sumar fricción.",
    cs_label_emotional: "Estado emocional",
    cs_label_cognitive: "Dificultad cognitiva",
    cs_label_opportunity: "Oportunidad de UX",
    cs_state1_title: "Abrumado",
    cs_state1_emotional: "Ansioso, disperso, mentalmente \"ruidoso\".",
    cs_state1_cognitive: "Cualquier menú se siente como una exigencia más.",
    cs_state1_opportunity: "Eliminar la elección por completo en la entrada — ofrecer un único paso siguiente obvio.",
    cs_state2_title: "Agotado",
    cs_state2_emotional: "Cansado, con poca energía, poca paciencia.",
    cs_state2_cognitive: "Leer y comparar opciones cuesta un esfuerzo que no tiene.",
    cs_state2_opportunity: "Interacciones cortas y de bajo esfuerzo, con espacio en blanco generoso.",
    cs_state3_title: "Escéptico",
    cs_state3_emotional: "Curioso pero cauteloso, sin certeza de que vaya a ayudar.",
    cs_state3_cognitive: "Un lenguaje demasiado clínico o demasiado místico rompe la confianza.",
    cs_state3_opportunity: "Lenguaje simple y concreto, con transparencia visible sobre el método.",
    cs_state4_title: "Recurrente",
    cs_state4_emotional: "Ya familiarizado con la app, busca rutina.",
    cs_state4_cognitive: "Fricción para volver a lo que ya funcionaba antes.",
    cs_state4_opportunity: "Reingreso rápido a sesiones recientes o favoritas.",

    cs_eyebrow_03: "03 · Benchmark",
    cs_h2_03: "Mirando a Calm y Headspace con ojo crítico",
    cs_03_intro: "Ambos son productos bien construidos, con sistemas visuales sólidos. La brecha que encontré no estaba en el acabado — estaba en lo que pasa antes de la primera respiración.",
    cs_bench_calm_h: "Calm",
    cs_bench_calm_p: "Una pantalla de inicio rica y editorial, con varias líneas de contenido. Hermosa, pero exige una decisión antes de que empiece cualquier práctica — la entrada es una biblioteca, no una respiración.",
    cs_bench_headspace_h: "Headspace",
    cs_bench_headspace_p: "Más amigable y guiado que Calm, con un onboarding que empuja hacia una primera sesión. Aun así, la navegación principal muestra categorías y cursos antes de cualquier acción de calma.",
    cs_bench_insight_h: "Percepción",
    cs_bench_insight_p: "Ninguno de los dos productos trata el momento previo a la sesión como parte del arco emocional. Ambos optimizan la biblioteca. NeuroMedit optimiza el umbral.",
    cs_carousel_alt_calm: "Pantalla de inicio de la app Calm, mostrando varias líneas de contenido y categorías",
    cs_carousel_alt_headspace: "Pantalla de inicio de la app Headspace, mostrando onboarding y categorías de cursos",
    cs_carousel_prev_label: "Imagen anterior",
    cs_carousel_next_label: "Siguiente imagen",
    cs_carousel_cap_calm: "Calm — pantalla de entrada",
    cs_carousel_cap_headspace: "Headspace — pantalla de entrada",

    cs_eyebrow_04: "04 · Principios de diseño",
    cs_h2_04: "Cinco reglas que moldearon cada pantalla",
    cs_p1_title: "Una decisión por pantalla",
    cs_p1_desc: "Nunca pidas dos elecciones cuando una basta.",
    cs_p2_title: "Divulgación progresiva",
    cs_p2_desc: "Revela la complejidad solo cuando el usuario esté listo para ella.",
    cs_p3_title: "La respiración como transición",
    cs_p3_desc: "Los momentos de carga y navegación también funcionan como señales de regulación.",
    cs_p4_title: "Espacio en blanco generoso",
    cs_p4_desc: "El espacio es una función para un sistema nervioso agotado, no decoración.",
    cs_p5_title: "Lenguaje honesto",
    cs_p5_desc: "Nada de jerga clínica, nada de exceso místico — solo palabras simples y concretas.",

    cs_eyebrow_05: "05 · Exploración",
    cs_h2_05: "De wireframes densos a un único umbral",
    cs_wf1_alt: "Wireframe inicial con una cuadrícula densa de categorías y filtros",
    cs_wf1_title: "Antes",
    cs_wf1_desc: "La primera versión reflejaba el patrón de categorías primero de Calm y Headspace — familiar, pero aún cargado de decisiones desde el inicio.",
    cs_wf2_alt: "Wireframe de la pantalla de entrada simplificada, con una única acción principal",
    cs_wf2_title: "Entrada",
    cs_wf2_desc: "Reducida a una sola acción: empezar. Las categorías pasaron a una capa más profunda, accesibles pero no obligatorias.",
    cs_wf3_alt: "Wireframe de la pantalla de transición respiratoria del airlock",
    cs_wf3_title: "Airlock",
    cs_wf3_desc: "Un nuevo tipo de pantalla: una transición respiratoria entre \"llegar\" y \"practicar\", en lugar de un menú.",
    cs_decision_h: "Notas de decisión",
    cs_decision_p: "El mayor cambio no fue visual — fue estructural. Eliminé toda una capa de navegación y la sustituí por un único paso guiado. Los primeros testers describieron sistemáticamente la pantalla del airlock como \"el momento en que realmente empecé a relajarme\", lo que confirmó que la transición en sí necesitaba ser diseñada, no omitida.",

    cs_eyebrow_06: "06 · Flujo del usuario",
    cs_h2_06: "Siete pasos, un único arco continuo",
    cs_06_intro: "Cada paso fue diseñado como parte de la misma curva emocional — de abrumado a calmado — en lugar de como funciones separadas.",
    cs_flowd1_desc: "El estado en que llega la persona — antes de abrir la app.",
    cs_flowd2_desc: "Una superficie clara, un único paso siguiente obvio. Sin menú.",
    cs_flowd3_desc: "Una respiración guiada comienza de inmediato, antes de cualquier elección de contenido.",
    cs_flowd4_desc: "La pantalla de transición — marcando el ritmo del cambio entre navegar y practicar.",
    cs_flowd5_desc: "La sesión guiada en sí, libre de ruido de interfaz.",
    cs_flowd6_desc: "Un momento breve y opcional para notar qué cambió.",
    cs_flowd7_desc: "El estado final buscado — y la única métrica de éxito real de la app.",

    cs_eyebrow_07: "07 · Procesamiento estético",
    cs_h2_07: "Convirtiendo un principio en símbolo",
    cs_concept_k: "Concepto",
    cs_concept_h3: "Regreso a la calma",
    cs_process_h4: "Exploración del símbolo",
    cs_process_p: "La identidad visual partió de la misma curva respiratoria usada en la transición del airlock — una única línea continua que se ensancha y se asienta, haciendo eco de una inhalación y una exhalación.",
    cs_eq_term1: "Curva respiratoria",
    cs_eq_term2: "Calma circular",
    cs_eq_term3: "Espacio negativo",
    cs_eq_result: "Símbolo NeuroMedit",
    cs_rule1_h: "Sin esquinas afiladas",
    cs_rule1_p: "Toda forma se resuelve en una curva — nada en el sistema se percibe como abrupto.",
    cs_rule2_h: "Un único acento por pantalla",
    cs_rule2_p: "El color se usa para guiar la atención, nunca para decorar.",
    cs_rule3_h: "El movimiento es lento por defecto",
    cs_rule3_p: "Las transiciones duran lo suficiente para sentirse, no solo verse.",
    cs_rule4_h: "La tipografía respira",
    cs_rule4_p: "Interlineado generoso en todas partes — el texto nunca es denso.",
    cs_rule5_h: "El silencio está permitido",
    cs_rule5_p: "El espacio vacío es un estado válido e intencional — no un hueco que llenar.",
    cs_rule6_h: "Consistencia por encima de la novedad",
    cs_rule6_p: "Los patrones familiares reducen el costo cognitivo de volver.",
    cs_logo_alt: "Símbolo de NeuroMedit — una curva respiratoria continua",
    cs_logo_p: "Identidad final: una marca construida a partir del mismo principio que el producto — una única línea continua y sin prisa.",

    cs_eyebrow_shift: "Qué cambió durante el proceso",
    cs_h2_shift: "De lista de funciones a arco emocional",
    cs_shift_p1: "El proyecto empezó como un brief bastante convencional de app de contenido: construir una biblioteca, añadir un reproductor, lanzar categorías. El giro ocurrió cuando dejé de diseñar pantallas y empecé a diseñar una secuencia — tratando toda la primera experiencia como un único arco emocional continuo en lugar de un conjunto de funciones independientes.",
    cs_shift_p2: "Ese replanteamiento redujo el alcance en algunos puntos (se pospuso un sistema completo de descubrimiento de contenido) y lo amplió en otros (la transición del airlock no existía en el plan original). Ambas decisiones vinieron directamente de observar dónde la gente realmente necesitaba ayuda.",
    cs_shift_p3: "Al final, la interfaz tenía menos pantallas que el primer borrador, no más — y los testers llegaron a su primera respiración guiada en aproximadamente un tercio de los toques.",

    cs_eyebrow_learnings: "Aprendizajes clave",
    cs_h2_learnings: "Lo que este proyecto me enseñó",
    cs_learn1: "La calma se puede diseñar de forma estructural, no solo visual — la secuencia de pasos importa tanto como cualquier color.",
    cs_learn2: "La sobrecarga cognitiva aumenta la resistencia incluso cuando la intención de fondo es buena.",
    cs_learn3: "La simplicidad no es vacío — es claridad lograda al eliminar lo que no sirve al momento.",
    cs_learn4: "Una pantalla de transición puede hacer más trabajo emocional que una pantalla de funciones, si se diseña con el mismo cuidado.",
    cs_learn5: "Probar con personas en un estado real de estrés revela fricciones que un test de usabilidad en un estado de ánimo neutro nunca revelaría.",

    cs_eyebrow_thanks: "Gracias",
    cs_h2_thanks: "Por leer hasta aquí",
    cs_thanks_p1: "Este caso de estudio trata tanto de un proceso de diseño como de uno personal — aprender a tratar la contención como una decisión de diseño, no como una limitación.",
    cs_thanks_p2: "NeuroMedit está en vivo hoy, construido y lanzado en solitario: investigación, sistema visual y front-end. Todavía está creciendo, y cada sesión que guía es una pequeña prueba de si la tesis original se sostiene.",
    cs_opportunity_p: "Si estás construyendo un producto donde los primeros segundos importan — onboarding, bienestar, o cualquier cosa donde alguien llega abrumado — me encantaría saber de ello.",
    cs_cta_talk: "Hablemos",
    cs_cta_contact: "Contacto por el portafolio",
    cs_sign: "Con gratitud,<br>Lucas Nunes",

    cs_footer: "© 2026 Lucas Nunes · Caso de estudio de UX, adaptado de la documentación de diseño original de NeuroMedit.",

    tend_eyebrow: "Caso 04 · Estudio propio",
    tend_h1: "Hacia dónde va la experiencia de usuario en 2026",
    tend_lede: "Dónde alcanza mejor el pulgar en móvil. Hacia dónde va el ojo primero en escritorio. Qué forma de botón convierte más. Qué cambia de verdad para quien navega con lector de pantalla. Investigué todo esto antes de seguir diseñando — y apliqué cada hallazgo en esta página y en NeuroMedit.",
    tend_meta_link: "Ver resumen en el portafolio",

    tend_h2_1: "1. Tendencias generales de UX en 2026",
    tend_1_p1: "El diseño calmado sigue siendo la dirección dominante: reducción de carga cognitiva, flujos suaves, una decisión por pantalla. La IA ya está en casi todas las herramientas de diseño (el 93% de los diseñadores la usa), pero el propio mercado advierte contra aplicarla sin propósito — el uso que compensa es en personalización y accesibilidad, no como adorno.",
    tend_1_p2: "El vidrio esmerilado (glassmorphism) volvió con fuerza — incluso adoptado por Apple y Microsoft para 2026 — pero con una advertencia seria: el texto sobre vidrio pierde contraste con facilidad. La práctica recomendada es mantener una capa de texto siempre legible y desactivar la transparencia cuando el sistema del usuario pide más contraste.",

    tend_h2_2: "2. La zona del pulgar (móvil)",
    tend_2_p1: "Cerca del 75% de los toques en smartphones se hacen con el pulgar, sin usar la otra mano. El mapa de alcance divide la pantalla en tres zonas: verde (fácil, centro-inferior), amarilla (exige estirar) y roja (esquinas superiores, difícil). En dispositivos grandes, las acciones importantes deben estar en el tercio inferior de la pantalla.",
    tend_2_quote: "\"El botón de cámara de iOS está centrado abajo porque esa es la posición más fácil de alcanzar, sin importar cómo sostengas el teléfono.\"",
    tend_h3_applied: "Aplicado en esta página",
    tend_2_f1: "<strong>CTA flotante:</strong> un botón \"Hablemos\" fijo en la zona verde, que solo aparece cuando el visitante se desplaza más allá del hero — sin competir con el botón principal.",
    tend_2_f2: "<strong>Objetivos táctiles:</strong> todos los enlaces pequeños (menú, redes sociales) ahora tienen un mínimo de 44px de altura de toque.",

    tend_h2_3: "3. Hacia dónde va el ojo primero (escritorio)",
    tend_3_p1: "Los estudios de eye-tracking muestran dos patrones dominantes. El patrón en <strong style=\"color:var(--ink)\">F</strong> aparece en páginas con mucho texto: la mirada recorre la parte superior y baja escaneando el borde izquierdo. El patrón en <strong style=\"color:var(--ink)\">Z</strong> aparece en páginas simples, como landing pages: desde la esquina superior izquierda hasta la llamada a la acción en la esquina inferior derecha.",
    tend_3_f1: "<strong>Hero en Z:</strong> pocos elementos — título a la izquierda, foto a la derecha, botones debajo — guiando la mirada hacia la acción.",
    tend_3_f2: "<strong>Casos en F:</strong> cada bloque de caso comienza con una etiqueta y un título alineados a la izquierda, anclando la mirada en el mismo punto de partida en cada sección.",

    tend_h2_4: "4. Forma de botones y objetivos táctiles",
    tend_4_p1: "Los rectángulos redondeados (8–12px) y las formas de píldora dominan en 2026. Los botones con esquinas redondeadas reciben entre un 17% y un 55% más de clics que los de esquinas rectas. El objetivo táctil mínimo recomendado es 44×44px — y desde el 28 de junio de 2025, la <em>Ley Europea de Accesibilidad</em> exige por ley, en la Unión Europea, un mínimo de 24×24px (WCAG 2.5.8).",
    tend_4_f1: "<strong>Botones:</strong> el radio aumentó de 2px a 10px en toda la página — más cerca de la tendencia que más convierte.",
    tend_4_f2: "<strong>Encabezado:</strong> la cápsula del menú está completamente redondeada, siguiendo el mismo lenguaje que NeuroMedit.",

    tend_h2_5: "5. Accesibilidad para personas ciegas",
    tend_5_p1: "La WCAG 2.2 se apoya en cuatro principios: Perceptible, Operable, Comprensible y Robusto. Para quien usa lector de pantalla, lo más importante es: texto alternativo en imágenes, navegación completa por teclado, etiquetas claras y contraste adecuado. Desde junio de 2025, la Ley Europea de Accesibilidad hizo obligatoria por ley la WCAG 2.2 nivel AA en la UE — incluyendo, por primera vez, un tamaño mínimo de objetivo táctil.",
    tend_5_f1: "<strong>\"Saltar al contenido\":</strong> el primer elemento enfocable, que permite saltar el menú sin tener que escucharlo o tabular por él cada vez.",
    tend_5_f2: "<strong>Landmark &lt;main&gt;:</strong> todo el contenido principal está dentro de una región navegable por lectores de pantalla.",
    tend_5_f3: "<strong>Iconos decorativos silenciados:</strong> las flechas y puntos puramente visuales recibieron <code>aria-hidden=\"true\"</code>.",
    tend_5_f4: "<strong>Contraste corregido:</strong> los colores de texto más claros de la paleta se oscurecieron — ver tabla abajo.",

    tend_h2_6: "6. Auditoría de contraste — calculado, no estimado",
    tend_6_p1: "Antes de cambiar cualquier color, calculé el contraste real con la fórmula oficial de luminancia relativa de WCAG. El mínimo exigido es 4.5:1 para texto normal y 3:1 para texto grande (24px+) o elementos de interfaz.",
    tend_th_combo: "Combinación",
    tend_th_contrast: "Contraste",
    tend_th_result: "Resultado",
    tend_row1: "Portafolio — gris claro antiguo (#948D7C)",
    tend_row2: "Portafolio — gris claro corregido (#726A56)",
    tend_row3: "Portafolio — terracota antiguo (#B4633A)",
    tend_row4: "Portafolio — terracota corregido (#8A4726)",
    tend_row5: "NeuroMedit — verde salvia oscuro antiguo (#708f89)",
    tend_row6: "NeuroMedit — verde salvia oscuro corregido (#517067)",
    tend_row7: "NeuroMedit — ámbar antiguo (#9e7042)",
    tend_row8: "NeuroMedit — ámbar corregido (#8a5d34)",
    tend_status_fail: "Fallaba",
    tend_status_pass: "Aprobado",
    tend_status_fail_normal: "Fallaba en texto normal",
    tend_table_note: "Se aplicaron 12 correcciones en 10 archivos CSS de NeuroMedit en producción — los temas oscuros (sunset, night) ya aprobaban con holgura y no se modificaron.",

    tend_h2_7: "7. Referencias",
    tend_7_intro: "Las fuentes consultadas en esta investigación, por tema:",
    tend_topic_general: "Tendencias generales de UX",
    tend_topic_thumb: "Zona del pulgar",
    tend_topic_reading: "Patrones de lectura visual",
    tend_topic_buttons: "Diseño de botones",
    tend_topic_a11y: "Accesibilidad",
    tend_topic_a11y_target: "Accesibilidad / objetivo táctil",
    tend_topic_glass: "Vidrio esmerilado y accesibilidad",

    tend_cta_eyebrow: "¿Te gustó el proceso?",
    tend_cta_h2: "Así es como pienso cada proyecto — investigación primero, opinión después.",
    tend_cta_p: "Si quieres ese tipo de rigor en tu producto, escríbeme.",
    tend_cta_back: "Volver al portafolio",

    poema_eyebrow: "Antes de NeuroMedit",
    poema_h1: "Un árbol, una casa, una meditación",
    poema_lede: "Antes de cualquier método, hubo un árbol en el patio. Este es el poema que guarda la raíz de NeuroMedit.",
    poema_scroll_hint: "Desplázate despacio",
    poema_beat1: "Todo empezó con un árbol, frente a la casa donde yo vivía.",
    poema_beat2: "Encontré mi hogar allí — una cama, una cocina, y mucha paz,",
    poema_beat3: "la meditación era simplemente estar presente, escuchando cómo el viento entraba por las hojas,",
    poema_beat4: "el vaivén del árbol me parecía natural — me movía junto a él, hasta que el árbol y yo fuimos uno solo.",
    poema_beat5: "La meditación siempre había vivido en esa casa, antes de que yo la encontrara,",
    poema_beat6: "la música de las ramas, el consuelo de la naturaleza, el movimiento, el aire fresco,",
    poema_beat7: "resguardado dentro de ella, a salvo del sol, fui creciendo — ella y yo, cada rama una parte de mí,",
    poema_beat8: "cuando llovía me volvía resbaladizo, ramas mojadas, el refugio húmedo, y tenía que mirarme desde afuera.",
    poema_beat9: "Verde musgo, los insectos que vivían en mí picaban sin saber adónde ir, yo estaba en otra estación, hojas empapadas,",
    poema_beat10: "cuando me mecía, otra lluvia caía sobre el suelo y empapaba la tierra,",
    poema_beat11: "alimentando cada vez más mis raíces, más desde fuera que desde dentro,",
    poema_beat12: "la lluvia era otra parte de mí, que regresaba y me ayudaba a crecer.",
    poema_quote: "Eso es lo que intento devolver con NeuroMedit — presencia.",
    poema_quote_note: "El árbol se volvió casa, la casa se volvió método. El resto del camino está en mi portafolio."
  });

  /* ---------- IT ---------- */
  window.PortfolioTranslations.it = Object.assign({}, window.PortfolioTranslations.it, {
    common_skip: "Vai al contenuto",
    common_nav_casos: "Progetti",
    common_nav_sobre: "Chi sono",
    common_nav_contato: "Contatto",
    common_lang_aria: "Scegli lingua",
    common_h_pesquisa: "Ricerca",
    common_h_abordagem: "Approccio",
    common_h_papel: "Il mio ruolo",
    common_h_contexto: "Contesto",
    common_footer: "© 2026 Lucas Nunes · Lisbona, Portogallo.",

    idx_hero_eyebrow: "UX Design · NeuroMedit · Ospitalità",
    idx_hero_h1_pre: "UX design, meditazione e",
    idx_hero_h1_em: "cura umana",
    idx_hero_text: "Sono Lucas Nunes — studente di UX Design e creatore di NeuroMedit. Progetto interfacce, sessioni e accoglienza con lo stesso principio: ridurre il rumore per restituire presenza.",
    idx_hero_cta_casos: "Vedi i progetti",
    idx_hero_cta_contato: "Parliamone",
    idx_open_chip: "Aperto a collaborazioni in UX/UI, front-end e prodotti centrati sulle persone",
    idx_hero_photo_cap: "Lisbona, Portogallo",
    idx_hero_photo_alt: "Ritratto di Lucas Nunes",
    idx_photo_placeholder: "La tua foto qui — salvala come lucas-foto.jpg in questa stessa cartella",

    idx_case1_tag: "Prodotto proprio · 2025–2026",
    idx_case2_title: "L'ospitalità come ricerca utente",
    idx_case2_tag: "Lisbona e Brasile · 2019–2024",
    idx_case3_title: "Design a basso carico cognitivo",
    idx_case3_tag: "In corso · 2024–2026",
    idx_case4_title: "Tendenze UX nel 2026",
    idx_case4_tag: "Ricerca propria · 2026",

    idx_c1_h2: "Ridurre il rumore per restituire presenza",
    idx_c1_tag: "Caso 01 · NeuroMedit",
    idx_c1_intro: "La maggior parte delle app di meditazione ti chiede di rilassarti — e prima ti travolge di scelte. Le librerie di contenuti impongono decisioni, i sistemi visivi competono per l'attenzione, e il primo compito non è mai meditare: è scegliere, filtrare, confrontare. Per chi arriva esausto, è l'opposto del sollievo.",
    idx_c1_pesquisa_p: "Ho confrontato l'onboarding di app come Calm e Headspace: anche con un'ottima finitura visiva, richiedono ancora navigazione e decisioni prima del primo respiro guidato.",
    idx_c1_abordagem_p: "Ho trattato il momento prima della meditazione come parte della meditazione stessa. Il respiro è diventato una transizione di interfaccia, non una decorazione — una \"camera di equilibrio\" tra la modalità di navigazione e quella di pratica.",
    idx_c1_papel_p: "Ricerca, sceneggiatura, sistema visivo (il simbolo dell'onda respiratoria) e front-end — da solo, dalla prima registrazione col telefono al prodotto online.",
    idx_c1_flow_title: "Il flusso, in sette passi",
    idx_flow_1: "Sopraffatto",
    idx_flow_2: "Arrivo",
    idx_flow_3: "Respiro",
    idx_flow_4: "Camera di equilibrio",
    idx_flow_5: "Meditazione",
    idx_flow_6: "Riflessione",
    idx_flow_7: "Calma",
    idx_c1_learn_1: "La calma può essere progettata a livello strutturale, non solo visivo.",
    idx_c1_learn_2: "Il sovraccarico cognitivo aumenta la resistenza, anche con le migliori intenzioni.",
    idx_c1_learn_3: "La semplicità non è vuoto — è chiarezza.",
    idx_c1_result: "Risultato: un prodotto <strong>online</strong>, con sessioni guidate reali e un sistema visivo proprio.",
    idx_c1_link_visit: "Visita NeuroMedit ↗",
    idx_c1_link_case: "Leggi il case study completo →",
    idx_audio_play_label: "Riproduci il campione di meditazione",
    idx_audio_pause_label: "Metti in pausa il campione",
    idx_audio_title: "Campione di meditazione",
    idx_audio_status_default: "Il respiro d'ingresso di NeuroMedit · 4:25",
    idx_c1_link_poema: "L'origine: la poesia dell'albero →",

    idx_c2_tag: "Caso 02 · Ospitalità",
    idx_c2_context_p: "Anni al bancone a Lisbona e in Brasile, accanto a colleghi di Capo Verde, Mozambico e Angola. Clienti di passaggio, pochi secondi per creare fiducia.",
    idx_c2_approach_p: "Ho imparato a leggere i segnali in fretta: tono di voce, postura, ciò che una persona non diceva. Ogni interazione è diventata un piccolo studio del comportamento — lo stesso istinto che oggi applico nella ricerca utente.",
    idx_c2_role_p: "Servizio diretto al cliente, in due lingue, in contesti ad alto volume e poco margine d'errore.",
    idx_c2_result: "Risultato: visitatori che <strong>diventavano abituali</strong> — e la base del mio sguardo da designer.",

    idx_c3_tag: "Caso 03 · UX Design",
    idx_c3_context_p: "Sono entrato all'università di UX Design dopo anni di programmazione e servizio clienti. Volevo unire le due cose: logica di sistema e lettura delle persone.",
    idx_c3_approach_p: "Una decisione per schermata, gerarchia chiara, testo che non richiede sforzo. Questo principio ha guidato la sceneggiatura di NeuroMedit — e guida questa stessa pagina che stai leggendo.",
    idx_c3_role_p: "Ricerca, wireframe, prototipazione e design d'interfaccia — da solo, da zero al prodotto pubblicato.",
    idx_c3_result: "Risultato: un <strong>metodo</strong> che applico a tutto ciò che costruisco, non solo un principio teorico.",
    idx_c3_link: "Guarda questa pagina come esempio ↑",

    idx_c4_h2: "Dove va l'esperienza utente nel 2026",
    idx_c4_tag: "Caso 04 · Ricerca propria",
    idx_c4_intro: "Prima di continuare a progettare, mi sono fermato a fare una ricerca seria: dove il pollice arriva meglio su mobile, dove va prima l'occhio su desktop, quale forma di pulsante converte di più, e cosa cambia davvero per chi naviga con uno screen reader. Poi ho applicato ogni scoperta a questa stessa pagina — e ho verificato NeuroMedit con lo stesso metro.",
    idx_c4_pesquisa_p: "Zone di raggiungibilità del pollice su mobile, pattern di lettura a F e a Z su desktop, forma dei pulsanti e conversione, e le regole di accessibilità WCAG 2.2 / European Accessibility Act.",
    idx_c4_abordagem_p: "Niente opinioni campate in aria: ho misurato il contrasto reale dei colori del mio portfolio e di NeuroMedit con la formula ufficiale WCAG prima di cambiare qualsiasi cosa — trovando problemi reali in entrambi.",
    idx_c4_papel_p: "Ricerca, calcolo del contrasto, stesura dello studio e implementazione delle correzioni — su entrambi i prodotti, con approvazione prima di intervenire su NeuroMedit in produzione.",
    idx_c4_result: "Risultato: <strong>12 correzioni di contrasto</strong> in produzione, più una CTA a portata di pollice, uno skip-link e target di tocco sul mio portfolio.",
    idx_c4_link: "Leggi lo studio completo →",

    idx_about_eyebrow: "Chi sono",
    idx_about_h2: "Dal Rio São Francisco a Lisbona",
    idx_about_p1: "Sono nato a Paulo Afonso, Bahia, sulle rive del fiume. A 16 anni pagavo da solo la scuola di spagnolo lavorando in una biblioteca — e meditavo già ogni mattina.",
    idx_about_p2: "Nel 2022 ho attraversato il Brasile in autobus e poi l'Atlantico, ricominciando a Lisbona con 800€. Oggi sono studente di UX Design, volontario in un centro yoga, e continuo a guidare meditazioni — ora per molte più persone di quante immaginassi.",

    idx_tl_2002_title: "Paulo Afonso, Bahia",
    idx_tl_2002_desc: "Nasco sulle rive del Rio São Francisco.",
    idx_tl_2016_title: "La biblioteca",
    idx_tl_2016_desc: "Pago la scuola di spagnolo con il mio stipendio.",
    idx_tl_2022_title: "La traversata",
    idx_tl_2022_desc: "Brasile in autobus, poi l'Atlantico. Arrivo a Lisbona.",
    idx_tl_2023_title: "Al bancone",
    idx_tl_2023_desc: "Ospitalità a Lisbona; le persone diventano una specialità.",
    idx_tl_2024_title: "Formazione",
    idx_tl_2024_desc: "Università di UX Design e lavoro, fianco a fianco.",
    idx_tl_2025_title: "NeuroMedit",
    idx_tl_2025_desc: "Il progetto nasce, durante un anno sabbatico.",
    idx_tl_2026_title: "Oggi",
    idx_tl_2026_desc: "UX Design, yoga e meditazione, fianco a fianco.",

    idx_contact_eyebrow: "Parliamone",
    idx_contact_h2: "Se il mio percorso ha senso per te, scrivimi.",
    idx_contact_p: "Rispondo personalmente — per un progetto, una posizione, una meditazione, o solo per fare due chiacchiere.",
    idx_contact_cta_email: "Scrivimi",
    idx_contact_cta_linkedin: "Connettiti su LinkedIn",
    idx_social_email: "Email",

    cs_back: "← Torna al portfolio",
    cs_eyebrow_hero: "Case study UX",
    cs_subtitle: "Progettare un'esperienza di meditazione a basso carico cognitivo.",
    cs_hero_body: "La maggior parte delle app di meditazione ti chiede di rilassarti — e prima ti travolge di scelte. Questo è il processo dietro un'app che tratta il momento prima della meditazione come parte della meditazione stessa.",
    cs_tag_ux: "UX Design",
    cs_tag_emotional: "Design Emozionale",
    cs_tag_cognitive: "Carico Cognitivo",
    cs_tag_frontend: "Front-End",
    cs_cta_explore: "Esplora il processo ↓",
    cs_cta_live: "Vedi il progetto online ↗",

    cs_eyebrow_01: "01 · Ricerca e inquadramento",
    cs_h2_01: "Partire dalla domanda sbagliata",
    cs_01_p1: "Le app di meditazione vengono di solito giudicate per la libreria di contenuti — quante sessioni, quante voci, quanti temi. Ho iniziato anch'io da lì, ed era il punto di partenza sbagliato.",
    cs_01_p2: "L'attrito reale non era il contenuto. Era tutto ciò che una persona stressata deve fare prima di arrivarci: aprire l'app, leggere un menu, confrontare categorie, prendere una decisione. Per chi ha aperto l'app perché già sopraffatto, quella sequenza è una seconda fonte di sovraccarico.",
    cs_01_p3: "Così ho riformulato il problema. Invece di chiedermi \"che contenuti dovrebbe avere questa app\", ho chiesto \"di cosa ha bisogno da un'interfaccia, nei primi dieci secondi, chi si trova in uno stato di disregolazione\". Questa domanda ha plasmato tutto ciò che è seguito.",

    cs_eyebrow_02: "02 · Sintesi della ricerca",
    cs_h2_02: "La calma è un problema strutturale, non visivo",
    cs_02_p1: "Colori tenui e animazioni lente possono suggerire calma, ma non la producono se la persona deve ancora pensare, scegliere e navigare prima del primo respiro. Calma visiva e calma cognitiva sono cose diverse, e la maggior parte dei prodotti di meditazione progetta solo per la prima.",
    cs_quote: "La calma non è una palette di colori. È l'assenza di decisioni superflue.",
    cs_02_p2: "Questa intuizione è diventata la tesi di design di NeuroMedit: ridurre il numero di decisioni tra \"ho aperto l'app\" e \"sto respirando\", trattando ogni schermata intermedia come una transizione, non come una destinazione.",
    cs_02_p3: "Questo ha significato guardare oltre l'estetica e mappare lo stato emotivo e cognitivo della persona dall'altra parte dello schermo — prima di progettare un singolo componente.",

    cs_eyebrow_states: "Stati dell'utente",
    cs_h2_states: "Chi apre davvero questa app",
    cs_states_intro: "Nella ricerca sono emersi quattro stati ricorrenti — ognuno con un diverso punto di ingresso emotivo, un diverso punto dolente cognitivo, e una diversa opportunità per l'interfaccia di aiutare invece di aggiungere attrito.",
    cs_label_emotional: "Stato emotivo",
    cs_label_cognitive: "Punto dolente cognitivo",
    cs_label_opportunity: "Opportunità UX",
    cs_state1_title: "Sopraffatto",
    cs_state1_emotional: "Ansioso, disperso, mentalmente \"rumoroso\".",
    cs_state1_cognitive: "Qualsiasi menu sembra un'altra richiesta.",
    cs_state1_opportunity: "Eliminare completamente la scelta all'ingresso — offrire un unico passo successivo ovvio.",
    cs_state2_title: "Sfinito",
    cs_state2_emotional: "Stanco, poca energia, poca pazienza.",
    cs_state2_cognitive: "Leggere e confrontare opzioni costa uno sforzo che non ha.",
    cs_state2_opportunity: "Interazioni brevi e a basso sforzo, con ampio spazio bianco.",
    cs_state3_title: "Scettico",
    cs_state3_emotional: "Curioso ma guardingo, non sicuro che possa aiutare.",
    cs_state3_cognitive: "Un linguaggio troppo clinico o troppo mistico rompe la fiducia.",
    cs_state3_opportunity: "Linguaggio semplice e concreto, con trasparenza visibile sul metodo.",
    cs_state4_title: "Ricorrente",
    cs_state4_emotional: "Ha già familiarità con l'app, cerca una routine.",
    cs_state4_cognitive: "Attrito nel tornare a ciò che ha già funzionato prima.",
    cs_state4_opportunity: "Rientro rapido alle sessioni recenti o preferite.",

    cs_eyebrow_03: "03 · Benchmark",
    cs_h2_03: "Guardare Calm e Headspace con occhio critico",
    cs_03_intro: "Entrambi sono prodotti ben realizzati, con sistemi visivi solidi. Il divario che ho trovato non era nella rifinitura — era in ciò che accade prima del primo respiro.",
    cs_bench_calm_h: "Calm",
    cs_bench_calm_p: "Una home ricca ed editoriale, con più fasce di contenuto. Bella, ma richiede una decisione prima che inizi qualsiasi pratica — l'ingresso è una libreria, non un respiro.",
    cs_bench_headspace_h: "Headspace",
    cs_bench_headspace_p: "Più amichevole e guidato di Calm, con un onboarding che spinge verso una prima sessione. Ciononostante, la navigazione principale mostra categorie e corsi prima di qualsiasi azione calmante.",
    cs_bench_insight_h: "Intuizione",
    cs_bench_insight_p: "Nessuno dei due prodotti tratta il momento pre-sessione come parte dell'arco emotivo. Entrambi ottimizzano la libreria. NeuroMedit ottimizza la soglia.",
    cs_carousel_alt_calm: "Schermata home dell'app Calm, con più fasce di contenuto e categorie",
    cs_carousel_alt_headspace: "Schermata home dell'app Headspace, con onboarding e categorie di corsi",
    cs_carousel_prev_label: "Immagine precedente",
    cs_carousel_next_label: "Immagine successiva",
    cs_carousel_cap_calm: "Calm — schermata di ingresso",
    cs_carousel_cap_headspace: "Headspace — schermata di ingresso",

    cs_eyebrow_04: "04 · Principi di design",
    cs_h2_04: "Cinque regole che hanno plasmato ogni schermata",
    cs_p1_title: "Una decisione per schermata",
    cs_p1_desc: "Mai chiedere due scelte quando una basta.",
    cs_p2_title: "Divulgazione progressiva",
    cs_p2_desc: "Rivelare la complessità solo quando l'utente è pronto.",
    cs_p3_title: "Il respiro come transizione",
    cs_p3_desc: "I momenti di caricamento e navigazione funzionano anche come segnali di regolazione.",
    cs_p4_title: "Spazio bianco generoso",
    cs_p4_desc: "Lo spazio è una funzione per un sistema nervoso sfinito, non decorazione.",
    cs_p5_title: "Linguaggio onesto",
    cs_p5_desc: "Niente gergo clinico, niente eccesso mistico — solo parole semplici e concrete.",

    cs_eyebrow_05: "05 · Esplorazione",
    cs_h2_05: "Da wireframe densi a una soglia unica",
    cs_wf1_alt: "Wireframe iniziale con una griglia densa di categorie e filtri",
    cs_wf1_title: "Prima",
    cs_wf1_desc: "La prima versione rispecchiava il pattern a categorie di Calm e Headspace — familiare, ma ancora carico di decisioni fin dall'inizio.",
    cs_wf2_alt: "Wireframe della schermata di ingresso semplificata, con un'unica azione principale",
    cs_wf2_title: "Ingresso",
    cs_wf2_desc: "Ridotta a una sola azione: iniziare. Le categorie sono state spostate un livello più in profondità, raggiungibili ma non obbligatorie.",
    cs_wf3_alt: "Wireframe della schermata di transizione respiratoria dell'airlock",
    cs_wf3_title: "Airlock",
    cs_wf3_desc: "Un nuovo tipo di schermata: una transizione respiratoria tra \"arrivare\" e \"praticare\", invece di un menu.",
    cs_decision_h: "Note sulle decisioni",
    cs_decision_p: "Il cambiamento più grande non è stato visivo — è stato strutturale. Ho rimosso un intero livello di navigazione e l'ho sostituito con un unico passo guidato. I primi tester hanno descritto costantemente la schermata dell'airlock come \"il momento in cui ho davvero iniziato a rilassarmi\", confermando che la transizione stessa andava progettata, non saltata.",

    cs_eyebrow_06: "06 · Flusso dell'utente",
    cs_h2_06: "Sette passi, un unico arco continuo",
    cs_06_intro: "Ogni passo è stato progettato come parte della stessa curva emotiva — da sopraffatto a calmo — anziché come funzionalità separate.",
    cs_flowd1_desc: "Lo stato in cui arriva la persona — prima di aprire l'app.",
    cs_flowd2_desc: "Una superficie chiara, un unico passo successivo ovvio. Nessun menu.",
    cs_flowd3_desc: "Un respiro guidato inizia subito, prima di qualsiasi scelta di contenuto.",
    cs_flowd4_desc: "La schermata di transizione — che scandisce il passaggio dal navigare al praticare.",
    cs_flowd5_desc: "La sessione guidata vera e propria, priva di rumore d'interfaccia.",
    cs_flowd6_desc: "Un momento breve e facoltativo per notare cosa è cambiato.",
    cs_flowd7_desc: "Lo stato finale voluto — e l'unica vera metrica di successo dell'app.",

    cs_eyebrow_07: "07 · Elaborazione estetica",
    cs_h2_07: "Trasformare un principio in un simbolo",
    cs_concept_k: "Concetto",
    cs_concept_h3: "Ritorno alla calma",
    cs_process_h4: "Esplorazione del simbolo",
    cs_process_p: "L'identità visiva è partita dalla stessa curva respiratoria usata nella transizione dell'airlock — un'unica linea continua che si allarga e si assesta, facendo eco a un'inspirazione e un'espirazione.",
    cs_eq_term1: "Curva del respiro",
    cs_eq_term2: "Calma circolare",
    cs_eq_term3: "Spazio negativo",
    cs_eq_result: "Simbolo NeuroMedit",
    cs_rule1_h: "Nessun angolo netto",
    cs_rule1_p: "Ogni forma si risolve in una curva — niente nel sistema risulta brusco.",
    cs_rule2_h: "Un solo accento per schermata",
    cs_rule2_p: "Il colore è usato per guidare l'attenzione, mai per decorare.",
    cs_rule3_h: "Il movimento è lento per impostazione predefinita",
    cs_rule3_p: "Le transizioni durano abbastanza da essere percepite, non solo viste.",
    cs_rule4_h: "La tipografia respira",
    cs_rule4_p: "Interlinea generosa ovunque — il testo non è mai denso.",
    cs_rule5_h: "Il silenzio è ammesso",
    cs_rule5_p: "Lo spazio vuoto è uno stato valido e intenzionale — non un vuoto da riempire.",
    cs_rule6_h: "Coerenza prima della novità",
    cs_rule6_p: "I pattern familiari riducono il costo cognitivo del ritorno.",
    cs_logo_alt: "Simbolo di NeuroMedit — una curva respiratoria continua",
    cs_logo_p: "Identità finale: un marchio costruito sullo stesso principio del prodotto — un'unica linea continua e senza fretta.",

    cs_eyebrow_shift: "Cosa è cambiato durante il processo",
    cs_h2_shift: "Da elenco di funzionalità ad arco emotivo",
    cs_shift_p1: "Il progetto è iniziato come un brief piuttosto convenzionale per un'app di contenuti: costruire una libreria, aggiungere un player, rilasciare categorie. Il cambiamento è avvenuto quando ho smesso di progettare schermate e ho iniziato a progettare una sequenza — trattando l'intera prima esperienza come un unico arco emotivo continuo anziché come un insieme di funzionalità indipendenti.",
    cs_shift_p2: "Questa riformulazione ha ridotto l'ambito in alcuni punti (un sistema completo di scoperta dei contenuti è stato rimandato) e lo ha ampliato in altri (la transizione dell'airlock non esisteva affatto nel piano originale). Entrambe le decisioni sono nate direttamente dall'osservare dove le persone avevano davvero bisogno di aiuto.",
    cs_shift_p3: "Alla fine, l'interfaccia aveva meno schermate rispetto alla prima bozza, non di più — e i tester hanno raggiunto il primo respiro guidato in circa un terzo dei tocchi.",

    cs_eyebrow_learnings: "Apprendimenti chiave",
    cs_h2_learnings: "Cosa mi ha insegnato questo progetto",
    cs_learn1: "La calma può essere progettata a livello strutturale, non solo visivo — la sequenza dei passi conta quanto qualsiasi colore.",
    cs_learn2: "Il sovraccarico cognitivo aumenta la resistenza anche quando l'intenzione di fondo è buona.",
    cs_learn3: "La semplicità non è vuoto — è chiarezza ottenuta rimuovendo ciò che non serve al momento.",
    cs_learn4: "Una schermata di transizione può fare più lavoro emotivo di una schermata funzionale, se progettata con la stessa cura.",
    cs_learn5: "Testare con persone in un reale stato di stress rivela attriti che un test di usabilità in uno stato d'animo neutro non rivelerebbe mai.",

    cs_eyebrow_thanks: "Grazie",
    cs_h2_thanks: "Per essere arrivato fin qui",
    cs_thanks_p1: "Questo case study riguarda tanto un processo di design quanto uno personale — imparare a trattare la sobrietà come una decisione di design, non come un limite.",
    cs_thanks_p2: "NeuroMedit è online oggi, costruito e lanciato in solitaria: ricerca, sistema visivo e front-end. È ancora in crescita, e ogni sessione che guida è un piccolo test di tenuta della tesi originale.",
    cs_opportunity_p: "Se stai costruendo un prodotto in cui i primi secondi contano — onboarding, benessere, o qualsiasi cosa in cui qualcuno arriva sopraffatto — mi piacerebbe saperne di più.",
    cs_cta_talk: "Parliamone",
    cs_cta_contact: "Contatto tramite il portfolio",
    cs_sign: "Con gratitudine,<br>Lucas Nunes",

    cs_footer: "© 2026 Lucas Nunes · Case study UX, adattato dalla documentazione di design originale di NeuroMedit.",

    tend_eyebrow: "Caso 04 · Ricerca propria",
    tend_h1: "Dove va l'esperienza utente nel 2026",
    tend_lede: "Dove il pollice arriva meglio su mobile. Dove va prima l'occhio su desktop. Quale forma di pulsante converte di più. Cosa cambia davvero per chi naviga con uno screen reader. Ho fatto questa ricerca prima di continuare a progettare — e ho applicato ogni scoperta a questa pagina e a NeuroMedit.",
    tend_meta_link: "Vedi il riassunto sul portfolio",

    tend_h2_1: "1. Tendenze generali di UX nel 2026",
    tend_1_p1: "Il design calmo resta la direzione dominante: riduzione del carico cognitivo, flussi delicati, una decisione per schermata. L'IA è già presente in quasi tutti gli strumenti di design (il 93% dei designer la usa), ma lo stesso mercato mette in guardia dall'applicarla senza uno scopo — l'uso che ripaga è nella personalizzazione e nell'accessibilità, non come ornamento.",
    tend_1_p2: "Il vetro smerigliato (glassmorphism) è tornato con forza — adottato anche da Apple e Microsoft per il 2026 — ma con un avvertimento serio: il testo sul vetro perde contrasto facilmente. La pratica consigliata è mantenere uno strato di testo sempre leggibile e disattivare la trasparenza quando il sistema dell'utente richiede più contrasto.",

    tend_h2_2: "2. La zona del pollice (mobile)",
    tend_2_p1: "Circa il 75% dei tocchi sugli smartphone viene effettuato con il pollice, senza usare l'altra mano. La mappa di raggiungibilità divide lo schermo in tre zone: verde (facile, centro-basso), gialla (richiede di allungarsi) e rossa (angoli superiori, difficile). Sui dispositivi grandi, le azioni importanti dovrebbero stare nel terzo inferiore dello schermo.",
    tend_2_quote: "\"Il pulsante della fotocamera di iOS è centrato in basso perché è la posizione più facile da raggiungere, indipendentemente da come tieni il telefono.\"",
    tend_h3_applied: "Applicato in questa pagina",
    tend_2_f1: "<strong>CTA fluttuante:</strong> un pulsante \"Parliamone\" fisso nella zona verde, che appare solo dopo che il visitatore scorre oltre l'hero — senza competere con il pulsante principale.",
    tend_2_f2: "<strong>Target di tocco:</strong> tutti i link piccoli (menu, social) ora hanno un'altezza minima di tocco di 44px.",

    tend_h2_3: "3. Dove va prima l'occhio (desktop)",
    tend_3_p1: "Gli studi di eye-tracking mostrano due pattern dominanti. Il pattern a <strong style=\"color:var(--ink)\">F</strong> compare nelle pagine ricche di testo: lo sguardo scorre in alto e scende lungo il bordo sinistro. Il pattern a <strong style=\"color:var(--ink)\">Z</strong> compare nelle pagine semplici, come le landing page: dall'angolo in alto a sinistra fino alla call to action in basso a destra.",
    tend_3_f1: "<strong>Hero a Z:</strong> pochi elementi — titolo a sinistra, foto a destra, pulsanti sotto — che guidano lo sguardo verso l'azione.",
    tend_3_f2: "<strong>Progetti a F:</strong> ogni blocco progetto inizia con etichetta e titolo allineati a sinistra, ancorando lo sguardo allo stesso punto di partenza in ogni sezione.",

    tend_h2_4: "4. Forma dei pulsanti e target di tocco",
    tend_4_p1: "Rettangoli arrotondati (8–12px) e forme a pillola dominano nel 2026. I pulsanti con angoli arrotondati ricevono dal 17% al 55% di clic in più rispetto a quelli con angoli netti. Il target di tocco minimo consigliato è 44×44px — e dal 28 giugno 2025 l'<em>European Accessibility Act</em> impone per legge, nell'Unione Europea, almeno 24×24px (WCAG 2.5.8).",
    tend_4_f1: "<strong>Pulsanti:</strong> raggio aumentato da 2px a 10px in tutta la pagina — più vicino alla tendenza che converte di più.",
    tend_4_f2: "<strong>Intestazione:</strong> la capsula del menu è completamente arrotondata, seguendo lo stesso linguaggio di NeuroMedit.",

    tend_h2_5: "5. Accessibilità per le persone non vedenti",
    tend_5_p1: "La WCAG 2.2 si basa su quattro principi: Percepibile, Utilizzabile, Comprensibile e Robusto. Per chi usa uno screen reader, ciò che conta di più è: testo alternativo sulle immagini, navigazione completa da tastiera, etichette chiare e contrasto adeguato. Da giugno 2025, l'European Accessibility Act ha reso obbligatoria per legge la WCAG 2.2 livello AA nell'UE — includendo, per la prima volta, una dimensione minima del target di tocco.",
    tend_5_f1: "<strong>\"Vai al contenuto\":</strong> il primo elemento selezionabile, che permette di saltare il menu senza doverlo ascoltare o attraversare ogni volta con il tab.",
    tend_5_f2: "<strong>Landmark &lt;main&gt;:</strong> tutto il contenuto principale si trova in una regione navigabile dagli screen reader.",
    tend_5_f3: "<strong>Icone decorative silenziate:</strong> frecce e punti puramente visivi hanno ricevuto <code>aria-hidden=\"true\"</code>.",
    tend_5_f4: "<strong>Contrasto corretto:</strong> i colori di testo più chiari della palette sono stati scuriti — vedi la tabella sotto.",

    tend_h2_6: "6. Audit del contrasto — calcolato, non stimato",
    tend_6_p1: "Prima di cambiare qualsiasi colore, ho calcolato il contrasto reale con la formula ufficiale di luminanza relativa WCAG. Il minimo richiesto è 4.5:1 per il testo normale e 3:1 per il testo grande (24px+) o gli elementi di interfaccia.",
    tend_th_combo: "Combinazione",
    tend_th_contrast: "Contrasto",
    tend_th_result: "Risultato",
    tend_row1: "Portfolio — grigio chiaro vecchio (#948D7C)",
    tend_row2: "Portfolio — grigio chiaro corretto (#726A56)",
    tend_row3: "Portfolio — terracotta vecchio (#B4633A)",
    tend_row4: "Portfolio — terracotta corretto (#8A4726)",
    tend_row5: "NeuroMedit — salvia scuro vecchio (#708f89)",
    tend_row6: "NeuroMedit — salvia scuro corretto (#517067)",
    tend_row7: "NeuroMedit — ambra vecchio (#9e7042)",
    tend_row8: "NeuroMedit — ambra corretto (#8a5d34)",
    tend_status_fail: "Non superato",
    tend_status_pass: "Superato",
    tend_status_fail_normal: "Non superato per il testo normale",
    tend_table_note: "Sono state applicate 12 correzioni in 10 file CSS di NeuroMedit in produzione — i temi scuri (sunset, night) erano già ampiamente conformi e non sono stati modificati.",

    tend_h2_7: "7. Riferimenti",
    tend_7_intro: "Le fonti consultate per questa ricerca, per argomento:",
    tend_topic_general: "Tendenze generali di UX",
    tend_topic_thumb: "Zona del pollice",
    tend_topic_reading: "Pattern di lettura visiva",
    tend_topic_buttons: "Design dei pulsanti",
    tend_topic_a11y: "Accessibilità",
    tend_topic_a11y_target: "Accessibilità / target di tocco",
    tend_topic_glass: "Vetro smerigliato e accessibilità",

    tend_cta_eyebrow: "Ti è piaciuto il processo?",
    tend_cta_h2: "È così che penso ogni progetto — prima la ricerca, poi l'opinione.",
    tend_cta_p: "Se vuoi questo tipo di rigore nel tuo prodotto, scrivimi.",
    tend_cta_back: "Torna al portfolio",

    poema_eyebrow: "Prima di NeuroMedit",
    poema_h1: "Un albero, una casa, una meditazione",
    poema_lede: "Prima di ogni metodo, c'era un albero in giardino. Questa è la poesia che custodisce la radice di NeuroMedit.",
    poema_scroll_hint: "Scorri lentamente",
    poema_beat1: "Tutto è cominciato con un albero, davanti alla casa dove abitavo.",
    poema_beat2: "Lì ho trovato la mia casa — un letto, una cucina, e tanta pace,",
    poema_beat3: "la meditazione era semplicemente essere presente, ascoltando il vento entrare tra le foglie,",
    poema_beat4: "il movimento dell'albero mi sembrava naturale — mi muovevo insieme a lui, finché l'albero e io fummo una cosa sola.",
    poema_beat5: "La meditazione era sempre vissuta in quella casa, prima ancora che io la trovassi,",
    poema_beat6: "la musica dei rami, il conforto della natura, il movimento, l'aria fresca,",
    poema_beat7: "riparato dentro di lei, al sicuro dal sole, crescevo — lei e io, ogni ramo una parte di me,",
    poema_beat8: "quando pioveva diventavo scivoloso, i rami bagnati, il riparo umido, e dovevo guardarmi da fuori.",
    poema_beat9: "Verde muschio, gli insetti che vivevano in me pungevano senza sapere dove andare, ero in una stagione diversa, foglie fradice,",
    poema_beat10: "quando ondeggiavo, un'altra pioggia cadeva sul terreno e bagnava la terra,",
    poema_beat11: "nutrendo sempre di più le mie radici, più da fuori che da dentro,",
    poema_beat12: "la pioggia era un'altra parte di me, che tornava e mi aiutava a crescere.",
    poema_quote: "Questo è ciò che cerco di restituire con NeuroMedit — presenza.",
    poema_quote_note: "L'albero è diventato casa, la casa è diventata metodo. Il resto del percorso è nel mio portfolio."
  });

  /* ---------- motor de idioma ---------- */

  function getPreferredLanguage() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED_LANGUAGES.indexOf(saved) !== -1) return saved;

    var browserLanguages = Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language || ""];
    var detected = browserLanguages
      .map(function (l) { return l.toLowerCase().split("-")[0]; })
      .filter(function (l) { return SUPPORTED_LANGUAGES.indexOf(l) !== -1; })[0];

    return detected || DEFAULT_LANGUAGE;
  }

  function getCurrentLanguage() {
    var saved = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.indexOf(saved) !== -1 ? saved : getPreferredLanguage();
  }

  function getTranslation(language, key) {
    var dict = window.PortfolioTranslations;
    return (dict[language] && dict[language][key])
      || (dict[DEFAULT_LANGUAGE] && dict[DEFAULT_LANGUAGE][key])
      || ("[" + key + "]");
  }

  function buildLanguageSwitcherMarkup() {
    return (
      '<div class="language-wrapper language-pill" data-language-menu>' +
        '<button class="language-trigger" type="button" aria-label="Choose language" aria-expanded="false" aria-controls="languageOptions" data-language-trigger>' +
          '<span class="language-current" data-language-current>PT</span>' +
          '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/>' +
            '<path d="M3.6 9h16.8M3.6 15h16.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
            '<path d="M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" fill="none" stroke="currentColor" stroke-width="1.7"/>' +
          '</svg>' +
        '</button>' +
        '<div class="language-options" id="languageOptions" role="menu" aria-hidden="true" data-language-options>' +
          '<button type="button" role="menuitem" data-lang-option="pt">PT</button>' +
          '<button type="button" role="menuitem" data-lang-option="en">EN</button>' +
          '<button type="button" role="menuitem" data-lang-option="es">ES</button>' +
          '<button type="button" role="menuitem" data-lang-option="it">IT</button>' +
        '</div>' +
      '</div>'
    );
  }

  function renderLanguageControls() {
    document.querySelectorAll("[data-language-host]").forEach(function (slot) {
      slot.innerHTML = buildLanguageSwitcherMarkup();
    });
  }

  function updateLanguageButtons(language) {
    var selectorLabel = getTranslation(language, "common_lang_aria");

    document.querySelectorAll("[data-language-trigger]").forEach(function (trigger) {
      trigger.setAttribute("aria-label", selectorLabel || "Choose language");
      var current = trigger.querySelector("[data-language-current]");
      if (current) current.textContent = language.toUpperCase();
    });

    document.querySelectorAll("[data-lang-option]").forEach(function (button) {
      var isActive = button.dataset.langOption === language;
      button.classList.toggle("is-active", isActive);
      if (isActive) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  }

  function applyTranslations(language) {
    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      var key = element.dataset.i18n;
      var value = getTranslation(language, key);
      var attrNames = (element.dataset.i18nAttr || "")
        .split(",").map(function (n) { return n.trim(); }).filter(Boolean);

      if (attrNames.length > 0) {
        attrNames.forEach(function (name) { element.setAttribute(name, value); });
        return;
      }

      if (element.hasAttribute("data-i18n-html")) {
        element.innerHTML = value;
      } else {
        element.textContent = value;
      }
    });

    document.documentElement.lang = language;
    updateLanguageButtons(language);
    window.dispatchEvent(new CustomEvent("portfolio:languagechange", { detail: { language: language } }));
  }

  function setLanguage(language) {
    if (SUPPORTED_LANGUAGES.indexOf(language) === -1) return;
    localStorage.setItem(STORAGE_KEY, language);
    applyTranslations(language);
  }

  function bindLanguageSwitcherEvents() {
    var canUseHover = typeof window.matchMedia === "function"
      ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
      : false;

    document.querySelectorAll("[data-language-menu]").forEach(function (menu) {
      var trigger = menu.querySelector("[data-language-trigger]");
      var panel = menu.querySelector("[data-language-options]");
      var options = menu.querySelectorAll("[data-lang-option]");
      var closeTimer = 0;

      function setExpanded(isExpanded) {
        if (!trigger) return;
        menu.classList.toggle("is-open", isExpanded);
        trigger.setAttribute("aria-expanded", String(isExpanded));
        if (panel) panel.setAttribute("aria-hidden", String(!isExpanded));
        options.forEach(function (o) { o.tabIndex = isExpanded ? 0 : -1; });
      }

      function open() { window.clearTimeout(closeTimer); setExpanded(true); }
      function closeNow(opts) {
        window.clearTimeout(closeTimer);
        setExpanded(false);
        if (opts && opts.restoreFocus && trigger) trigger.focus();
      }
      function toggle() {
        if (menu.classList.contains("is-open")) closeNow();
        else open();
      }

      if (trigger) {
        trigger.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });
      }

      if (canUseHover) {
        menu.addEventListener("mouseenter", function () { window.clearTimeout(closeTimer); setExpanded(true); });
        menu.addEventListener("mouseleave", function () {
          if (!menu.contains(document.activeElement)) closeNow();
        });
        menu.addEventListener("focusin", open);
        menu.addEventListener("focusout", function () {
          window.setTimeout(function () {
            if (!menu.contains(document.activeElement)) closeNow();
          }, 0);
        });
      }

      options.forEach(function (button) {
        button.tabIndex = -1;
        button.addEventListener("click", function (e) {
          e.stopPropagation();
          var lang = button.dataset.langOption;
          if (SUPPORTED_LANGUAGES.indexOf(lang) === -1) return;
          setLanguage(lang);
          closeNow();
        });
      });

      document.addEventListener("click", function (e) {
        if (!menu.contains(e.target)) closeNow();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeNow({ restoreFocus: true });
      });
    });
  }

  function initializeI18n() {
    renderLanguageControls();
    bindLanguageSwitcherEvents();
    setLanguage(getPreferredLanguage());
  }

  window.PortfolioI18n = {
    t: function (key) { return getTranslation(getCurrentLanguage(), key); },
    getCurrentLanguage: getCurrentLanguage,
    setLanguage: setLanguage
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeI18n, { once: true });
  } else {
    initializeI18n();
  }
})();
