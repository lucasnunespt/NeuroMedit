/**
 * painel-mensagens.js — uma visualização por dia para o painel do Lucas.
 * Escritas no presente, como se o futuro do NeuroMedit já fosse hoje.
 * A mensagem muda à meia-noite (hora local) e repete o ciclo.
 */
export const MENSAGENS = [
  "Hoje alguém abre o NeuroMedit no fim de um dia pesado e, pela primeira vez na semana, respira devagar. Você desenhou esse momento.",
  "A Casa do Ser tem a agenda cheia de sessões suas. As pessoas chegam tensas, saem leves e voltam no mês seguinte.",
  "Uma pessoa escreve para você: \"Foi a primeira vez que consegui dormir sem o celular na mão.\" Você guarda a mensagem.",
  "O NeuroMedit está em quatro línguas e alguém em Milão medita com a sua voz antes de uma entrevista de emprego.",
  "Você acorda sem pressa. O trabalho que paga as contas é o NeuroMedit, e seu dia tem espaço para criar.",
  "Uma psicóloga recomenda o NeuroMedit aos pacientes porque explica o cérebro antes de pedir que fechem os olhos.",
  "Hoje você grava uma meditação nova e ela já tem lugar na biblioteca: alguém estava esperando por ela.",
  "O painel mostra três pedidos novos. Você confirma cada um com um toque e continua o seu dia em paz.",
  "Um grupo medita consigo no parque, ao fim da tarde. Ninguém olha para o relógio.",
  "As pessoas encontram o NeuroMedit sem anúncios: uma amiga mostra para outra, que mostra para uma terceira.",
  "Você dá uma palestra sobre design que acalma a mente, e a sala inteira fica em silêncio no fim, de propósito.",
  "O resumo do mês chega, e o número é maior do que no mês passado. Você sorri porque cada euro veio de calma real.",
  "Alguém que nunca tinha meditado completa trinta dias. Não por obrigação: porque se sente melhor.",
  "O NeuroMedit tem uma equipe pequena e cuidadosa, e cada pessoa nela acredita no que está a construir.",
  "Hoje você recebe um convite para levar suas sessões a uma empresa que quer cuidar de quem trabalha lá.",
  "Sua voz acompanha alguém num hospital, numa noite longa. Essa pessoa sente-se menos sozinha.",
  "Você olha para trás e vê o caminho: o rio da infância, Lisboa, o produto que existe porque você não desistiu.",
  "Os óculos de realidade virtual estão prontos, e alguém medita dentro da sala escura de luz que você imaginou.",
  "Uma pessoa surda medita lendo as legendas e escreve: \"Finalmente uma meditação para mim também.\"",
  "Você tem tempo para estudar, para treinar, para estar com amigos. O NeuroMedit cresce sem roubar a sua vida.",
  "Hoje uma sessão presencial muda o dia de alguém. Amanhã essa pessoa é mais paciente com quem ama.",
  "O livro, as meditações e o site falam a mesma língua: calma com ciência por baixo. Tudo está ligado.",
  "Alguém em São Paulo descobre o NeuroMedit e sente que foi feito por alguém que entende de onde ela vem.",
  "Você fecha o computador cedo, satisfeito. O que precisava ser feito hoje está feito.",
  "O NeuroMedit é citado como exemplo de tecnologia que devolve a atenção em vez de roubá-la.",
  "Uma pessoa volta para uma sessão presencial com um caderno: escreveu tudo o que mudou desde a primeira.",
  "Você está calmo nas decisões difíceis, porque pratica o que ensina.",
  "Hoje o NeuroMedit chega a alguém exatamente no dia em que mais precisava. Você nunca vai saber quem, e tudo bem.",
  "As contas estão em dia e sobra para investir no que vem a seguir. A segurança te dá espaço para criar.",
  "Você é reconhecido como o designer que junta neurociência e cuidado. As portas se abrem com naturalidade.",
  "Hoje você confia no processo. O que você plantou continua crescendo, mesmo enquanto descansa."
];

export function mensagemDoDia(data = new Date()) {
  const inicio = new Date(data.getFullYear(), 0, 0);
  const dia = Math.floor((data - inicio) / 86400000);
  return MENSAGENS[dia % MENSAGENS.length];
}
