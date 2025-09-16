# frontend/src/README.md

## Sobre esta pasta
Esta pasta contém todo o código-fonte do frontend React do Paivas Burguers.

- `components/`: Componentes reutilizáveis (ex: CookieConsent, botões, banners)
- `pages/`: Páginas principais do sistema (ex: Login, Cadastro, Privacidade)
- `hooks/`: Hooks customizados para lógica compartilhada
- `contexts/`: Contextos globais de estado
- `styles/`: Estilos globais e temas customizados
- `services/`: Serviços de integração com a API

## Padrão de documentação
- Comente todos os componentes, hooks e páginas em português.
- Explique regras de negócio, integrações e validações nos comentários.
- Sempre que possível, inclua exemplos de uso e props.

## Exemplo de componente documentado
```tsx
// Componente responsável por exibir o banner de consentimento de cookies (LGPD)
const CookieConsent: React.FC = () => { /* ... */ }
```

## Atualização
Mantenha este README atualizado sempre que criar ou alterar arquivos nesta pasta.
