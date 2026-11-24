import "./style.css"

const API = "/api/materiais"
const tabela = document.getElementById("tabelaMateriais")
const formulario = document.getElementById("formMaterial")
const nome = document.getElementById("nome")
const categoria = document.getElementById("categoria")
const patrimonio = document.getElementById("patrimonio")
const status = document.getElementById("status")
const funcionario = document.getElementById("funcionario")

let paginaAtual = 1
let totalPaginas = 1
let idEdicao = null

formulario.addEventListener("submit", async (event) => {
    event.preventDefault()

    const material = {
        nome: nome.value.trim(),
        categoria: categoria.value.trim(),
        patrimonio: patrimonio.value.trim(),
        status: status.value,
        funcionario: funcionario.value.trim()
    }

    if (material.status === "Emprestado" && !material.funcionario) {
        return alert("Informe o funcionário")
    }

    if (material.status === "Disponivel") {
        material.funcionario = null
    }

    let res

    if (idEdicao === null) {
        res = await postMaterial(material)
    } else {
        res = await putMaterial(idEdicao, material)
    }

    if (!res.ok) return alert("Erro ao salvar material")

    formulario.reset()
    idEdicao = null
    formulario.querySelector("button").textContent = "Cadastrar material"

    getMateriais()
    atualizarIndicadores()
})

async function getMateriais() {
    const res = await fetch(`${API}?page=${paginaAtual}&limit=5`)
    const data = await res.json()

    if (!res.ok) return alert("Erro ao buscar materiais")

    totalPaginas = Math.max(1, data.totalPaginas)

    if (paginaAtual > totalPaginas) {
        paginaAtual = totalPaginas
        return getMateriais()
    }

    tabela.innerHTML = ""

    for (let i = 0; i < data.materiais.length; i++) {
        const material = data.materiais[i]
        const linha = tabela.insertRow()

        linha.insertCell().textContent = material.nome
        linha.insertCell().textContent = material.categoria || "-"
        linha.insertCell().textContent = material.patrimonio
        linha.insertCell().textContent = material.status
        linha.insertCell().textContent = material.funcionario || "-"

        const acoes = linha.insertCell()

        acoes.innerHTML = `
            <button class="btn-editar">Editar</button>
            <button class="btn-excluir">Excluir</button>
        `

        acoes.children[0].onclick = () => editarMaterial(material)
        acoes.children[1].onclick = () => deleteMaterial(material.id)
    }

    document.getElementById("infoPagina").textContent =
        `Página ${paginaAtual} de ${totalPaginas}`

    document.getElementById("anterior").disabled = paginaAtual === 1
    document.getElementById("proxima").disabled = paginaAtual === totalPaginas
}

async function postMaterial(material) {
    const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(material)
    })

    return res
}

async function putMaterial(id, material) {
    const res = await fetch(API + "/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(material)
    })

    return res
}

async function deleteMaterial(id) {
    if (!confirm("Deseja excluir o material?")) return

    const res = await fetch(API + "/" + id, {
        method: "DELETE"
    })

    if (!res.ok) return alert("Erro ao excluir")

    if (idEdicao === id) {
        formulario.reset()
        idEdicao = null
        formulario.querySelector("button").textContent = "Cadastrar material"
    }

    getMateriais()
    atualizarIndicadores()
}

function editarMaterial(material) {
    idEdicao = material.id

    nome.value = material.nome
    categoria.value = material.categoria || ""
    patrimonio.value = material.patrimonio
    status.value = material.status
    funcionario.value = material.funcionario || ""

    formulario.querySelector("button").textContent = "Salvar alterações"
}

async function atualizarIndicadores() {
    const res = await fetch(API + "?page=1&limit=100")
    const data = await res.json()

    if (!res.ok) return

    document.getElementById("total").textContent = data.totalRegistros
    document.getElementById("disponiveis").textContent =
        data.materiais.filter(m => m.status === "Disponivel").length

    document.getElementById("emprestados").textContent =
        data.materiais.filter(m => m.status === "Emprestado").length
}

document.getElementById("anterior").onclick = () => {
    if (paginaAtual > 1) {
        paginaAtual--
        getMateriais()
    }
}

document.getElementById("proxima").onclick = () => {
    if (paginaAtual < totalPaginas) {
        paginaAtual++
        getMateriais()
    }
}

getMateriais()
atualizarIndicadores()
