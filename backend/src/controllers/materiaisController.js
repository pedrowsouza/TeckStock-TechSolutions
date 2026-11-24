import { getAllMateriais, getMaterialById, postMaterial, deleteMaterialService, putMaterialService, patchMaterialService } from "../services/materiaisService.js"

function validarMaterial(body) {
    if (!body.nome?.trim() || !body.patrimonio?.trim())
        return "Nome e número de série são obrigatórios"

    const funcionario = body.funcionario?.trim()
    const status = body.status ?? "Disponivel"

    if (status === "Emprestado" && !funcionario)
        return "Informe o funcionário responsável"

    if (status === "Disponivel" && funcionario)
        return "Materiais disponíveis não podem ter funcionário responsável"

    return null
}

export async function getAllMateriaisController(request, response) {
    const materiais = await getAllMateriais(Number(request.query.page ?? 1))

    return response.code(200).send(materiais)
}

export async function getMaterialByIdController(request, response) {
    const material = await getMaterialById(request.params.id)

    if (!material)
        return response.code(404).send({ mensagem: "Material não encontrado" })

    return response.code(200).send(material)
}

export async function postMaterialController(request, response) {
    const erro = validarMaterial(request.body)

    if (erro)
        return response.code(400).send({ mensagem: erro })

    const material = await postMaterial(request.body)

    return response.code(201).send(material)
}

export async function deleteMaterialController(request, response) {
    const excluido = await deleteMaterialService(request.params.id)

    if (!excluido)
        return response.code(404).send({ mensagem: "Material não encontrado" })

    return response.code(200).send({ mensagem: "Material excluído com sucesso!" })
}

export async function putMaterialController(request, response) {
    const mensagem = await putMaterialService(request.params.id, request.body)

    response.code(200).send({ mensagem: mensagem })
}

export async function patchMaterialController(request, response) {
    const mensagem = await patchMaterialService(request.params.id, request.body)

    response.code(200).send({ mensagem: mensagem })
}