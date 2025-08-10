# Documentación de Postman – XAcademy FIFA API

Este directorio contiene la colección y el entorno para probar la API del proyecto **XAcademy FIFA**.

---

## 📦 Archivos incluidos

1. **xacademy.postman_collection.json**  
   Contiene todos los endpoints de la API agrupados en carpetas (Auth, Players, Import/Export, etc.).

2. **xacademy_local.postman_environment.json**  
   Define las variables de entorno necesarias para ejecutar las requests de forma local (ejemplo: `baseUrl`, `token`).

---

## 🚀 Cómo importar en Postman

1. Abrir Postman.
2. Ir a **File → Import** o hacer clic en el botón **Import** arriba a la izquierda.
3. Seleccionar el archivo:
   - `xacademy.postman_collection.json` en **Collections**.
   - `xacademy_local.postman_environment.json` en **Environments**.
4. En la esquina superior derecha de Postman, elegir el entorno **xacademy_local**.
5. Si es la primera vez, ejecutar el request **Auth → Login** para obtener el token y guardarlo en la variable `token`.

---

## 📌 Notas

- El `baseUrl` en el entorno local está configurado como `http://localhost:8000` (cambiarlo si tu API corre en otro puerto).
- Si el token expira, volver a ejecutar el login y guardar el nuevo valor.
- La colección incluye ejemplos de carga de CSV, exportación de datos y operaciones CRUD sobre jugadores.

---

## 🛠 Mantenimiento

Si se agregan o cambian endpoints en la API, actualizar esta colección en Postman y volver a exportar el archivo `.json`.
