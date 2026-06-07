let currentDirHandle = null;
let currentFileHandle = null;
let saveTimeout = null;

// Referências DOM
const modoNavegacao = document.getElementById('modo-navegacao');
const modoEdicao = document.getElementById('modo-edicao');
const listaArquivos = document.getElementById('lista-arquivos');
const editorContainer = document.getElementById('editor-container');
const editor = document.getElementById('editor');
const previewDiv = document.getElementById('preview');
const nomeArquivoAtual = document.getElementById('nome-arquivo-atual');
const statusSalvamento = document.getElementById('status-salvamento');
const btnExportar = document.getElementById('btn-exportar-json');
const inputJson = document.getElementById('input-json');

// --- NAVEGAÇÃO E PASTAS ---

document.getElementById('btn-abrir-pasta').onclick = async () => {
    try {
        currentDirHandle = await window.showDirectoryPicker();
        btnExportar.classList.remove('hidden');
        document.getElementById('home-acoes').classList.add('hidden');
        await renderizarEstrutura();
    } catch (err) { console.error(err); }
};

async function renderizarEstrutura() {
    listaArquivos.innerHTML = "";
    const estrutura = await lerDiretorio(currentDirHandle);
    estrutura.forEach(item => {
        if (item.tipo === 'pasta') listaArquivos.appendChild(criarSanfona(item));
    });
}

function criarSanfona(pasta) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = `📁 ${pasta.nome}`;
    
    const container = document.createElement('div');
    container.className = "lista-itens";

    pasta.conteudo.forEach(item => {
        if (item.tipo === 'arquivo') {
            const row = document.createElement('div');
            row.className = "item-arquivo";
            const span = document.createElement('span');
            span.textContent = `📄 ${item.nome}`;
            span.onclick = () => abrirArquivo(item.handle);
            
            const btnOpcoes = document.createElement('button');
            btnOpcoes.textContent = "⋮";
            btnOpcoes.onclick = (e) => {
                e.stopPropagation();
                alert("Opções em breve: Mover, Renomear, Excluir");
            };
            
            row.appendChild(span);
            row.appendChild(btnOpcoes);
            container.appendChild(row);
        }
    });

    const divAcoes = document.createElement('div');
    divAcoes.className = "acoes-pasta";
    divAcoes.innerHTML = `
        <button onclick="novoItem('arquivo', '${pasta.caminho}')">+ Arquivo</button>
        <button onclick="novoItem('pasta', '${pasta.caminho}')">+ Pasta</button>
    `;
    container.appendChild(divAcoes);

    details.appendChild(summary);
    details.appendChild(container);

    details.addEventListener('toggle', () => {
        if (details.open) {
            document.querySelectorAll('details').forEach(d => {
                if (d !== details && d.id !== 'gaveta-simbolos') d.open = false;
            });
        }
    });

    return details;
}

async function lerDiretorio(handle, caminhoPai = "") {
    let itens = [];
    for await (const entry of handle.values()) {
        const caminho = caminhoPai ? `${caminhoPai}/${entry.name}` : entry.name;
        if (entry.kind === 'file' && entry.name.endsWith('.md')) {
            itens.push({ tipo: 'arquivo', nome: entry.name, handle: entry, caminho });
        } else if (entry.kind === 'directory') {
            const sub = await lerDiretorio(entry, caminho);
            itens.push({ tipo: 'pasta', nome: entry.name, handle: entry, conteudo: sub, caminho });
        }
    }
    return itens;
}

// --- EDIÇÃO E SALVAMENTO ---

async function abrirArquivo(fileHandle) {
    currentFileHandle = fileHandle;
    const file = await fileHandle.getFile();
    editor.value = await file.text();
    nomeArquivoAtual.textContent = fileHandle.name;
    
    modoNavegacao.classList.add('hidden');
    listaArquivos.classList.add('hidden');
    modoEdicao.classList.remove('hidden');
    editorContainer.classList.remove('hidden');
    editor.focus();
}

document.getElementById('btn-voltar').onclick = () => {
    modoEdicao.classList.add('hidden');
    editorContainer.classList.add('hidden');
    modoNavegacao.classList.remove('hidden');
    listaArquivos.classList.remove('hidden');
    currentFileHandle = null;
};

editor.addEventListener('input', () => {
    statusSalvamento.textContent = "Digitando...";
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(salvarArquivo, 3000);
});

document.getElementById('btn-salvar').onclick = () => {
    clearTimeout(saveTimeout);
    salvarArquivo(true);
};

