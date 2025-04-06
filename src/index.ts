import { askDeepSeek } from './services/deepseek';

async function main() {
  try {
    const pergunta = "Qual a diferença entre interface e type em TypeScript?";
    console.log('Pergunta:', pergunta);
    
    const resposta = await askDeepSeek(pergunta);
    console.log('Resposta:', resposta);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message);
    } else {
      console.error('Erro desconhecido:', error);
    }
  }
}

main(); 