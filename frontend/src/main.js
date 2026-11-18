
import "./style.css"

const API = "/api/materiais"

const formulario = document.getElementById("formMaterial")
const tabela = document.getElementById("tabelaMateriais")
const botaoSalvar = formulario.querySelector("button[type='submit']")

const anterior = document.getElementById("anterior")
const proxima = document.getElementById("proxima")
const infoPagina = document.getElementById("infoPagina")

let paginaAtual = 1
let totalPaginas = 1
let idEdicao = null

// Listar materiais
async function listarMateriais() {
    try {
        const resposta = await fetch(`${API}?page=${paginaAtual}&limit=5`)

        if (!resposta.ok) {
            throw new Error("Erro ao buscar materiais")
        }

        const dados = await resposta.json()

        totalPaginas = Math.max(1, Number(dados.totalPaginas) || 1)

        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas
            return listarMateriais()
        }

        tabela.innerHTML = ""

        dados.materiais.forEach(material => {
            const linha = document.createElement("tr")

            const campos = [
                material.nome,
                material.categoria,
                material.patrimonio,
                material.status,
                material.funcionario
            ]

            campos.forEach(valor => {
                const coluna = document.createElement("td")
                coluna.textContent = valor ?? "-"
                linha.appendChild(coluna)
            })

            const acoes = document.createElement("td")

            const editar = document.createElement("button")
            editar.textContent = "Editar"
            editar.className = "btn-editar"
            editar.addEventListener("click", () => editarMaterial(material))

            const excluir = document.createElement("button")
            excluir.textContent = "Excluir"
            excluir.className = "btn-excluir"
            excluir.addEventListener("click", () => excluirMaterial(material.id))

            acoes.append(editar, excluir)
            linha.appendChild(acoes)
            tabela.appendChild(linha)
        })

        infoPagina.textContent = `Página ${paginaAtual} de ${totalPaginas}`

        anterior.disabled = paginaAtual === 1
        proxima.disabled = paginaAtual === totalPaginas

    } catch (erro) {
        console.error(erro)
        alert("Erro ao carregar materiais")
    }
}

// Atualizar indicadores
async function atualizarIndicadores() {
    try {
        const resposta = await fetch(`${API}?limit=100`)

        if (!resposta.ok) {
            throw new Error("Erro ao buscar indicadores")
        }

        const dados = await resposta.json()

        document.getElementById("total").textContent = dados.totalRegistros

        document.getElementById("disponiveis").textContent =
            dados.materiais.filter(material => material.status === "Disponivel").length

        document.getElementById("emprestados").textContent =
            dados.materiais.filter(material => material.status === "Emprestado").length

    } catch (erro) {
        console.error(erro)
    }
}

// Cadastrar ou atualizar material
async function salvarMaterial(evento) {
    evento.preventDefault()

    const material = {
        nome: document.getElementById("nome").value.trim(),
        categoria: document.getElementById("categoria").value.trim(),
        patrimonio: document.getElementById("patrimonio").value.trim(),
        status: document.getElementById("status").value,
        funcionario: document.getElementById("funcionario").value.trim() || null
    }

    // Validar funcionário responsável
    if (material.status === "Emprestado" && !material.funcionario) {
        alert("Informe o funcionário responsável pelo empréstimo")
        document.getElementById("funcionario").focus()
        return
    }

    // Material disponível não possui responsável
    if (material.status === "Disponivel") {
        material.funcionario = null
    }

    const editando = idEdicao !== null
    const endereco = editando ? `${API}/${idEdicao}` : API
    const metodo = editando ? "PUT" : "POST"

    try {
        const resposta = await fetch(endereco, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(material)
        })

        const resultado = await resposta.json()

        if (!resposta.ok) {
            alert(resultado.mensagem || "Erro ao salvar material")
            return
        }

        alert(editando ? "Material atualizado!" : "Material cadastrado!")

        formulario.reset()
        idEdicao = null
        botaoSalvar.textContent = "Cadastrar material"

        if (!editando) {
            paginaAtual = 1
        }

        await listarMateriais()
        await atualizarIndicadores()

    } catch (erro) {
        console.error(erro)
        alert("Erro ao conectar com o servidor")
    }
}

// Editar material
function editarMaterial(material) {
    idEdicao = material.id

    document.getElementById("nome").value = material.nome
    document.getElementById("categoria").value = material.categoria ?? ""
    document.getElementById("patrimonio").value = material.patrimonio
    document.getElementById("status").value = material.status
    document.getElementById("funcionario").value = material.funcionario ?? ""

    botaoSalvar.textContent = "Salvar alterações"

    formulario.scrollIntoView({ behavior: "smooth" })
}

// Excluir material
async function excluirMaterial(id) {
    if (!confirm("Deseja realmente excluir este material?")) {
        return
    }

    try {
        const resposta = await fetch(`${API}/${id}`, {
            method: "DELETE"
        })

        if (!resposta.ok) {
            const erro = await resposta.json()
            alert(erro.mensagem || "Erro ao excluir material")
            return
        }

        if (idEdicao === id) {
            idEdicao = null
            formulario.reset()
            botaoSalvar.textContent = "Cadastrar material"
        }

        alert("Material excluído com sucesso!")

        await listarMateriais()
        await atualizarIndicadores()

    } catch (erro) {
        console.error(erro)
        alert("Erro ao conectar com o servidor")
    }
}

// Página anterior
anterior.addEventListener("click", () => {
    if (paginaAtual > 1) {
        paginaAtual--
        listarMateriais()
    }
})

// Próxima página
proxima.addEventListener("click", () => {
    if (paginaAtual < totalPaginas) {
        paginaAtual++
        listarMateriais()
    }
})

// Iniciar sistema
formulario.addEventListener("submit", salvarMaterial)

listarMateriais()
atualizarIndicadores()
