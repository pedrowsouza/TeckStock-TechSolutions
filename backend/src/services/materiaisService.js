import { db } from "../config_db/connection.js"

export async function getAllMateriais(page = 1, limit = 10) {
    const offset = (page - 1) * limit

    const [materiais] = await db.query(
        "SELECT * FROM materiais ORDER BY id ASC LIMIT ? OFFSET ?",
        [limit, offset]
    )

    const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM materiais")

    return {
        paginaAtual: page,
        limite: limit,
        totalRegistros: total,
        totalPaginas: Math.ceil(total / limit),
        materiais
    }
}

export async function getMaterialById(id) {
    const [materiais] = await db.query("SELECT * FROM materiais WHERE id = ?", [id])

    return materiais[0] ?? null
}

export async function postMaterial(body) {
    const { nome, categoria = null, patrimonio, status = "Disponivel", funcionario = null } = body

    const [resultado] = await db.query(
        "INSERT INTO materiais (nome, categoria, patrimonio, status, funcionario) VALUES (?, ?, ?, ?, ?)",
        [nome, categoria, patrimonio, status, funcionario]
    )

    return getMaterialById(resultado.insertId)
}

export async function deleteMaterialService(id) {
    const [resultado] = await db.query("DELETE FROM materiais WHERE id = ?", [id])

    return resultado.affectedRows > 0
}

export async function putMaterialService(id, body) {
    const { nome, categoria = null, patrimonio, status = "Disponivel", funcionario = null } = body

    const [resultado] = await db.query(
        "UPDATE materiais SET nome = ?, categoria = ?, patrimonio = ?, status = ?, funcionario = ? WHERE id = ?",
        [nome, categoria, patrimonio, status, funcionario, id]
    )

    if (!resultado.affectedRows)
        return "Material não encontrado"

    return "Material atualizado com sucesso!"
}

export async function patchMaterialService(id, body) {
    const material = await getMaterialById(id)

    if (!material)
        return "Material não encontrado"

    const atualizado = { ...material, ...body }

    return putMaterialService(id, atualizado)
}