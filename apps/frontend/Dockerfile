# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY tsconfig.json tsconfig.node.json vite.config.ts ./
COPY .eslintrc.cjs .prettierrc .prettierignore .eslintignore ./
COPY public ./public
COPY src ./src
RUN npm ci
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
