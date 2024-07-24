# Импользуем образ линукс Alpine с версией node 14
FROM node:19.5.0-alpine

# Указываем нашу рабочую дерикторию 
WORKDIR /app


# Скопировать package json и package json lock внутрь контейнера
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install


# Копируем все остальное приложение
COPY . .

# Устанавливаем prisma
RUN npm install -g prisma


# Генерируем Prisma-client 
RUN prisma generate


# Копируем Prisma schema 
COPY prisma/schema.prisma ./prisma/


# Открываем порт в нашем контейнере
EXPOSE 5000


# Запускаем сервер
CMD [ "npm", "start" ]

