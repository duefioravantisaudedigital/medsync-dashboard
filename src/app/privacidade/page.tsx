import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
};

type Block =
  | { t: "p"; text: string }
  | { t: "note"; text: string }
  | { t: "groups"; groups: { title: string; items: string[] }[] }
  | { t: "numbered"; items: { n: string; text: string }[] }
  | { t: "pairs"; items: { title: string; desc: string }[] }
  | { t: "bullets"; items: string[] }
  | { t: "list"; items: string[] }
  | { t: "contact"; lines: string[] };

type Doc = {
  title: string;
  lead: string;
  updated: string;
  sections: { h: string; blocks: Block[] }[];
};

// Texto oficial da Política de Privacidade. Não alterar sem aprovação.
const doc: Doc = {
  "title": "Política de Privacidade",
  "lead": "A Due Fioravanti — Saúde Digital respeita a sua privacidade e está comprometida com a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).",
  "updated": "Última atualização: Março de 2026",
  "sections": [
    {
      "h": "1. Quem Somos",
      "blocks": [
        {
          "t": "p",
          "text": "A Due Fioravanti Saúde Digital LTDA (\"Nós\", \"Empresa\"), pessoa jurídica de direito privado, com sede no Brasil, é a controladora dos dados pessoais tratados por meio de suas plataformas digitais de saúde."
        },
        {
          "t": "p",
          "text": "Atuamos como holding médica especializada em direção estratégica, conformidade regulatória e responsabilidade técnica para plataformas digitais de saúde, incluindo telemedicina, prontuário eletrônico e sistemas de apoio à decisão clínica."
        }
      ]
    },
    {
      "h": "2. Dados Pessoais que Coletamos",
      "blocks": [
        {
          "t": "p",
          "text": "Podemos coletar as seguintes categorias de dados pessoais, dependendo da sua interação com nossos serviços:"
        },
        {
          "t": "groups",
          "groups": [
            {
              "title": "Dados de Identificação",
              "items": [
                "Nome completo",
                "CPF / RG",
                "Data de nascimento",
                "Foto de perfil"
              ]
            },
            {
              "title": "Dados de Contato",
              "items": [
                "E-mail",
                "Telefone / WhatsApp",
                "Endereço completo"
              ]
            },
            {
              "title": "Dados de Saúde (Sensíveis)",
              "items": [
                "Histórico médico",
                "Exames e laudos",
                "Prescrições médicas",
                "Diagnósticos e CIDs"
              ]
            },
            {
              "title": "Dados de Navegação",
              "items": [
                "Endereço IP",
                "Tipo de navegador",
                "Cookies e sessão",
                "Páginas visitadas"
              ]
            }
          ]
        },
        {
          "t": "note",
          "text": "Dados sensíveis de saúde são tratados com medidas de segurança reforçadas e somente mediante consentimento explícito ou para tutela da saúde, em conformidade com o Art. 11 da LGPD."
        }
      ]
    },
    {
      "h": "3. Como Utilizamos seus Dados",
      "blocks": [
        {
          "t": "p",
          "text": "Seus dados pessoais são tratados para as seguintes finalidades:"
        },
        {
          "t": "numbered",
          "items": [
            {
              "n": "01",
              "text": "Prestação de serviços de saúde digital, telemedicina e teleconsulta"
            },
            {
              "n": "02",
              "text": "Agendamento de consultas e gerenciamento de prontuários eletrônicos"
            },
            {
              "n": "03",
              "text": "Envio de comunicações relevantes sobre serviços e atualizações"
            },
            {
              "n": "04",
              "text": "Cumprimento de obrigações legais e regulatórias (CFM, ANVISA, ANS)"
            },
            {
              "n": "05",
              "text": "Melhoria contínua da experiência do usuário em nossas plataformas"
            },
            {
              "n": "06",
              "text": "Análises estatísticas e de pesquisa com dados devidamente anonimizados"
            },
            {
              "n": "07",
              "text": "Segurança da informação e prevenção contra fraudes e acessos indevidos"
            },
            {
              "n": "08",
              "text": "Suporte técnico e atendimento ao usuário"
            }
          ]
        }
      ]
    },
    {
      "h": "4. Base Legal para o Tratamento",
      "blocks": [
        {
          "t": "p",
          "text": "O tratamento dos seus dados é fundamentado nas seguintes hipóteses legais previstas na LGPD:"
        },
        {
          "t": "pairs",
          "items": [
            {
              "title": "Consentimento (Art. 7º, I)",
              "desc": "Quando solicitamos e obtemos sua autorização expressa para o tratamento"
            },
            {
              "title": "Execução de Contrato (Art. 7º, V)",
              "desc": "Para viabilizar a prestação dos serviços contratados"
            },
            {
              "title": "Obrigação Legal (Art. 7º, II)",
              "desc": "Para cumprimento de exigências legais e regulatórias do setor de saúde"
            },
            {
              "title": "Tutela da Saúde (Art. 11, II, f)",
              "desc": "Em procedimentos realizados por profissionais de saúde habilitados"
            },
            {
              "title": "Legítimo Interesse (Art. 7º, IX)",
              "desc": "Para aprimorar nossos serviços, respeitando seus direitos fundamentais"
            },
            {
              "title": "Proteção da Vida (Art. 7º, VII)",
              "desc": "Em situações de emergência que exijam acesso imediato a informações de saúde"
            }
          ]
        }
      ]
    },
    {
      "h": "5. Compartilhamento de Dados",
      "blocks": [
        {
          "t": "p",
          "text": "Seus dados pessoais poderão ser compartilhados com:"
        },
        {
          "t": "pairs",
          "items": [
            {
              "title": "Profissionais de Saúde",
              "desc": "Médicos, enfermeiros e demais profissionais envolvidos no seu atendimento, mediante sigilo profissional."
            },
            {
              "title": "Parceiros Tecnológicos",
              "desc": "Provedores de infraestrutura e serviços essenciais ao funcionamento das plataformas, sob contratos com cláusulas de proteção de dados."
            },
            {
              "title": "Autoridades Regulatórias",
              "desc": "Quando exigido por lei, regulamento ou ordem judicial (ex: ANVISA, CFM, Ministério da Saúde)."
            },
            {
              "title": "Operadoras de Saúde",
              "desc": "Quando necessário para autorização de procedimentos ou faturamento, com base contratual."
            }
          ]
        },
        {
          "t": "note",
          "text": "Não vendemos, alugamos ou comercializamos seus dados pessoais com terceiros para fins de marketing."
        }
      ]
    },
    {
      "h": "6. Segurança dos Dados",
      "blocks": [
        {
          "t": "p",
          "text": "Implementamos medidas técnicas e organizacionais para garantir a proteção dos seus dados:"
        },
        {
          "t": "pairs",
          "items": [
            {
              "title": "Criptografia",
              "desc": "Dados protegidos em trânsito (TLS/SSL) e em repouso (AES-256)"
            },
            {
              "title": "Controle de Acesso",
              "desc": "Acesso restrito por perfis e autenticação multifator (MFA)"
            },
            {
              "title": "Infraestrutura Segura",
              "desc": "Servidores em data centers certificados com redundância geográfica"
            },
            {
              "title": "Monitoramento 24/7",
              "desc": "Vigilância contínua contra intrusões e acessos não autorizados"
            },
            {
              "title": "Backup Regular",
              "desc": "Cópias de segurança automatizadas com política de retenção definida"
            },
            {
              "title": "Resposta a Incidentes",
              "desc": "Plano de resposta a incidentes de segurança com notificação à ANPD"
            }
          ]
        }
      ]
    },
    {
      "h": "7. Cookies e Tecnologias de Rastreamento",
      "blocks": [
        {
          "t": "p",
          "text": "Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência:"
        },
        {
          "t": "pairs",
          "items": [
            {
              "title": "Cookies Essenciais",
              "desc": "Necessários para o funcionamento básico do site. Não podem ser desativados."
            },
            {
              "title": "Cookies de Desempenho",
              "desc": "Coletam informações anônimas sobre como você usa o site para melhorias."
            },
            {
              "title": "Cookies de Funcionalidade",
              "desc": "Memorizam suas preferências (idioma, tema) para personalizar sua experiência."
            }
          ]
        },
        {
          "t": "p",
          "text": "Você pode gerenciar suas preferências de cookies a qualquer momento através das configurações do seu navegador."
        }
      ]
    },
    {
      "h": "8. Retenção e Eliminação de Dados",
      "blocks": [
        {
          "t": "p",
          "text": "Seus dados pessoais serão armazenados pelo período necessário para cumprir as finalidades descritas nesta política, observando os seguintes critérios:"
        },
        {
          "t": "bullets",
          "items": [
            "Dados de saúde: mínimo de 20 anos, conforme Resolução CFM nº 1.821/2007",
            "Dados de cadastro: enquanto mantiver vínculo ativo conosco",
            "Dados de navegação: até 6 meses após a coleta",
            "Dados para obrigação legal: pelo prazo exigido pela legislação aplicável"
          ]
        },
        {
          "t": "p",
          "text": "Após o término do período de retenção, os dados serão eliminados ou anonimizados de forma segura e irreversível."
        }
      ]
    },
    {
      "h": "9. Seus Direitos",
      "blocks": [
        {
          "t": "p",
          "text": "Em conformidade com os artigos 17 a 22 da LGPD, você tem o direito de:"
        },
        {
          "t": "list",
          "items": [
            "Confirmar a existência de tratamento dos seus dados pessoais",
            "Acessar seus dados pessoais mantidos por nós",
            "Corrigir dados incompletos, inexatos ou desatualizados",
            "Solicitar anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos",
            "Solicitar a portabilidade dos dados a outro fornecedor de serviço",
            "Solicitar a eliminação dos dados tratados com base no consentimento",
            "Obter informações sobre o compartilhamento de dados com terceiros",
            "Revogar o consentimento a qualquer momento, sem custo",
            "Opor-se ao tratamento que viole a LGPD"
          ]
        }
      ]
    },
    {
      "h": "10. Transferência Internacional de Dados",
      "blocks": [
        {
          "t": "p",
          "text": "Seus dados podem ser armazenados ou processados em servidores localizados fora do Brasil, sempre garantindo nível adequado de proteção conforme exigido pela LGPD (Art. 33). Utilizamos provedores de infraestrutura que possuem certificações internacionais de segurança e cláusulas contratuais padrão aprovadas pela ANPD."
        }
      ]
    },
    {
      "h": "11. Alterações nesta Política",
      "blocks": [
        {
          "t": "p",
          "text": "Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças em nossas práticas ou na legislação aplicável. Notificaremos você sobre alterações significativas por meio de aviso em nosso site ou por e-mail. Recomendamos que revise esta página regularmente."
        }
      ]
    },
    {
      "h": "12. Contato e DPO",
      "blocks": [
        {
          "t": "p",
          "text": "Para exercer seus direitos, esclarecer dúvidas ou registrar reclamações sobre o tratamento de dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados (DPO):"
        },
        {
          "t": "contact",
          "lines": [
            "Due Fioravanti Saúde Digital LTDA",
            "Encarregado de Proteção de Dados (DPO)",
            "E-mail: contato@duefioravanti-saudedigital.com.br",
            "E-mail geral: contato@duefioravanti-saudedigital.com.br"
          ]
        },
        {
          "t": "p",
          "text": "Caso não fique satisfeito com nossa resposta, você tem o direito de apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD)."
        }
      ]
    }
  ]
};

