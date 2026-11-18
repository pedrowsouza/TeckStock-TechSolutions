import Fastify from "fastify"
import { materiaisRoutes } from "./routes/materiaisRoutes.js"

export function buildApp() {
    const app = Fastify({ logger: true })

    app.get("/", async () => {
        return { mensagem: "TechSolutions funcionando!" }
    })

    app.register(materiaisRoutes, { prefix: "/materiais" })

    return app
}