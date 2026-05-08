# Daimon Bridge

TypeScript bridge service. Low-latency I/O relay between the body and the agent.

**Spec**: https://www.notion.so/Daimon-35a6ad21e33880608e6dcd6eb481ce50

**Visibility**: public

## Stack

- TypeScript / Node.js 24+
- NestJS with Fastify HTTP adapter
- Drizzle ORM (Postgres + PGMQ access)
- Zod for runtime validation

## Role

Pure I/O routing. No agent logic, no LLM calls, no character.

- HTTP/WebSocket endpoints for the body
- Command queue (in-memory FIFO, capped at 8 slots per channel)
- Synchronous self-perception confirmation (`?wait_echo=true` pattern from the paper)
- Bundle current sensor snapshot into every output endpoint response
- Forward events to agent service via PGMQ

## Endpoints

Mirror the paper's design: `/sensor/now`, `/sensor/update`, `/haptic`, `/face`, `/beep`, `/command/poll`, `/beep/echo`, `/haptic/echo`, `/haptic/baseline`. See spec section 4.

## Communication

- Body to Bridge: HTTPS POST + long-poll
- Bridge to Agent: PGMQ async + HTTP for synchronous queries

## Style

- Plain English, no em dashes
- NestJS modules, dependency injection
- Strict types, Zod at boundaries
- Stateless where possible (state lives in Postgres)
