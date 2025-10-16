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



Prisma
Si no quieres que Prisma modifique tu DB (porque ya tienes tablas), puedes usar prisma db pull para leer el esquema existente:
    npx prisma db pull
    npx prisma generate

Con cada actualización importante en la rama (y siempre que halla error), ejecutar
    npx prisma generate


schema.prisma ---> ahí Prisma sabe qué tablas tienes y cómo se relacionan.


MIGRACIONES (se crean migraciones si y sólo si la base de datos está vacía). Los modelos que se encuentran en prisma del entorno actual, se llevan a la BD remota
        npx prisma migrate dev --name init


Si cambias la estructura (schema) de la base
    Ejemplo:
    Agregas o borras columnas.
    Cambias el nombre de una tabla.
    Creas una relación nueva.
    Modificas tipos de datos en Supabase.

        vuelve a ejecutar 
            npx prisma db pull
            npx prisma generate

