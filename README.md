# Serve

Serve is a full-stack web app for exploring conversations across a corpus of writers.

Users can select writers, start a conversation, and receive responses based on semantic similarity to the writers' source texts. The project experiments with embeddings, vector search, and conversational interfaces as a way to navigate literary material.

## Overview

The app combines a Next.js frontend with a Node/Express backend and a PostgreSQL database. Texts are embedded using Cohere, stored with vector representations, and retrieved based on similarity during the conversation flow.

The goal was to build a working product prototype around a simple question:

> What would it feel like to navigate a body of writing through conversation instead of search?

## Features

- Select writers and start a conversation
- Retrieve relevant passages using semantic similarity
- Let users contribute messages that influence the direction of the conversation
- Upload and manage source texts
- Manage writers and associated text corpora

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand

**Backend**
- Node.js
- Express
- TypeScript
- PostgreSQL
- Kysely
- Cohere embeddings
- Google Cloud Storage

**Deployment**
- Netlify (frontend)
- Google Cloud Run (backend)

## Project Structure

```
serve-app/
├── client/      # Next.js frontend
├── server/      # Node/Express backend
├── shared/      # Shared types and utilities
└── README.md
```

## Notes

This is an experimental product prototype focused on semantic retrieval, conversational UX, and full-stack application architecture.

Portfolio: https://flaviofiszman.com
