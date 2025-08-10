# XAcademy FIFA — Players Manager

Aplicación fullstack para gestionar jugadores de FIFA (2015–2023) con sus skills y versiones anuales.

## Stack
- **Frontend**: Angular 16+ (standalone components), HttpClient, Chart.js
- **Backend**: NestJS, TypeORM, Class-Validator
- **DB**: MySQL 8
- **Infra**: Docker Compose

## Features
- Login (JWT) – todos los endpoints privados
- Listado paginado + filtros (nombre, club, posición)
- Exportar listado filtrado a **CSV**
- Detalle de jugador (Radar chart y Timeline por skill)
- Crear/Editar/Eliminar jugador
- Importar jugadores desde **CSV**
- CORS habilitado para el front local

## Requisitos
- Node 20+
- Docker + Docker Compose
- npm 10+

## Variables de entorno
Copiar `.env.example` a `.env` en la raíz:
