from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sklearn.decomposition import PCA
import numpy as np

app = FastAPI()

# Optional: allow CORS if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PCARequest(BaseModel):
    embeddings: list[list[float]]
    n_components: int = 256

@app.post("/pca")
async def reduce_embeddings(req: PCARequest):
    arr = np.array(req.embeddings)
    pca = PCA(n_components=req.n_components)
    reduced = pca.fit_transform(arr)
    return reduced.tolist()
