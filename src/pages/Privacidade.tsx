const Privacidade = () => {
  return (
    <div className="min-h-screen bg-[#111] text-[#e5e5e5]">
      <div className="max-w-3xl mx-auto px-5 py-10 leading-relaxed">
        <header className="mb-8">
          <div className="text-sm tracking-widest text-[#1DB954] font-bold">⚽ MANIA DE ÁLBUM</div>
          <h1 className="text-3xl sm:text-4xl font-black mt-2 text-white">Política de Privacidade</h1>
          <p className="text-sm text-neutral-400 mt-1">Última atualização: 4 de maio de 2026</p>
        </header>

        <p className="mb-6">
          Esta Política de Privacidade descreve como o Mania de Álbum ("nós", "nosso" ou "aplicativo") coleta,
          usa e protege as informações dos usuários. Ao utilizar o aplicativo, você concorda com os termos descritos aqui.
        </p>

        <Section title="1. Quais dados coletamos">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>E-mail:</strong> utilizado para criar e autenticar sua conta.</li>
            <li><strong>Nome e cidade:</strong> informados voluntariamente no perfil, usados para exibição e para a funcionalidade de troca de figurinhas entre usuários próximos.</li>
            <li><strong>Localização:</strong> coletada somente quando você acessa a aba "Locais", para encontrar pontos de troca próximos. Não armazenamos sua localização em nossos servidores.</li>
            <li><strong>Figurinhas do álbum:</strong> os dados sobre quais figurinhas você possui são armazenados para sincronização entre dispositivos.</li>
            <li><strong>Imagens enviadas via câmera:</strong> fotos tiradas para identificação de figurinhas são processadas por inteligência artificial e não são armazenadas após o processamento.</li>
            <li><strong>Dados de pagamento:</strong> processados diretamente pela Stripe. Não armazenamos dados de cartão de crédito.</li>
          </ul>
        </Section>

        <Section title="2. Como usamos os dados">
          <ul className="list-disc pl-6 space-y-2">
            <li>Autenticação e manutenção da sua conta</li>
            <li>Sincronização do seu álbum entre dispositivos</li>
            <li>Exibição de usuários disponíveis para troca na sua região</li>
            <li>Processamento de pagamentos pelo plano premium</li>
            <li>Melhoria do aplicativo com base em uso agregado e anônimo</li>
          </ul>
        </Section>

        <Section title="3. Compartilhamento de dados">
          <p>Não vendemos seus dados. Compartilhamos informações apenas com prestadores de serviço essenciais ao funcionamento do app:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Supabase — banco de dados e autenticação (<a className="text-[#1DB954] underline" href="https://supabase.com/privacy" target="_blank" rel="noreferrer">política de privacidade</a>)</li>
            <li>Stripe — processamento de pagamentos (<a className="text-[#1DB954] underline" href="https://stripe.com/privacy" target="_blank" rel="noreferrer">política de privacidade</a>)</li>
            <li>Anthropic (Claude API) — identificação de figurinhas por IA (<a className="text-[#1DB954] underline" href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noreferrer">política de privacidade</a>)</li>
          </ul>
        </Section>

        <Section title="4. Retenção de dados">
          <p>Seus dados são mantidos enquanto sua conta estiver ativa. Você pode solicitar a exclusão completa da conta e dos dados a qualquer momento pelo e-mail abaixo.</p>
        </Section>

        <Section title="5. Segurança">
          <p>Utilizamos criptografia em trânsito (HTTPS) e em repouso. O acesso aos dados é restrito e monitorado. Nenhum sistema é 100% seguro, mas adotamos as práticas recomendadas do setor.</p>
        </Section>

        <Section title="6. Menores de idade">
          <p>O aplicativo é voltado ao público geral, incluindo crianças acompanhadas por responsáveis. Não coletamos dados de menores de 13 anos de forma intencional. Se identificarmos tal situação, os dados serão excluídos imediatamente.</p>
        </Section>

        <Section title="7. Seus direitos (LGPD)">
          <p>Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou incorretos</li>
            <li>Solicitar a exclusão dos seus dados</li>
            <li>Revogar o consentimento a qualquer momento</li>
          </ul>
          <p className="mt-3">Para exercer qualquer um desses direitos, entre em contato pelo e-mail abaixo.</p>
        </Section>

        <Section title="8. Cookies e armazenamento local">
          <p>Utilizamos localStorage do navegador apenas para preferências locais (ex: tema escuro/claro, banner de instalação). Não utilizamos cookies de rastreamento ou publicidade comportamental.</p>
        </Section>

        <Section title="9. Conteúdo e eventos criados por usuários">
          <p>O Mania de Álbum permite que usuários cadastrem pontos de troca e eventos de figurinhas na plataforma. Todo conteúdo publicado por usuários é de responsabilidade exclusiva de quem o criou.</p>
          <p className="mt-3">O Mania de Álbum não se responsabiliza por:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>A veracidade, segurança ou qualidade dos eventos e pontos de troca cadastrados por usuários</li>
            <li>Encontros, trocas ou negociações realizadas entre usuários, presencialmente ou não</li>
            <li>Perdas, danos, extravios ou conflitos decorrentes de interações entre usuários</li>
            <li>Eventos cancelados, alterados ou que não ocorram conforme anunciado</li>
          </ul>
          <p className="mt-3">Recomendamos que os usuários tomem as devidas precauções ao participar de encontros organizados pela plataforma, como preferir locais públicos e movimentados.</p>
          <p className="mt-3">Conteúdos que violem as diretrizes do aplicativo podem ser removidos a qualquer momento, sem aviso prévio.</p>
        </Section>

        <Section title="10. Alterações nesta política">
          <p>Podemos atualizar esta política periodicamente. Notificaremos os usuários sobre mudanças relevantes dentro do próprio aplicativo. O uso continuado após a atualização implica aceitação dos novos termos.</p>
        </Section>

        <Section title="11. Contato">
          <p>Para dúvidas, solicitações ou reclamações sobre privacidade:</p>
          <p className="mt-2">E-mail: <a className="text-[#1DB954] underline" href="mailto:contato@maniadealbum.com.br">contato@maniadealbum.com.br</a></p>
        </Section>

        <hr className="my-10 border-neutral-800" />
        <p className="text-sm text-neutral-500 text-center">
          <a href="/termos" className="underline text-neutral-400 hover:text-[#1DB954]">Termos de Uso</a>
          {" · "}
          <a href="/privacidade" className="underline text-neutral-400 hover:text-[#1DB954]">Política de Privacidade</a>
        </p>
        <p className="text-sm text-neutral-500 text-center mt-2">
          © 2026 Mania de Álbum. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-[#1DB954] mb-3">{title}</h2>
      <div className="text-neutral-200">{children}</div>
    </section>
  );
}

export default Privacidade;