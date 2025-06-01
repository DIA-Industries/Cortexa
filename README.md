# Cortexa: Multi-Agent Collaborative AI Chat Platform

[![GitHub Repo](https://img.shields.io/badge/github-repo-blue)](https://github.com/DIA-Industries/Cortexa)

## Overview

Cortexa is a cutting-edge platform enabling collaborative reasoning between multiple AI agents. Designed with extensibility and performance in mind, it integrates modern protocols for AI-to-AI communication and retrieval-augmented generation (RAG) to provide deep, contextual, and synthesized responses to user queries.

## Key Features

- **Multi-Agent Collaboration**: Multiple AI agents with distinct roles engage in discussions, challenge perspectives, and build consensus, delivering comprehensive and refined responses.
- **Threaded Conversations**: Structured, navigable threads allow users to follow conversation flows, track reasoning steps, and interject at any point.
- **Real-Time User Interaction**: WebSocket-powered updates and an intuitive interface let users observe and participate in agent deliberations live.
- **Retrieval-Augmented Generation (RAG)**: Integrates a FAISS vector database for efficient external knowledge retrieval, boosting agents’ contextual understanding.
- **Protocol Integrations**:
  - **Model Context Protocol (MCP)** for standardized data access
  - **Agent-to-Agent (A2A)** Protocol for seamless agent communication

## Architecture

### Backend

- **Framework**: FastAPI (Python)
- **Key Components**:
  - Agent Manager (coordinates agent tasks)
  - Thread Manager (organizes conversations)
  - Knowledge Retrieval (RAG with FAISS)
  - WebSocket endpoints for real-time updates

### Frontend

- **Framework**: React (TypeScript)
- **Features**:
  - Threaded conversation viewer
  - Real-time updates via WebSockets
  - Responsive design for desktop and mobile

### Vector Database

- **FAISS** is used for its:
  - Lowest average query latency (0.3453ms)
  - Minimal memory footprint (7.32MB for test data)
  - Fastest indexing and in-memory operation

## Validation & Performance

- **Comprehensive Testing**: All features (multi-agent, threading, RAG) validated with robust test suites
- **Latency**: RAG retrieval latency benchmarked at 13.79ms (well below 100ms target)

## Deployment

- **Docker Compose**: For local development and testing
- **AWS**: For scalable production deployments

See `docs/deployment_guide.md` for detailed instructions.

## Future Enhancements

- User authentication and personalized agent experiences
- Customizable agent roles
- Integration with more external knowledge sources
- Native mobile applications

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements or feature requests.

## License

_(Specify license here if available)_

## Contact

For questions or support, see the deployment guide or contact the maintainers via the repository.