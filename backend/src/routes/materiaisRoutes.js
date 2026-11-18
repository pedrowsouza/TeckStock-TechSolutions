import { getAllMateriaisController, getMaterialByIdController, postMaterialController, deleteMaterialController, putMaterialController, patchMaterialController } from "../controllers/materiaisController.js"

export async function materiaisRoutes(app) {
    // Listar materiais
    app.get("/", getAllMateriaisController)

    // Buscar material por ID
    app.get("/:id", getMaterialByIdController)

    // Cadastrar material
    app.post("/", postMaterialController)

    // Excluir material
    app.delete("/:id", deleteMaterialController)

    // Atualizar material completo
    app.put("/:id", putMaterialController)

    // Atualizar parcialmente
    app.patch("/:id", patchMaterialController)
}