async function salvarArquivo(manual = false) {
    if (!currentFileHandle) return;
    try {
        const writable = await currentFileHandle.createWritable();
        await writable.write(editor.value);
        await writable.close();
        statusSalvamento.textContent = manual ? "Salvo manualmente!" : "Salvo automaticamente.";
        setTimeout(() => statusSalvamento.textContent = "", 2000);
    } catch (err) { statusSalvamento.textContent = "Erro ao salvar!"; }
}

// --- SÍMBOLOS E ATALHOS ---

window.inserirNoEditor = (inicio, fim = "") => {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const texto = editor.value;
    const selecao = texto.substring(start, end);
    const novo = inicio + selecao + fim;
    editor.value = texto.substring(0, start) + novo + texto.substring(end);
    editor.selectionStart = editor.selectionEnd = (fim && !selecao) ? start + inicio.length : start + novo.length;
    editor.focus();
    editor.dispatchEvent(new Event('input'));
};

document.getElementById('btn-travessao').onclick = () => inserirNoEditor("— ");
document.getElementById('btn-aspas').onclick = () => inserirNoEditor("“", "”");
document.getElementById('btn-paranteses').onclick = () => inserirNoEditor("(", ")");
document.getElementById('btn-negrito').onclick = () => inserirNoEditor("**", "**");
document.getElementById('btn-italico').onclick = () => inserirNoEditor("*", "*");
document.getElementById('btn-citacao').onclick = () => inserirNoEditor("> ");

// --- PREVIEW ---

document.getElementById('btn-toggle-preview').onclick = () => {
    if (previewDiv.classList.contains('hidden')) {
        previewDiv.innerHTML = marked.parse(editor.value);
        previewDiv.classList.remove('hidden');
        editor.classList.add('hidden');
        document.getElementById('btn-toggle-preview').textContent = "Escrita";
        previewDiv.focus();
    } else {
        previewDiv.classList.add('hidden');
        editor.classList.remove('hidden');
        document.getElementById('btn-toggle-preview').textContent = "Preview";
        editor.focus();
    }
};

// --- CRIAÇÃO DE ITENS ---

window.novoItem = async (tipo, caminho) => {
    const nome = prompt(`Nome do(a) novo(a) ${tipo}:`);
    if (!nome) return;
    
    // Localizar o handle da pasta correta
    let pastaHandle = currentDirHandle;
    if (caminho) {
        const partes = caminho.split('/');
        for (const p of partes) {
            pastaHandle = await pastaHandle.getDirectoryHandle(p);
        }
    }

    try {
        if (tipo === 'arquivo') {
            const fh = await pastaHandle.getFileHandle(`${nome}.md`, { create: true });
            await renderizarEstrutura();
            abrirArquivo(fh);
        } else {
            await pastaHandle.getDirectoryHandle(nome, { create: true });
            await renderizarEstrutura();
        }
    } catch (err) { alert("Erro ao criar item."); }
};

// --- BACKUP JSON ---

btnExportar.onclick = async () => {
    const projeto = { nome: currentDirHandle.name, arquivos: [] };
    async function recursivo(handle, caminhoPai = "") {
        for await (const entry of handle.values()) {
            const caminho = caminhoPai ? `${caminhoPai}/${entry.name}` : entry.name;
            if (entry.kind === 'file' && entry.name.endsWith('.md')) {
                const file = await entry.getFile();
                projeto.arquivos.push({ caminho, conteudo: await file.text() });
            } else if (entry.kind === 'directory') await recursivo(entry, caminho);
        }
    }
    await recursivo(currentDirHandle);
    const blob = new Blob([JSON.stringify(projeto, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projeto.nome}_arca_backup.json`;
    a.click();
};

document.getElementById('btn-importar-json').onclick = () => inputJson.click();
inputJson.onchange = async (e) => {
    if (!currentDirHandle) return alert("Abra uma pasta de destino primeiro.");
    const reader = new FileReader();
    reader.onload = async (ev) => {
        const projeto = JSON.parse(ev.target.result);
        for (const item of projeto.arquivos) {
            const partes = item.caminho.split('/');
            const nomeArq = partes.pop();
            let pHandle = currentDirHandle;
            for (const p of partes) pHandle = await pHandle.getDirectoryHandle(p, { create: true });
            const fh = await pHandle.getFileHandle(nomeArq, { create: true });
            const wr = await fh.createWritable();
            await wr.write(item.conteudo);
            await wr.close();
        }
        alert("Importação concluída!");
        renderizarEstrutura();
    };
    reader.readAsText(e.target.files[0]);
};
