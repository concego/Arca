# 🐉 Arca - Gerenciador de Lore

A **Arca** é um hub de escrita e organização "Local-First", focado em acessibilidade, autonomia e simplicidade. Criada para mestres de RPG, escritores e roteiristas que precisam de um porto seguro para suas lendas.

## 🚀 Filosofia: Local-First e Acessível

- **Seus dados, seu controle:** Nada de servidores ou logins. A Arca usa a *File System Access API* para abrir pastas diretamente no seu computador ou celular.
- **Markdown Puro:** Tudo é salvo em arquivos `.md` com metadados em YAML (Frontmatter). Compatível com qualquer editor.
- **Foco na Acessibilidade:** Desenvolvida pensando em usuários de leitores de tela (**TalkBack**, **NVDA**). Navegação simplificada via sanfona (Accordion) e atalhos literários.

## ✨ Funcionalidades

- 📁 **Navegação Inteligente:** Pastas organizadas em sanfonas que se fecham automaticamente para reduzir o ruído visual e auditivo.
- ✍️ **Editor Especializado:** 
  - Auto-save de 3 segundos (Debounce).
  - Gaveta de símbolos ocultos (Travessão de diálogo, aspas, etc).
  - Preview renderizado em tempo real com *Marked.js*.
- 📂 **Gestão Contextual:** Crie arquivos e pastas diretamente dentro do diretório em foco.
- 🔄 **Portabilidade via JSON:** Exporte seu projeto inteiro para um único arquivo JSON para sincronizar entre dispositivos (PC ↔ Celular) sem precisar de nuvem.
- 🔗 **Conexões Wiki (Em breve):** Links automáticos baseados nos nomes dos arquivos e tags.

## 🛠️ Como usar

1. Abra a [Arca](https://concego.github.io/Arca/).
2. Clique em **"Abrir Pasta"** e selecione (ou crie) uma pasta no seu dispositivo.
3. Comece a criar sua estrutura de Lore.
4. Para levar o projeto para outro dispositivo, use o botão **"Exportar Projeto (JSON)"** e carregue-o na Arca do outro aparelho.

---
**Desenvolvido por Anderson Carvalho (Eu Concego Jogar) com o apoio da Zapia.**
🐉 *Inclusão Digital através da Tecnologia.*
