from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sklearn.decomposition import PCA
import numpy as np

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    logger.info("📩 /pca endpoint called")
    try:
        arr = np.array(req.embeddings)
        logger.info(f"📊 Input shape: {arr.shape}, requested components: {req.n_components}")

        pca = PCA(n_components=req.n_components)
        reduced = pca.fit_transform(arr)

        logger.info(f"✅ PCA reduction successful, output shape: {reduced.shape}")
        return reduced.tolist()
    except Exception as e:
        logger.exception("❌ Error during PCA reduction")
        return {"error": str(e)}
