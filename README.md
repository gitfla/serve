# Serve: AI-Powered Conversational Platform

## 🚀 Project Overview

"Serve" is an innovative full-stack application that simulates dynamic conversations among various writers, allowing users to actively participate and interact with their unique literary styles. By leveraging advanced natural language processing and semantic similarity, the platform intelligently constructs conversation flows based on the writers' bodies of work.

## ✨ Features

*   **Interactive Conversations**: Engage in real-time dialogues with AI-simulated writers.
*   **Semantic Similarity**: Conversations are driven by the semantic understanding of each writer's unique style and content.
*   **User Participation**: Users can contribute to the conversation, influencing its direction.
*   **Text Upload & Management**: Upload new texts, manage existing ones, and associate them with specific writers.
*   **Writer Management**: View and manage the roster of AI writers.

## ⚙️ Technical Overview & Project Structure

The application is built as a modern full-stack monorepo, designed for scalability and maintainability. It leverages a robust set of technologies to deliver its interactive AI capabilities.

### Key Technologies Used:

*   **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
*   **Backend**: Node.js, TypeScript, Express.js
*   **Database**: PostgreSQL (with Kysely ORM)
*   **AI/NLP**: Cohere API (for embeddings and language models)
*   **Cloud Storage**: Google Cloud Storage (GCS)
*   **Deployment**: Netlify (Frontend), Google Cloud Run (Backend)

### Detailed Structure:

```
serve-app/
├── client/                 # Frontend Application
│   ├── public/             # Static assets (images, favicons)
│   ├── src/                # Frontend source code
│   │   ├── app/            # Next.js App Router pages (e.g., /, /upload)
│   │   │   ├── services/   # Client-side API interaction logic (axios)
│   │   │   └── ...         # Other page-specific files
│   │   ├── components/     # Reusable UI components (including shadcn/ui)
│   │   ├── store/          # Zustand for client-side state management
│   │   └── types/          # Shared TypeScript type definitions for frontend data
│   ├── tailwind.config.ts  # Tailwind CSS configuration for the frontend
│   ├── postcss.config.cjs  # PostCSS configuration for Tailwind
│   └── package.json        # Frontend dependencies and scripts
├── server/                 # Backend Application
│   ├── src/                # Backend source code
│   │   ├── controllers/    # Handles HTTP requests, orchestrates service calls
│   │   ├── db/             # Database connection and schema definitions (Kysely)
│   │   ├── middlewares/    # Express middleware for request processing
│   │   ├── routes/         # Defines API endpoints and links to controllers
│   │   ├── services/       # Core business logic, external API integrations (Cohere, GCS)
│   │   └── utils/          # Utility functions and helpers
│   ├── Dockerfile          # Defines the Docker image for the backend service
│   └── package.json        # Backend dependencies and scripts
├── shared/                 # Code shared between client and server (e.g., common interfaces)
│   └── nextWriter.ts       # Example of shared type definition
├── serve-app-client-old/   # (Previous client project - kept for historical reference during migration)
└── README.md               # Project documentation (this file)
```

## 🚀 Deployment

This project is set up for continuous deployment, ensuring a smooth transition from development to production.

*   **Frontend Deployment (Netlify)**:
    *   The frontend application (`client/`) is automatically deployed via **Netlify's GitHub integration**.
    *   Any push to the main branch triggers a new build and deployment to a live URL.
    *   Configuration is handled through `netlify.toml` (if present) and Netlify's UI settings.

*   **Backend Deployment (Google Cloud Run)**:
    *   The backend application (`server/`) is deployed to **Google Cloud Run**.
    *   A **Git workflow** (e.g., GitHub Actions, GitLab CI/CD) is configured to trigger a Cloud Run deployment upon pushes to the main branch.
    *   This workflow typically involves:
        1.  Building the Docker image (`Dockerfile` in `server/`).
        2.  Pushing the image to Google Container Registry (or Artifact Registry).
        3.  Deploying the new image to a Cloud Run service.
    *   Example commands for manual deployment (as seen in your original README):
        ```bash
        # Build Docker image
        docker build -t pca-service .

        # Submit to Google Cloud Build and tag
        gcloud builds submit pca-service \
          --tag southamerica-east1-docker.pkg.dev/serve-353822/pca-service-repo/pca-service

        # Deploy to Cloud Run
        gcloud run deploy pca-service \
          --image=southamerica-east1-docker.pkg.dev/serve-353822/pca-service-repo/pca-service \
          --platform=managed \
          --region=southamerica-east1 \
          --allow-unauthenticated
        ```

## 🤝 Contributing

Feel free to explore, fork, and contribute to this project.

## 👤 Authors

*   **Flavio Fiszman**
    *   Email: flaviofiszman@gmail.com
    *   [Link to your LinkedIn/GitHub profile (optional)]

## 📄 License

This project is open source and available under the [License Name] License. (e.g., MIT License)