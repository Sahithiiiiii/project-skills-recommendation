FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Prisma Client generation reads the datasource configuration during the image build.
ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/pathforge
ENV NODE_ENV=production
ENV PORT=3000

RUN npx prisma generate
RUN npm run build --if-present

EXPOSE 3000

CMD ["npm", "start"]