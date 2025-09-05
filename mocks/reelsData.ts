import type { ReelItem, Comment } from '@/types/reels';

export const reelsData: ReelItem[] = [
  {
    id: '1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    username: 'animalrescuebrasil',
    description: 'A alimentação é a base para a saúde e o bem-estar do seu pet. Uma dieta adequada previne doenças, ajuda a manter o peso ideal e garante mais energia e vitalidade para o seu companheiro de quatro patas! 🐕💚',
    likes: 3600,
    comments: 127,
    shares: 89,
    views: '2.9K',
    hashtags: ['resgateAnimal', 'adoção', 'petcare', 'alimentação'],
    duration: '0:45'
  },
  {
    id: '2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    username: 'petlovers_oficial',
    description: 'Momento fofo do dia! 🥰 Nossos peludos sempre sabem como alegrar nosso dia. Quem mais tem um companheiro assim em casa? Conta nos comentários! ❤️',
    likes: 5200,
    comments: 234,
    shares: 156,
    views: '4.1K',
    hashtags: ['pets', 'amor', 'fofura', 'cachorro'],
    duration: '0:32'
  },
  {
    id: '3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    username: 'veterinaria_dicas',
    description: 'Dica importante: sempre observe o comportamento do seu pet! Mudanças podem indicar problemas de saúde. Na dúvida, consulte sempre um veterinário de confiança 👩‍⚕️🐾',
    likes: 2800,
    comments: 98,
    shares: 67,
    views: '1.8K',
    hashtags: ['veterinária', 'saúde', 'dicas', 'cuidados'],
    duration: '1:12'
  },
  {
    id: '4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    username: 'adote_um_amigo',
    description: 'Cada adoção é uma vida transformada! 🏠💕 Nossos peludos estão esperando por uma família cheia de amor. Venha nos conhecer e encontre seu novo melhor amigo!',
    likes: 4100,
    comments: 189,
    shares: 203,
    views: '3.2K',
    hashtags: ['adoção', 'amor', 'família', 'resgate'],
    duration: '0:58'
  },
  {
    id: '5',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    username: 'treinamento_pets',
    description: 'Treinar seu pet pode ser divertido! 🎾 Com paciência e carinho, qualquer cãozinho pode aprender comandos básicos. Começe devagar e sempre recompense o bom comportamento! 🦴',
    likes: 1900,
    comments: 76,
    shares: 45,
    views: '1.2K',
    hashtags: ['treinamento', 'educação', 'comportamento', 'dicas'],
    duration: '0:41'
  }
];

export const commentsData: Record<string, Comment[]> = {
  '1': [
    {
      id: 'c1',
      username: 'Jéssica Soares',
      text: 'Já sabia algumas coisas sobre isso, mas aprendi muito com essa aula.',
      date: '21 de novembro',
      likes: 2,
    },
    {
      id: 'c2',
      username: 'André Lima',
      text: 'Fiquei com uma dúvida..',
      date: '21 de novembro',
      likes: 0,
    },
    {
      id: 'c3',
      username: 'Maria Santos',
      text: 'Conteúdo muito útil! Obrigada por compartilhar 🙏',
      date: '20 de novembro',
      likes: 5,
    },
  ],
  '2': [
    {
      id: 'c4',
      username: 'Carlos Oliveira',
      text: 'Que fofo! Meu cachorro faz a mesma coisa 😍',
      date: '22 de novembro',
      likes: 8,
    },
    {
      id: 'c5',
      username: 'Ana Paula',
      text: 'Adorei o vídeo! Muito inspirador ❤️',
      date: '21 de novembro',
      likes: 3,
    },
  ],
  '3': [
    {
      id: 'c6',
      username: 'Dr. Roberto',
      text: 'Excelente dica! Como veterinário, confirmo a importância.',
      date: '23 de novembro',
      likes: 12,
    },
  ],
  '4': [
    {
      id: 'c7',
      username: 'Família Silva',
      text: 'Acabamos de adotar um cachorrinho! Muito felizes 🐕',
      date: '22 de novembro',
      likes: 15,
    },
    {
      id: 'c8',
      username: 'Pedro Costa',
      text: 'Trabalho incrível que vocês fazem! Parabéns 👏',
      date: '21 de novembro',
      likes: 7,
    },
  ],
  '5': [
    {
      id: 'c9',
      username: 'Luciana Mendes',
      text: 'Vou tentar essas dicas com meu Golden! Obrigada',
      date: '23 de novembro',
      likes: 4,
    },
  ],
};

export const reactionEmojis = [
  { emoji: '👍', label: 'Curtir' },
  { emoji: '😊', label: 'Feliz' },
  { emoji: '❤️', label: 'Amor' },
  { emoji: '🔥', label: 'Incrível' },
  { emoji: '😂', label: 'Engraçado' },
  { emoji: '👏', label: 'Aplaudir' },
  { emoji: '😍', label: 'Apaixonado' },
  { emoji: '🙌', label: 'Celebrar' },
];
