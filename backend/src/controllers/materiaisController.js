
import { getAllMateriais, getMaterialById, postMaterial, deleteMaterialService, putMaterialService, patchMaterialService } from "../services/materiaisService.js"

function validarId(id) {
    return Number.isSafeInteger(id) && id > 0
}

function validarMaterial(body, completo = true) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return "Dados inválidos"
    }

    const campos = ["nome", "categoria", "patrimonio", "status", "funcionario"]

    if (Object.keys(body).some(campo => !campos.includes(campo))) {
        return "Campo não permitido"
    }

    if (completo && (!body.nome || !body.patrimonio)) {
        return "Nome e Numero de serie são obrigatórios"
    }

    if (body.nome !== undefined &&
        (typeof body.nome !== "string" || !body.nome.trim() || body.nome.length > 150)) {
        return "Nome inválido"
    }

    if (body.patrimonio !== undefined &&
        (typeof body.patrimonio !== "string" || !body.patrimonio.trim() || body.patrimonio.length > 100)) {
        return "Numero de serie invalido"
    }

    if (body.categoria != null &&
        (typeof body.categoria !== "string" || body.categoria.length > 100)) {
        return "Categoria inválida"
    }

    if (body.funcionario != null &&
        (typeof body.funcionario !== "string" || body.funcionario.length > 150)) {
        return "Funcionário inválido"
    }

    if (body.status !== undefined &&
        !["Disponivel", "Emprestado"].includes(body.status)) {
        return "Status inválido"
    }

    if (completo && body.status === "Emprestado" && !body.funcionario?.trim()) {
        return "Informe o funcionário responsável "
    }

    if (completo && (body.status ?? "Disponivel") === "Disponivel" && body.funcionario?.trim()) {
        return "Materiais disponíveis não podem ter funcionário responsável"
    }

    return null
}

function tratarErro(request, response, erro) {
    request.log.error(erro)

    if (erro.code === "ER_DUP_ENTRY") {
        return response.code(409).send({ mensagem: "Este patrimônio já está cadastrado" })
    }

    return response.code(500).send({ mensagem: "Erro interno no servidor" })
}

export async function getAllMateriaisController(request, response) {
    const page = Number(request.query.page ?? 1)
    const limit = Number(request.query.limit ?? 10)
    const { nome, categoria, status } = request.query

    if (!validarId(page) || !validarId(limit) || limit > 100) {
        return response.code(400).send({ mensagem: "Página ou limite inválido" })
    }

    if ([nome, categoria, status].some(valor => valor !== undefined && typeof valor !== "string")) {
        return response.code(400).send({ mensagem: "Filtro inválido" })
    }

    if (status && !["Disponivel", "Emprestado"].includes(status)) {
        return response.code(400).send({ mensagem: "Status inválido" })
    }

    try {
        return await getAllMateriais(page, limit, { nome, categoria, status })
    } catch (erro) {
        return tratarErro(request, response, erro)
    }
}

export async function getMaterialByIdController(request, response) {
    const id = Number(request.params.id)

    if (!validarId(id)) {
        return response.code(400).send({ mensagem: "ID inválido" })
    }

    try {
        const material = await getMaterialById(id)

        if (!material) {
            return response.code(404).send({ mensagem: "Material não encontrado" })
        }

        return material
    } catch (erro) {
        return tratarErro(request, response, erro)
    }
}

export async function postMaterialController(request, response) {
    const erro = validarMaterial(request.body)

    if (erro) {
        return response.code(400).send({ mensagem: erro })
    }

    try {
        const material = await postMaterial(request.body)
        return response.code(201).send(material)
    } catch (erro) {
        return tratarErro(request, response, erro)
    }
}

export async function deleteMaterialController(request, response) {
    const id = Number(request.params.id)

    if (!validarId(id)) {
        return response.code(400).send({ mensagem: "ID inválido" })
    }

    try {
        const excluido = await deleteMaterialService(id)

        if (!excluido) {
            return response.code(404).send({ mensagem: "Material não encontrado" })
        }

        return { mensagem: "Material excluído com sucesso!" }
    } catch (erro) {
        return tratarErro(request, response, erro)
    }
}

export async function putMaterialController(request, response) {
    const id = Number(request.params.id)

    if (!validarId(id)) {
        return response.code(400).send({ mensagem: "ID inválido" })
    }

    const erro = validarMaterial(request.body)

    if (erro) {
        return response.code(400).send({ mensagem: erro })
    }

    try {
        const atualizado = await putMaterialService(id, request.body)

        if (!atualizado) {
            return response.code(404).send({ mensagem: "Material não encontrado" })
        }

        return await getMaterialById(id)
    } catch (erro) {
        return tratarErro(request, response, erro)
    }
}

export async function patchMaterialController(request, response) {
    const id = Number(request.params.id)

    if (!validarId(id)) {
        return response.code(400).send({ mensagem: "ID inválido" })
    }

    const erro = validarMaterial(request.body, false)

    if (erro) {
        return response.code(400).send({ mensagem: erro })
    }

    try {
        const material = await getMaterialById(id)

        if (!material) {
            return response.code(404).send({ mensagem: "Material não encontrado" })
        }

        const atualizado = { ...material, ...request.body }

        const erroFinal = validarMaterial({
            nome: atualizado.nome,
            categoria: atualizado.categoria,
            patrimonio: atualizado.patrimonio,
            status: atualizado.status,
            funcionario: atualizado.funcionario
        })

        if (erroFinal) {
            return response.code(400).send({ mensagem: erroFinal })
        }

        await patchMaterialService(id, request.body)

        return await getMaterialById(id)
    } catch (erro) {
        return tratarErro(request, response, erro)
    }
}
