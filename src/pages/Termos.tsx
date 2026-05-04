import React from "react";

const Termos = () => {
  return (
    <div className="min-h-screen bg-[#111] text-[#e5e5e5]">
      <div className="max-w-3xl mx-auto px-5 py-10 leading-relaxed">
        <header className="mb-8">
          <div className="text-sm tracking-widest text-[#1DB954] font-bold">⚽ MANIA DE ÁLBUM</div>
          <h1 className="text-3xl sm:text-4xl font-black mt-2 text-white">Termos de Uso</h1>
          <p className="text-sm text-neutral-400 mt-1">Última atualização: 4 de maio de 2026</p>
        </header>

        <p className="mb-6">
          Ao criar uma conta ou utilizar o Mania de Álbum, você concorda com estes Termos de Uso. Leia com atenção antes de usar o aplicativo.
        </p>

        <Section title="1. O que é o Mania de Álbum">
          <p>
            O Mania de Álbum é um aplicativo que ajuda colecionadores a organizar seu álbum de figurinhas da Copa do Mundo 2026, identificar figurinhas repetidas e encontrar outros colecionadores para realizar trocas. O app não é afiliado, patrocinado ou endossado pela FIFA, Panini ou qualquer outra entidade oficial.
          </p>
        </Section>

        <Section title="2. Elegibilidade">
          <p>
            O aplicativo pode ser usado por qualquer pessoa. Usuários menores de 13 anos devem ter autorização e supervisão de um responsável legal para criar uma conta.
          </p>
        </Section>

        <Section title="3. Conta do usuário">
          <ul className="list-disc pl-6 space-y-2">
            <li>Você é responsável por manter a segurança da sua conta e senha.</li>
            <li>Não é permitido criar contas falsas, compartilhar credenciais ou se passar por outra pessoa.</li>
            <li>Você nos autoriza a encerrar contas que violem estes termos, sem aviso prévio.</li>
          </ul>
        </Section>

        <Section title="4. Planos e pagamento">
          <p className="mb-3">💳 O pagamento é único, sem mensalidade ou cobrança recorrente.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>O app oferece um período de teste gratuito de 3 dias com acesso às funcionalidades principais.</li>
            <li>Após o período de teste, é necessário adquirir o plano Básico (R$ 29,90) ou Completo (R$ 49,90) para continuar usando.</li>
            <li>Os pagamentos são processados pela Stripe e estão sujeitos aos termos dela.</li>
            <li>Não oferecemos reembolso após a confirmação do pagamento, exceto nos casos previstos pelo Código de Defesa do Consumidor (Lei nº 8.078/1990), como o direito de arrependimento em até 7 dias corridos após a compra, conforme o art. 49.</li>
            <li>Em caso de solicitação de reembolso dentro do prazo legal, entre em contato pelo e-mail abaixo.</li>
          </ul>
        </Section>

        <Section title="5. Conteúdo criado por usuários">
          <p className="mb-3">Usuários podem cadastrar pontos de troca, eventos e informações de perfil. Ao publicar qualquer conteúdo no app, você declara que:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>O conteúdo é verdadeiro e não induz outros usuários a erro.</li>
            <li>Você não publicará conteúdo ofensivo, ilegal, enganoso ou prejudicial a terceiros.</li>
            <li>Você é o único responsável pelo conteúdo que publicar.</li>
          </ul>
          <p className="mt-3">Nos reservamos o direito de remover qualquer conteúdo que viole estes termos ou que consideremos inadequado, sem necessidade de justificativa.</p>
        </Section>

        <Section title="6. Isenção de responsabilidade — eventos e trocas">
          <p className="mb-3">
            O Mania de Álbum é uma plataforma de conexão entre colecionadores. Não somos parte em nenhuma troca, negociação ou encontro realizado entre usuários.
          </p>
          <p className="mb-2">Não nos responsabilizamos por:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Eventos cadastrados por usuários que sejam cancelados, alterados ou não ocorram</li>
            <li>Perdas, danos, extravios ou conflitos decorrentes de encontros ou trocas entre usuários</li>
            <li>A veracidade das informações publicadas por outros usuários</li>
            <li>Qualquer dano material ou imaterial resultante do uso do aplicativo ou de interações com outros usuários</li>
          </ul>
          <p className="mt-3">Recomendamos sempre preferir locais públicos e movimentados para encontros de troca.</p>
        </Section>

        <Section title="7. Propriedade intelectual">
          <p>
            Todo o conteúdo original do aplicativo — nome, logo, design, código e textos — é propriedade do Mania de Álbum. É proibido copiar, reproduzir ou distribuir qualquer parte do app sem autorização expressa.
          </p>
          <p className="mt-3">
            As imagens de figurinhas e escudos exibidas no app são de propriedade de seus respectivos detentores. O uso é feito para fins informativos dentro do contexto do colecionismo.
          </p>
        </Section>

        <Section title="8. Limitação de responsabilidade">
          <p>
            Na máxima extensão permitida pela lei, o Mania de Álbum não será responsável por danos indiretos, incidentais ou consequenciais decorrentes do uso ou da impossibilidade de uso do aplicativo. Nossa responsabilidade total, em qualquer hipótese, ficará limitada ao valor pago pelo usuário pelo plano contratado.
          </p>
        </Section>

        <Section title="9. Suspensão e encerramento">
          <p>
            Podemos suspender ou encerrar sua conta, com ou sem aviso prévio, caso identifiquemos violação destes termos, uso abusivo da plataforma ou comportamento que prejudique outros usuários ou o funcionamento do app.
          </p>
        </Section>

        <Section title="10. Alterações nos termos">
          <p>
            Podemos atualizar estes termos a qualquer momento. Mudanças relevantes serão comunicadas dentro do app. O uso continuado após a atualização implica aceitação dos novos termos.
          </p>
        </Section>

        <Section title="11. Lei aplicável">
          <p>
            Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de Campinas — SP para resolução de eventuais conflitos, salvo disposição legal em contrário.
          </p>
        </Section>

        <Section title="12. Contato">
          <p>Para dúvidas, solicitações ou reclamações:</p>
          <p className="mt-2">
            E-mail:{" "}
            <a className="text-[#1DB954] underline" href="mailto:contato@maniadealbum.com.br">
              contato@maniadealbum.com.br
            </a>
          </p>
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

export default Termos;
