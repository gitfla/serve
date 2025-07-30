const reduceEmbeddings = async (embeddings: number[][], outputDim = 256): Promise<number[][]> => {
    const res = await fetch("https://pca-service-822718896837.southamerica-east1.run.app/pca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vectors: embeddings, output_dim: outputDim }),
    })

    if (!res.ok) throw new Error("PCA service failed")
    const data = await res.json()
    return data.vectors
}