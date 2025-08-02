// src/services/pca.service.ts
const PCA_URL = process.env.PCA_URL!    // e.g. https://your-domain.com/

export const reduceEmbeddings = async (embeddings: number[][], outputDim = 256): Promise<number[][]> => {
    const res = await fetch(`${PCA_URL}/pca`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeddings, output_dim: outputDim }),
    })

    if (!res.ok) throw new Error("PCA service failed")
    const data = await res.json()
    return data.vectors
}