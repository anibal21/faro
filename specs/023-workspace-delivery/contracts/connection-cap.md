# Contract: Connection cap (max 2)

## Rule

`sessions.len() >= 2` and connect target not already in `sessions` → **reject**.

## FE

1. Pre-check `connectedIds.length >= 2` → open modal; do not call connect.
2. If race: handle backend error → same modal.

## Modal copy (ES)

- Title: `Límite de conexiones`
- Body: `Solo puedes tener dos ambientes conectados a la vez. Desconecta uno para abrir una conexión nueva.`
- Actions: `Entendido` (close). Optional secondary: none required.

## Non-goals

Picker to auto-disconnect another env inside the modal (user disconnects manually).
