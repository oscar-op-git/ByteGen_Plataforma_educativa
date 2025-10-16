backend/
└─ src/
   ├─ index.ts               # punto de entrada
   ├─ app.ts                 # Configura Express y aplica middlewares/rutas
   ├─ routes/                # Rutas de la API (endpoints)
   │   └─ course.routes.ts
   ├─ controllers/           # Lógica de control (maneja requests/responses)
   │   └─ course.controller.ts
   ├─ models/                # Modelos de datos (Prisma, Mongoose o el ORM)
   │   └─ course.model.ts
   ├─ middlewares/           # (Opcional) Middlewares de autenticación o validación
   │   └─ auth.ts
   ├─ utils/                 # (Opcional) Funciones auxiliares
   │   └─ logger.ts
   └─ config/                # (Opcional) Config/env
       └─ env.ts
