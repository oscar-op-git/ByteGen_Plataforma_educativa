backend/
└─ src/
   ├─ index.ts               # punto de entrada
   ├─ app.ts                 # Configura Express y aplica middlewares/rutas
   ├─ routes/                # Rutas de la API (endpoints) Cada archivo tiene un conjunto de endpoints relacionados.
   │   └─ course.routes.ts   # endpoints de cursos. (Pongan nombres que describan a su conjunto de endpoints)
   │   └─ user.routes.ts  
   ├─ controllers/           # Lógica de control (maneja requests/responses)
   │   └─ course.controller.ts
   ├─ models/                # (opcional) base de datos o datos en memoria
   │   └─ course.model.ts
   ├─ middlewares/           # (Opcional) Middlewares de autenticación o validación
   │   └─ auth.ts
   ├─ utils/                 # (Opcional) Funciones auxiliares
   │   └─ logger.ts
   └─ config/                # (Opcional) Config/env
       └─ env.ts