function renderBlock(block: Block, key: number) {
  switch (block.t) {
    case "p":
      return (
        <p key={key} className="text-gray-600 leading-relaxed">
          {block.text}
        </p>
      );
    case "note":
      return (
        <p key={key} className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 leading-relaxed">
          {block.text}
        </p>
      );
    case "groups":
      return (
        <div key={key} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {block.groups.map((group) => (
            <div key={group.title} className="rounded-xl border border-gray-100 bg-white p-4">
              <h3 className="font-semibold text-gray-900">{group.title}</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    case "numbered":
      return (
        <div key={key} className="space-y-3">
          {block.items.map((item) => (
            <div key={item.n} className="flex gap-4">
              <span className="font-semibold text-emerald-700 tabular-nums">{item.n}</span>
              <p className="text-gray-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      );
    case "pairs":
      return (
        <div key={key} className="space-y-3">
          {block.items.map((item) => (
            <div key={item.title} className="rounded-xl border border-gray-100 bg-white p-4">
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      );
    case "bullets":
      return (
        <div key={key} className="space-y-2">
          {block.items.map((item) => (
            <div key={item} className="flex gap-3 text-gray-600 leading-relaxed">
              <span aria-hidden="true">•</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      );
    case "list":
      return (
        <div key={key} className="space-y-2">
          {block.items.map((item) => (
            <p key={item} className="text-gray-600 leading-relaxed">
              {item}
            </p>
          ))}
        </div>
      );
    case "contact":
      return (
        <div key={key} className="rounded-xl border border-gray-100 bg-white p-4 space-y-2">
          {block.lines.map((line, i) => (
            <p key={i} className={i === 0 ? "font-semibold text-gray-900" : "text-gray-600"}>
              {line}
            </p>
          ))}
        </div>
      );
  }
}

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{doc.title}</h1>
        <p className="mt-4 text-gray-600 leading-relaxed">{doc.lead}</p>
        <p className="mt-3 text-sm text-gray-400">{doc.updated}</p>

        <div className="mt-10 space-y-10">
          {doc.sections.map((section) => (
            <section key={section.h} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">{section.h}</h2>
              {section.blocks.map((block, i) => renderBlock(block, i))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
